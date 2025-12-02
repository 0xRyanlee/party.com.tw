-- ==========================================
-- RLS Policies for Events and Related Tables
-- Migration 005: Row Level Security
-- Date: 2025-12-02
-- ==========================================

-- 1. Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Events Policies

-- 所有人可查看已發布的活動
CREATE POLICY "Public events are viewable by everyone"
ON public.events
FOR SELECT
USING (status = 'published');

-- 創建者可查看自己的所有活動（包括草稿）
CREATE POLICY "Users can view their own events"
ON public.events
FOR SELECT
USING (auth.uid() = organizer_id);

-- 已登入用戶可創建活動
CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

-- 創建者可更新自己的活動
CREATE POLICY "Users can update their own events"
ON public.events
FOR UPDATE
USING (auth.uid() = organizer_id)
WITH CHECK (auth.uid() = organizer_id);

-- 創建者可刪除自己的活動
CREATE POLICY "Users can delete their own events"
ON public.events
FOR DELETE
USING (auth.uid() = organizer_id);

-- ==========================================
-- 3. Event Roles Policies
-- ==========================================

-- Enable RLS
ALTER TABLE public.event_roles ENABLE ROW LEVEL SECURITY;

-- 所有人可查看角色需求（透過已發布的活動）
CREATE POLICY "Event roles are viewable for published events"
ON public.event_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_roles.event_id
    AND events.status = 'published'
  )
);

-- 活動創建者可查看自己活動的所有角色
CREATE POLICY "Event organizers can view their event roles"
ON public.event_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_roles.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- 活動創建者可管理角色
CREATE POLICY "Event organizers can manage roles"
ON public.event_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_roles.event_id
    AND events.organizer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_roles.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- ==========================================
-- 4. Event Resources Policies
-- ==========================================

-- Enable RLS
ALTER TABLE public.event_resources ENABLE ROW LEVEL SECURITY;

-- 所有人可查看資源需求（透過已發布的活動）
CREATE POLICY "Event resources are viewable for published events"
ON public.event_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_resources.event_id
    AND events.status = 'published'
  )
);

-- 活動創建者可查看自己活動的所有資源
CREATE POLICY "Event organizers can view their event resources"
ON public.event_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_resources.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- 活動創建者可管理資源
CREATE POLICY "Event organizers can manage resources"
ON public.event_resources
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_resources.event_id
    AND events.organizer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_resources.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- ==========================================
-- 5. Add organizer_id column if not exists
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
        ALTER TABLE public.events ADD COLUMN organizer_id uuid REFERENCES auth.users(id);
        CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
    END IF;
END $$;

-- ==========================================
-- 6. Add registered_count column if not exists
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'registered_count') THEN
        ALTER TABLE public.events ADD COLUMN registered_count integer DEFAULT 0;
    END IF;
END $$;

-- ==========================================
-- 完成
-- ==========================================
