-- Refined Migration: Add check-in code to registrations table
-- Note: checked_in and checked_in_at already exist in 007_create_registrations_table.sql

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS checkin_code TEXT UNIQUE;

-- Function to generate a random uppercase 6-character code
CREATE OR REPLACE FUNCTION generate_checkin_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Avoid confusing chars like O, 0, I, 1
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger to automatically assign a checkin_code on creation if not provided
CREATE OR REPLACE FUNCTION tr_assign_checkin_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.checkin_code IS NULL THEN
    NEW.checkin_code := generate_checkin_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_checkin_code ON public.registrations;
CREATE TRIGGER trigger_assign_checkin_code
BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION tr_assign_checkin_code();

COMMENT ON COLUMN public.registrations.checkin_code IS 'Unique 6-char code for event check-in';
