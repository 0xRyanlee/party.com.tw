-- Share Link Tracking Migration
-- Implements multi-channel referral tracking for events

-- 1. Create share_channels table for tracking different promotion channels
CREATE TABLE IF NOT EXISTS public.share_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "海報", "台卡", "Facebook", "LINE"
    code TEXT NOT NULL, -- unique referral code
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, code)
);

-- 2. Create share_link_clicks table for tracking click analytics
CREATE TABLE IF NOT EXISTS public.share_link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.share_channels(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- nullable for anonymous clicks
    ip_hash TEXT, -- hashed IP for deduplication
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create index for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_share_link_clicks_channel ON public.share_link_clicks(channel_id);
CREATE INDEX IF NOT EXISTS idx_share_link_clicks_event ON public.share_link_clicks(event_id);
CREATE INDEX IF NOT EXISTS idx_share_link_clicks_time ON public.share_link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_share_channels_event ON public.share_channels(event_id);

-- 4. Create view for channel analytics summary
CREATE OR REPLACE VIEW public.share_channel_analytics AS
SELECT 
    sc.id AS channel_id,
    sc.event_id,
    sc.name AS channel_name,
    sc.code,
    sc.created_at,
    COUNT(DISTINCT slc.id) AS total_clicks,
    COUNT(DISTINCT slc.user_id) AS unique_users,
    COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN r.id END) AS registrations
FROM public.share_channels sc
LEFT JOIN public.share_link_clicks slc ON sc.id = slc.channel_id
LEFT JOIN public.registrations r ON r.event_id = sc.event_id 
    AND r.registration_source = CONCAT('ref_', sc.code)
GROUP BY sc.id, sc.event_id, sc.name, sc.code, sc.created_at;

-- 5. Enable RLS
ALTER TABLE public.share_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_link_clicks ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for share_channels
CREATE POLICY "Event organizers can manage share channels" ON public.share_channels
    FOR ALL
    USING (
        event_id IN (
            SELECT id FROM public.events WHERE organizer_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view share channels for public events" ON public.share_channels
    FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM public.events WHERE status = 'active' AND is_public = true
        )
    );

-- 7. RLS Policies for share_link_clicks
CREATE POLICY "Event organizers can view click analytics" ON public.share_link_clicks
    FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM public.events WHERE organizer_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert clicks" ON public.share_link_clicks
    FOR INSERT
    WITH CHECK (true);

-- 8. Add registration_source column to registrations if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'registrations' 
        AND column_name = 'registration_source'
    ) THEN
        -- Column already exists from previous migration
        NULL;
    END IF;
END $$;

-- 9. Function to track share link click
CREATE OR REPLACE FUNCTION public.track_share_link_click(
    p_channel_code TEXT,
    p_event_id UUID,
    p_ip_hash TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_channel_id UUID;
    v_click_id UUID;
BEGIN
    -- Find channel by code
    SELECT id INTO v_channel_id
    FROM public.share_channels
    WHERE code = p_channel_code AND event_id = p_event_id;
    
    IF v_channel_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Insert click record
    INSERT INTO public.share_link_clicks (
        channel_id,
        event_id,
        user_id,
        ip_hash,
        user_agent,
        referrer
    ) VALUES (
        v_channel_id,
        p_event_id,
        auth.uid(),
        p_ip_hash,
        p_user_agent,
        p_referrer
    )
    RETURNING id INTO v_click_id;
    
    RETURN v_click_id;
END;
$$;

-- 10. Grant execute on function
GRANT EXECUTE ON FUNCTION public.track_share_link_click TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_share_link_click TO anon;

COMMENT ON TABLE public.share_channels IS '分享通路設定 - 用於追蹤不同推廣渠道的效果';
COMMENT ON TABLE public.share_link_clicks IS '分享連結點擊紀錄 - 用於分析轉化率';
COMMENT ON VIEW public.share_channel_analytics IS '通路分析摘要視圖 - 顯示各通路的點擊與轉化數據';
