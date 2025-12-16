-- Create base clubs and club_members tables
-- This migration must be run BEFORE 008_club_system.sql

-- ============================================
-- 1. Base clubs table
-- ============================================
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Base club_members table
-- ============================================
CREATE TABLE IF NOT EXISTS club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(club_id, user_id)
);

-- ============================================
-- 3. Enable RLS
-- ============================================
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Base RLS Policies
-- ============================================
-- Public clubs are viewable by everyone
CREATE POLICY "Anyone can view clubs"
    ON clubs FOR SELECT
    USING (true);

-- Authenticated users can create clubs
CREATE POLICY "Authenticated users can create clubs"
    ON clubs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Owner can update/delete their club
CREATE POLICY "Owner can update club"
    ON clubs FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete club"
    ON clubs FOR DELETE
    USING (owner_id = auth.uid());

-- ============================================
-- 5. Grants
-- ============================================
GRANT SELECT ON clubs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON clubs TO authenticated;
GRANT SELECT, INSERT, DELETE ON club_members TO authenticated;

-- ============================================
-- 6. Comments
-- ============================================
COMMENT ON TABLE clubs IS 'Community groups for organizing events';
COMMENT ON TABLE club_members IS 'Membership records for clubs';
