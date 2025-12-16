-- Migration: Add source fields to events table
-- Purpose: Track where event data originated from for compliance and user reference

-- Add source_url column for linking to original event page
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS source_url text;

-- Add source_name column for displaying source name (e.g., "Meetup", "Facebook", "Accupass")
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS source_name text;

-- Add comment for documentation
COMMENT ON COLUMN public.events.source_url IS 'Original URL where this event was sourced from';
COMMENT ON COLUMN public.events.source_name IS 'Name of the platform where this event was sourced from (e.g., Meetup, Facebook, Accupass)';
