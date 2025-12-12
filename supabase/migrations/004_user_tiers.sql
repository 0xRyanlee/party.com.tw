-- User Tiers Migration
-- Implements Free/Plus membership tiers with activity limits

-- Create enum for tier types
CREATE TYPE user_tier_type AS ENUM ('free', 'plus', 'pro');

-- Create user_tiers table
CREATE TABLE IF NOT EXISTS user_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier user_tier_type NOT NULL DEFAULT 'free',
    
    -- Subscription metadata
    subscription_id TEXT, -- External subscription ID (e.g., Stripe)
    subscription_status TEXT, -- active, cancelled, past_due
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    
    -- Usage tracking
    events_created_this_month INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_tiers_user_id ON user_tiers(user_id);
CREATE INDEX idx_user_tiers_tier ON user_tiers(tier);

-- Create function to auto-create free tier for new users
CREATE OR REPLACE FUNCTION create_default_user_tier()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_tiers (user_id, tier)
    VALUES (NEW.id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create tier when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_tier();

-- Function to get tier limits
CREATE OR REPLACE FUNCTION get_tier_limits(tier_type user_tier_type)
RETURNS TABLE (
    max_events INTEGER,
    max_capacity INTEGER,
    has_advanced_ticketing BOOLEAN,
    has_collaboration BOOLEAN,
    has_full_analytics BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE tier_type
            WHEN 'free' THEN 1
            WHEN 'plus' THEN 5
            WHEN 'pro' THEN 999
        END as max_events,
        CASE tier_type
            WHEN 'free' THEN 50
            WHEN 'plus' THEN 500
            WHEN 'pro' THEN 9999
        END as max_capacity,
        CASE tier_type
            WHEN 'free' THEN FALSE
            ELSE TRUE
        END as has_advanced_ticketing,
        CASE tier_type
            WHEN 'free' THEN FALSE
            ELSE TRUE
        END as has_collaboration,
        CASE tier_type
            WHEN 'free' THEN FALSE
            WHEN 'plus' THEN TRUE
            WHEN 'pro' THEN TRUE
        END as has_full_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create event
CREATE OR REPLACE FUNCTION can_create_event(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier user_tier_type;
    v_events_count INTEGER;
    v_max_events INTEGER;
BEGIN
    -- Get user tier
    SELECT tier INTO v_tier
    FROM user_tiers
    WHERE user_id = p_user_id;
    
    -- If no tier found, default to free
    IF v_tier IS NULL THEN
        v_tier := 'free';
    END IF;
    
    -- Get current active events count
    SELECT COUNT(*) INTO v_events_count
    FROM events
    WHERE host_id = p_user_id
    AND status NOT IN ('cancelled', 'completed', 'archived');
    
    -- Get tier limit
    SELECT max_events INTO v_max_events
    FROM get_tier_limits(v_tier);
    
    RETURN v_events_count < v_max_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_tiers
    SET 
        events_created_this_month = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tier"
    ON user_tiers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tier metadata"
    ON user_tiers FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admin can manage all tiers (you'll need to implement admin role check)
CREATE POLICY "Admins can manage all tiers"
    ON user_tiers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT, UPDATE ON user_tiers TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_limits(user_tier_type) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_event(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE user_tiers IS 'Stores user membership tier information and usage tracking';
COMMENT ON FUNCTION get_tier_limits IS 'Returns limits for a given tier type';
COMMENT ON FUNCTION can_create_event IS 'Checks if user can create a new event based on their tier';
