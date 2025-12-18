-- ============================================
-- Migration: Vendor Profiles
-- Created: 2025-12-19 04:25
-- Tables: vendor_profiles
-- ============================================

-- 1. 創建 vendor_profiles 表
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 基本資料
    display_name TEXT NOT NULL,
    bio TEXT,
    
    -- 位置
    location_name TEXT,
    location_address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- 分類
    categories TEXT[] DEFAULT '{}',
    
    -- 封面圖片
    cover_images TEXT[] DEFAULT '{}',
    
    -- 聯絡資訊
    contact_email TEXT,
    contact_phone TEXT,
    contact_website TEXT,
    
    -- 社群連結
    social_instagram TEXT,
    social_linkedin TEXT,
    social_threads TEXT,
    
    -- 服務項目 (JSONB)
    services JSONB DEFAULT '[]'::jsonb,
    
    -- 作品集 (JSONB)
    portfolio JSONB DEFAULT '[]'::jsonb,
    
    -- 價格範圍
    pricing_min INTEGER,
    pricing_max INTEGER,
    pricing_currency TEXT DEFAULT 'TWD',
    
    -- 設定
    allow_invitations BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT false,
    
    -- 時間戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 約束：每個用戶只能有一個 vendor profile
    UNIQUE(user_id)
);

-- 2. 創建索引
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_categories ON vendor_profiles USING GIN (categories);

-- 3. 啟用 RLS
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Anyone can view vendor profiles" ON vendor_profiles;
CREATE POLICY "Anyone can view vendor profiles"
    ON vendor_profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own profile" ON vendor_profiles;
CREATE POLICY "Users can manage their own profile"
    ON vendor_profiles FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. 權限
GRANT SELECT ON vendor_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_profiles TO authenticated;

-- 6. 觸發器：更新 updated_at
CREATE OR REPLACE FUNCTION update_vendor_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_vendor_profile_updated_at ON vendor_profiles;
CREATE TRIGGER trigger_vendor_profile_updated_at
    BEFORE UPDATE ON vendor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_profile_updated_at();

-- 7. 註釋
COMMENT ON TABLE vendor_profiles IS 'Vendor/供應商個人檔案';
