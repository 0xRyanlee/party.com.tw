-- Migration: Add image_metadata column to events and banners
-- Created to support structured image asset architecture

-- Add image_metadata to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_metadata jsonb DEFAULT '{}'::jsonb;
COMMENT ON COLUMN public.events.image_metadata IS 'Structured metadata for image assets including alt text, focus keywords, and dynamic resizing parameters.';

-- Add image_metadata to banners
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS image_metadata jsonb DEFAULT '{}'::jsonb;
COMMENT ON COLUMN public.banners.image_metadata IS 'Structured metadata for banner images including alt text and positioning.';
