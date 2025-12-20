-- Migration: Fix infinite recursion in club_members RLS policies
-- Problem: Policies on club_members reference club_members causing recursion
-- Solution: Use simpler policies that don't self-reference

-- ============================================
-- 1. Drop problematic policies
-- ============================================
DROP POLICY IF EXISTS "Members can view club_members" ON club_members;
DROP POLICY IF EXISTS "Admins can manage members" ON club_members;
DROP POLICY IF EXISTS "Users can join public clubs" ON club_members;
DROP POLICY IF EXISTS "Users can leave clubs" ON club_members;

-- ============================================
-- 2. Create fixed policies
-- ============================================

-- Users can view their own membership
CREATE POLICY "Users can view own membership"
    ON club_members FOR SELECT
    USING (user_id = auth.uid());

-- Club owners can view all members of their clubs
CREATE POLICY "Owners can view club members"
    ON club_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clubs c
            WHERE c.id = club_members.club_id
            AND c.owner_id = auth.uid()
        )
    );

-- Users can insert their own membership (join clubs)
CREATE POLICY "Users can join clubs"
    ON club_members FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND (
            -- Can join public clubs
            EXISTS (
                SELECT 1 FROM clubs c
                WHERE c.id = club_id
                AND c.club_type = 'public'
            )
            -- Or is the owner creating their own membership
            OR EXISTS (
                SELECT 1 FROM clubs c
                WHERE c.id = club_id
                AND c.owner_id = auth.uid()
            )
        )
    );

-- Users can delete their own membership (leave clubs)
CREATE POLICY "Users can leave clubs"
    ON club_members FOR DELETE
    USING (user_id = auth.uid());

-- Club owners can manage (update/delete) all members
CREATE POLICY "Owners can manage members"
    ON club_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clubs c
            WHERE c.id = club_members.club_id
            AND c.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can remove members"
    ON club_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clubs c
            WHERE c.id = club_members.club_id
            AND c.owner_id = auth.uid()
        )
    );

-- ============================================
-- 3. Fix clubs policies if needed
-- ============================================
DROP POLICY IF EXISTS "Anyone can view public clubs" ON clubs;
DROP POLICY IF EXISTS "Anyone can view clubs" ON clubs;
DROP POLICY IF EXISTS "Owner can manage club" ON clubs;

-- Anyone can view public clubs
CREATE POLICY "View public clubs"
    ON clubs FOR SELECT
    USING (club_type = 'public' OR owner_id = auth.uid());

-- Authenticated users can create clubs
CREATE POLICY "Create clubs"
    ON clubs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Owners can update their clubs
CREATE POLICY "Update own clubs"
    ON clubs FOR UPDATE
    USING (owner_id = auth.uid());

-- Owners can delete their clubs
CREATE POLICY "Delete own clubs"
    ON clubs FOR DELETE
    USING (owner_id = auth.uid());
