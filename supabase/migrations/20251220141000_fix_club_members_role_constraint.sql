-- Migration: Fix club_members role check constraint
-- Problem: 'owner' role is rejected by the check constraint
-- Solution: Update the check constraint to include 'owner'

-- Drop the existing constraint
ALTER TABLE club_members DROP CONSTRAINT IF EXISTS club_members_role_check;

-- Add the correct constraint that includes 'owner'
ALTER TABLE club_members 
    ADD CONSTRAINT club_members_role_check 
    CHECK (role IN ('owner', 'admin', 'moderator', 'member'));
