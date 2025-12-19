-- ==========================================
-- Chatroom System (Room 303)
-- ==========================================

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'system')),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Enable Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 3. RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is event participant (within window)
CREATE OR REPLACE FUNCTION public.is_chatroom_accessible(check_event_id uuid)
RETURNS boolean AS $$
DECLARE
    event_start timestamp with time zone;
    event_end timestamp with time zone;
    is_organizer boolean;
    is_participant boolean;
BEGIN
    -- Get event times
    SELECT start_time, end_time, (organizer_id = auth.uid()) 
    INTO event_start, event_end, is_organizer
    FROM public.events 
    WHERE id = check_event_id;

    -- If organizer, they always have access (even after window, but only read-only if we handle that in application layer or separate select policy)
    IF is_organizer THEN
        RETURN true;
    END IF;

    -- Check if confirmed participant
    SELECT EXISTS (
        SELECT 1 FROM public.registrations 
        WHERE event_id = check_event_id 
        AND user_id = auth.uid() 
        AND status = 'confirmed'
    ) INTO is_participant;

    IF NOT is_participant THEN
        RETURN false;
    END IF;

    -- Check window: [start - 24h, end + 24h]
    RETURN (now() >= (event_start - interval '24 hours') AND now() <= (event_end + interval '24 hours'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT Policy
-- Participants within window, OR Organizers anytime
CREATE POLICY "Users can view messages if they have access."
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = messages.event_id
            AND (
                e.organizer_id = auth.uid() -- Host has permanent access
                OR (
                    EXISTS (
                        SELECT 1 FROM public.registrations r
                        WHERE r.event_id = messages.event_id
                        AND r.user_id = auth.uid()
                        AND r.status = 'confirmed'
                    )
                    AND now() >= (e.start_time - interval '24 hours')
                    AND now() <= (e.end_time + interval '24 hours')
                )
            )
        )
    );

-- INSERT Policy
-- Only within window for everyone (including host)
CREATE POLICY "Users can insert messages during active window."
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = messages.event_id
            AND (
                e.organizer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.registrations r
                    WHERE r.event_id = messages.event_id
                    AND r.user_id = auth.uid()
                    AND r.status = 'confirmed'
                )
            )
            AND now() >= (e.start_time - interval '24 hours')
            AND now() <= (e.end_time + interval '24 hours')
        )
    );

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_event_id ON public.messages(event_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
