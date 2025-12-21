-- Migration: Add requirements field to events table
-- Created: 2024-12-21
-- Description: Add requirements array field for participant conditions

-- Add requirements column
ALTER TABLE events ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN events.requirements IS 'Participant requirements like "18+", "Bring your own camera", etc.';
