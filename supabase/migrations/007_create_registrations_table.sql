-- Migration: Create registrations table
-- Description: Table for storing event registrations and attendee information

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Registration details
    status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'rejected', 'cancelled', 'waitlist')),
    ticket_type_id text,
    
    -- Attendee information
    attendee_name text NOT NULL,
    attendee_email text NOT NULL,
    attendee_phone text,
    
    -- Questionnaire responses (if event has custom questions)
    questionnaire_answers jsonb DEFAULT '{}'::jsonb,
    
    -- Check-in tracking
    checked_in boolean DEFAULT false,
    checked_in_at timestamp with time zone,
    checked_in_by uuid REFERENCES auth.users(id),
    
    -- Waitlist management
    waitlist_position integer,
    waitlist_notified_at timestamp with time zone,
    
    -- Metadata
    registration_source text, -- 'web', 'mobile', 'admin'
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    UNIQUE(event_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_checked_in ON public.registrations(checked_in);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registrations

-- 1. Users can view their own registrations
CREATE POLICY "Users can view own registrations"
    ON public.registrations
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Event organizers can view all registrations for their events
CREATE POLICY "Organizers can view event registrations"
    ON public.registrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = registrations.event_id
            AND events.organizer_id = auth.uid()
        )
    );

-- 3. Authenticated users can create registrations
CREATE POLICY "Authenticated users can register"
    ON public.registrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own registrations (cancel)
CREATE POLICY "Users can update own registrations"
    ON public.registrations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Event organizers can update registrations for their events
CREATE POLICY "Organizers can update event registrations"
    ON public.registrations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = registrations.event_id
            AND events.organizer_id = auth.uid()
        )
    );

-- 6. Event organizers can delete registrations for their events
CREATE POLICY "Organizers can delete event registrations"
    ON public.registrations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = registrations.event_id
            AND events.organizer_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update event registered_count
CREATE OR REPLACE FUNCTION update_event_registered_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.events
        SET registered_count = registered_count + 1
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events
        SET registered_count = GREATEST(0, registered_count - 1)
        WHERE id = OLD.event_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Handle status changes (e.g., confirmed -> cancelled)
        IF OLD.status IN ('confirmed', 'pending') AND NEW.status IN ('cancelled', 'rejected') THEN
            UPDATE public.events
            SET registered_count = GREATEST(0, registered_count - 1)
            WHERE id = NEW.event_id;
        ELSIF OLD.status IN ('cancelled', 'rejected') AND NEW.status IN ('confirmed', 'pending') THEN
            UPDATE public.events
            SET registered_count = registered_count + 1
            WHERE id = NEW.event_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update event registered_count
CREATE TRIGGER update_event_count_on_registration
    AFTER INSERT OR UPDATE OR DELETE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_registered_count();
