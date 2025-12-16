-- Migration: Add ultra tier and set admin user
-- Purpose: Add ultra tier type and configure ryan910814@gmail.com as ultra admin

-- 1. Add 'ultra' to the user_tier_type enum
DO $$
BEGIN
    -- Check if 'ultra' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ultra' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier_type')
    ) THEN
        ALTER TYPE user_tier_type ADD VALUE 'ultra';
    END IF;
END$$;

-- 2. Set ryan910814@gmail.com as ultra tier and admin role
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'ryan910814@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- Update profile role to admin
        UPDATE public.profiles
        SET role = 'admin',
            updated_at = NOW()
        WHERE id = v_user_id;

        -- Update or insert tier to ultra
        INSERT INTO user_tiers (user_id, tier)
        VALUES (v_user_id, 'ultra')
        ON CONFLICT (user_id) 
        DO UPDATE SET tier = 'ultra', updated_at = NOW();

        RAISE NOTICE 'Successfully set ryan910814@gmail.com as ultra admin';
    ELSE
        RAISE NOTICE 'User ryan910814@gmail.com not found. Will be set on first login.';
    END IF;
END$$;

-- 3. Update get_tier_limits function to include ultra tier
CREATE OR REPLACE FUNCTION get_tier_limits(tier_type user_tier_type)
RETURNS TABLE (
    max_events_per_month INTEGER,
    max_attendees_per_event INTEGER,
    can_create_private_events BOOLEAN,
    can_feature_events BOOLEAN,
    can_export_attendees BOOLEAN
) AS $$
BEGIN
    RETURN QUERY SELECT
        CASE tier_type
            WHEN 'free' THEN 2
            WHEN 'plus' THEN 10
            WHEN 'pro' THEN 50
            WHEN 'ultra' THEN 9999
        END::INTEGER,
        CASE tier_type
            WHEN 'free' THEN 30
            WHEN 'plus' THEN 100
            WHEN 'pro' THEN 500
            WHEN 'ultra' THEN 9999
        END::INTEGER,
        CASE tier_type
            WHEN 'free' THEN FALSE
            WHEN 'plus' THEN TRUE
            WHEN 'pro' THEN TRUE
            WHEN 'ultra' THEN TRUE
        END,
        CASE tier_type
            WHEN 'free' THEN FALSE
            WHEN 'plus' THEN FALSE
            WHEN 'pro' THEN TRUE
            WHEN 'ultra' THEN TRUE
        END,
        CASE tier_type
            WHEN 'free' THEN FALSE
            WHEN 'plus' THEN TRUE
            WHEN 'pro' THEN TRUE
            WHEN 'ultra' THEN TRUE
        END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_tier_limits IS 'Returns limits for a given tier type (free/plus/pro/ultra)';
