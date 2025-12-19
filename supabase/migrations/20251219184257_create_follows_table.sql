-- Migration: Create follows table
-- Tracks user follow relationships with organizers (profiles)

CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Prevent duplicate follows
    UNIQUE(follower_id, following_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own following" ON public.follows;
CREATE POLICY "Users can view their own following"
    ON public.follows FOR SELECT
    USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Anyone can see who is followed" ON public.follows;
CREATE POLICY "Anyone can see who is followed"
    ON public.follows FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can follow/unfollow" ON public.follows;
CREATE POLICY "Users can follow/unfollow"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can remove their own follows"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;

-- Comments
COMMENT ON TABLE public.follows IS '用戶關注主辦方的關係表';
