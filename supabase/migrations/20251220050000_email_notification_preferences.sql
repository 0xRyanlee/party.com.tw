-- Email Notification Preferences
-- Adds columns to control email notification preferences for events and registrations

-- 1. Add send_email_notifications to events table
-- Host can opt-in/out of sending emails to attendees
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS send_email_notifications BOOLEAN DEFAULT true;

-- 2. Add receive_notifications to registrations table  
-- Attendees can opt-in/out of receiving event notifications
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS receive_notifications BOOLEAN DEFAULT true;

-- 3. Comments
COMMENT ON COLUMN public.events.send_email_notifications IS '主辦方是否向報名者發送郵件通知';
COMMENT ON COLUMN public.registrations.receive_notifications IS '參加者是否接收活動郵件通知';
