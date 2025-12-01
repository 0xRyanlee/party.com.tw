-- ==========================================
-- Event Schema MVP Extensions
-- 在現有 events 表基礎上新增 MVP 所需欄位
-- ==========================================

-- 新增 MVP 必要欄位到 events 表
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS description_short text,
  ADD COLUMN IF NOT EXISTS description_long text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'canceled')),
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'zh',
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS organizer_name text,
  ADD COLUMN IF NOT EXISTS organizer_avatar text,
  ADD COLUMN IF NOT EXISTS organizer_verified boolean DEFAULT false,
  
  -- Time fields enhancements
  ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS end_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Taipei',
  
  -- Location enhancements
  ADD COLUMN IF NOT EXISTS venue_name text,
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
  ADD COLUMN IF NOT EXISTS gender_limit text DEFAULT 'none' CHECK (gender_limit IN ('none', 'male_only', 'female_only', 'ratio_1_1')),
  ADD COLUMN IF NOT EXISTS age_min integer,
  ADD COLUMN IF NOT EXISTS age_max integer,
  ADD COLUMN IF NOT EXISTS invitation_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_questionnaire boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS questionnaire_fields jsonb DEFAULT '[]'::jsonb,
  
  -- Vibe & Social
  ADD COLUMN IF NOT EXISTS vibe_type text CHECK (vibe_type IN ('relax', 'networking', 'dating', 'hobby', 'nightlife', 'music', 'sport')),
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS mood_tags text[],
  ADD COLUMN IF NOT EXISTS event_rules text,
  ADD COLUMN IF NOT EXISTS allow_comment boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS attendee_list_visibility text DEFAULT 'public' CHECK (attendee_list_visibility IN ('public', 'friends_only', 'hidden')),
  
  -- Interaction
  ADD COLUMN IF NOT EXISTS pre_event_chatroom boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS post_event_chatroom boolean DEFAULT false,
  
  -- Post-event
  ADD COLUMN IF NOT EXISTS rating_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS attendee_rating_score numeric,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  
  -- Extra fields for convenience
  ADD COLUMN IF NOT EXISTS include_meal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS category text;

-- Update existing columns to match new schema
UPDATE public.events SET
  venue_name = location_name,
  cover_image = image_url,
  start_time = (date + time)::timestamp with time zone,
  capacity_total = capacity,
  capacity_remaining = capacity - registered_count
WHERE start_time IS NULL;

-- Create index for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_vibe_type ON public.events(vibe_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- JSONB indexes for array fields
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_events_mood_tags ON public.events USING GIN(mood_tags);
CREATE INDEX IF NOT EXISTS idx_events_ticket_types ON public.events USING GIN(ticket_types);

-- ==========================================
-- Advanced Extensions (Optional - Phase 2)
-- ==========================================

-- 這些欄位可以在 Phase 2 再加入
/*
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS gallery_images text[],
  ADD COLUMN IF NOT EXISTS recurring_rule text,
  ADD COLUMN IF NOT EXISTS checkin_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS entrance_close_time timestamp with time zone,
  
  -- Venue details
  ADD COLUMN IF NOT EXISTS venue_id uuid,
  ADD COLUMN IF NOT EXISTS address_detail text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS google_maps_link text,
  ADD COLUMN IF NOT EXISTS transportation_info text,
  ADD COLUMN IF NOT EXISTS parking_info text,
  ADD COLUMN IF NOT EXISTS indoor boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS venue_capacity integer,
  
  -- Advanced ticketing
  ADD COLUMN IF NOT EXISTS service_fee_rate numeric,
  ADD COLUMN IF NOT EXISTS tax_rate numeric,
  ADD COLUMN IF NOT EXISTS invoice_type text CHECK (invoice_type IN ('electronic', 'receipt', 'none')),
  
  -- Security & Legal
  ADD COLUMN IF NOT EXISTS age_restricted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS safety_notice text,
  ADD COLUMN IF NOT EXISTS disclaimer_text text,
  ADD COLUMN IF NOT EXISTS photography_consent_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  
  -- Marketing
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[],
  ADD COLUMN IF NOT EXISTS social_share_image text,
  ADD COLUMN IF NOT EXISTS ugc_hashtag text,
  
  -- System/Admin
  ADD COLUMN IF NOT EXISTS nsfw_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS risk_level text CHECK (risk_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS manual_review_required boolean DEFAULT false;
*/

-- ==========================================
-- Separate Tables for Complex Objects (Phase 2 Option)
-- ==========================================

-- Option: 將票種拆分為獨立表（更標準的關聯式設計）

/*
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  ticket_name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'TWD',
  original_price numeric,
  discount_rate numeric,
  stock_total integer NOT NULL,
  stock_remaining integer NOT NULL,
  min_purchase integer,
  max_purchase integer,
  is_refundable boolean DEFAULT false,
  refund_deadline timestamp with time zone,
  transferable boolean DEFAULT false,
  checkin_type text DEFAULT 'qr' CHECK (checkin_type IN ('qr', 'nfc', 'name_list')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Tickets
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event tickets are viewable by everyone."
  ON public.event_tickets FOR SELECT
  USING ( true );

CREATE POLICY "Event organizers can manage tickets."
  ON public.event_tickets FOR ALL
  USING ( 
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_tickets.event_id 
      AND events.organizer_id = auth.uid()
    )
  );
*/

-- ==========================================
-- Sponsor Table (Advanced - Phase 3)
-- ==========================================

/*
CREATE TABLE IF NOT EXISTS public.event_sponsors (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  logo text,
  description text,
  tier text CHECK (tier IN ('title', 'gold', 'silver', 'bronze')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
*/

-- ==========================================
-- Helper Functions
-- ==========================================

-- 自動計算剩餘座位數
CREATE OR REPLACE FUNCTION update_capacity_remaining()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events
  SET capacity_remaining = capacity_total - registered_count
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: 當新報名時自動更新 capacity_remaining
DROP TRIGGER IF EXISTS trigger_update_capacity ON public.registrations;
CREATE TRIGGER trigger_update_capacity
  AFTER INSERT OR DELETE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_capacity_remaining();

-- ==========================================
-- Data Migration (if needed)
-- ==========================================

-- 將現有 type 欄位映射到 category
UPDATE public.events SET category = type WHERE category IS NULL;

-- 設定預設的 status
UPDATE public.events SET status = 'published' WHERE status IS NULL;

-- ==========================================
--  Comments for documentation
-- ==========================================

COMMENT ON COLUMN public.events.ticket_types IS 'JSONB array storing ticket type objects: [{ticketId, ticketName, price, stockTotal, ...}]';
COMMENT ON COLUMN public.events.questionnaire_fields IS 'JSONB array storing custom questionnaire fields';
COMMENT ON COLUMN public.events.vibe_type IS 'Event atmosphere type: relax, networking, dating, hobby, nightlife, music, sport';
COMMENT ON COLUMN public.events.include_meal IS 'Whether the event includes meal';
