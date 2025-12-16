-- ============================================
-- Party Taiwan - 一鍵執行 Migration
-- 請在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- 1. 添加 events 表的來源欄位
-- ============================================
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS source_url text;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS source_name text;

COMMENT ON COLUMN public.events.source_url IS 'Original URL where this event was sourced from';
COMMENT ON COLUMN public.events.source_name IS 'Name of the platform where this event was sourced from';


-- 2. 添加 ultra tier 類型
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ultra' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier_type')
    ) THEN
        ALTER TYPE user_tier_type ADD VALUE 'ultra';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- user_tier_type 不存在，跳過
        RAISE NOTICE 'user_tier_type enum does not exist, skipping ultra tier addition';
END$$;


-- 3. 設置 ryan910814@gmail.com 為 ultra 管理員
-- ============================================
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'ryan910814@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- 更新 profiles 為 admin
        UPDATE public.profiles
        SET role = 'admin',
            updated_at = NOW()
        WHERE id = v_user_id;

        -- 嘗試更新 user_tiers（如果表存在）
        BEGIN
            INSERT INTO user_tiers (user_id, tier)
            VALUES (v_user_id, 'ultra')
            ON CONFLICT (user_id) 
            DO UPDATE SET tier = 'ultra', updated_at = NOW();
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'user_tiers table does not exist, skipping tier update';
        END;

        RAISE NOTICE 'Successfully set ryan910814@gmail.com as ultra admin';
    ELSE
        RAISE NOTICE 'User ryan910814@gmail.com not found';
    END IF;
END$$;


-- 4. 更新 get_tier_limits 函數以包含 ultra
-- ============================================
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


-- ============================================
-- 執行完成！
-- ============================================
SELECT 'Migration completed successfully!' AS result;
