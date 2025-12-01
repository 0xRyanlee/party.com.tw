-- ==========================================
-- Event Schema Update - Aligned with Form Refactoring
-- 更新 events 表以匹配表單組件的最新設計
-- Date: 2024-12-01
-- ==========================================

-- 1. 先進行數據遷移（在刪除欄位之前）
-- 將舊的 age_min/age_max 轉換為 is_adult_only（如果欄位存在）
DO $$
BEGIN
    -- 添加新欄位（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'is_adult_only') THEN
        ALTER TABLE public.events ADD COLUMN is_adult_only boolean DEFAULT false;
    END IF;

    -- 如果舊欄位存在，進行數據遷移
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'age_min') THEN
        UPDATE public.events 
        SET is_adult_only = true 
        WHERE age_min >= 18 OR age_max >= 18;
    END IF;
END $$;

-- 2. 移除不再使用的欄位
ALTER TABLE public.events 
  DROP COLUMN IF EXISTS age_min,
  DROP COLUMN IF EXISTS age_max,
  DROP COLUMN IF EXISTS gender_limit,
  DROP COLUMN IF EXISTS vibe_type,
  DROP COLUMN IF EXISTS theme,
  DROP COLUMN IF EXISTS mood_tags;

-- 3. 新增其他簡化的欄位
ALTER TABLE public.events 
  -- 邀請碼（替代單純的 invitation_only boolean）
  ADD COLUMN IF NOT EXISTS invitation_code text,
  
  -- 統一的標籤系統（替代 vibe_type, theme, mood_tags）
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

-- 4. 保留/確保存在的重要欄位
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS description_short text,
  ADD COLUMN IF NOT EXISTS description_long text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'zh',
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS organizer_name text,
  ADD COLUMN IF NOT EXISTS organizer_avatar text,
  ADD COLUMN IF NOT EXISTS organizer_verified boolean DEFAULT false,
  
  -- Time fields
  ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS end_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Taipei',
  
  -- Location
  ADD COLUMN IF NOT EXISTS venue_name text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Taiwan',
  ADD COLUMN IF NOT EXISTS gps_lat double precision,
  ADD COLUMN IF NOT EXISTS gps_lng double precision,
  
  -- Ticketing
  ADD COLUMN IF NOT EXISTS ticket_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ticket_sale_start timestamp with time zone,
  ADD COLUMN IF NOT EXISTS ticket_sale_end timestamp with time zone,
  ADD COLUMN IF NOT EXISTS allow_waitlist boolean DEFAULT false,
  
  -- Participant Constraints
  ADD COLUMN IF NOT EXISTS capacity_total integer,
  ADD COLUMN IF NOT EXISTS capacity_remaining integer,
  ADD COLUMN IF NOT EXISTS invitation_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_questionnaire boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS questionnaire_fields jsonb DEFAULT '[]'::jsonb,
  
  -- Social
  ADD COLUMN IF NOT EXISTS event_rules text,
  ADD COLUMN IF NOT EXISTS allow_comment boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS attendee_list_visibility text DEFAULT 'public',
  
  -- Interaction
  ADD COLUMN IF NOT EXISTS pre_event_chatroom boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS post_event_chatroom boolean DEFAULT false,
  
  -- Post-event
  ADD COLUMN IF NOT EXISTS rating_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS attendee_rating_score numeric,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  
  -- Extra
  ADD COLUMN IF NOT EXISTS include_meal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS category text;

-- 5. 添加約束（如果需要）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_status_check') THEN
        ALTER TABLE public.events ADD CONSTRAINT events_status_check 
        CHECK (status IN ('draft', 'published', 'closed', 'canceled'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_attendee_list_visibility_check') THEN
        ALTER TABLE public.events ADD CONSTRAINT events_attendee_list_visibility_check 
        CHECK (attendee_list_visibility IN ('public', 'friends_only', 'hidden'));
    END IF;
END $$;

-- 6. 創建索引
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_adult_only ON public.events(is_adult_only);
CREATE INDEX IF NOT EXISTS idx_events_invitation_only ON public.events(invitation_only);

-- GIN 索引用於陣列和 JSONB 查詢
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_events_ticket_types ON public.events USING GIN(ticket_types);

-- 7. Trigger: 自動更新 capacity_remaining
CREATE OR REPLACE FUNCTION update_capacity_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.capacity_total IS NOT NULL THEN
    NEW.capacity_remaining := NEW.capacity_total - COALESCE(NEW.registered_count, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_capacity ON public.events;
CREATE TRIGGER trigger_update_capacity
BEFORE INSERT OR UPDATE OF capacity_total, registered_count
ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_capacity_remaining();

-- 8. 註解說明
COMMENT ON COLUMN public.events.is_adult_only IS '18+ 成人限定活動';
COMMENT ON COLUMN public.events.invitation_code IS '邀請碼（若 invitation_only 為 true）';
COMMENT ON COLUMN public.events.tags IS '活動標籤陣列，包含類型、主題、氛圍、特色等';
COMMENT ON COLUMN public.events.ticket_types IS 'JSONB 陣列，每個票種包含 name, price, quantity, include_meal 等';

-- ==========================================
-- 完成
-- ==========================================
