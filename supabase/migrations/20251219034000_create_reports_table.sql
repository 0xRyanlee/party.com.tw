-- ============================================
-- Migration: 檢舉/反饋系統 (Reports)
-- Created: 2025-12-19 03:40
-- Tables: reports
-- ============================================

-- 1. 創建報告類型 ENUM
DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('report', 'feedback', 'collaboration');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 創建報告狀態 ENUM
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. 創建 reports 表
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 類型和分類
    report_type report_type NOT NULL,
    category TEXT NOT NULL,
    
    -- 內容
    content TEXT NOT NULL,
    contact_email TEXT,
    
    -- 提交者（可匿名）
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 被舉報對象（選填）
    target_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 附件
    attachments TEXT[] DEFAULT '{}',
    
    -- 處理狀態
    status report_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    
    -- 時間戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 創建索引
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);

-- 5. 啟用 RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- 任何人都可以提交報告
DROP POLICY IF EXISTS "Anyone can create reports" ON reports;
CREATE POLICY "Anyone can create reports"
    ON reports FOR INSERT
    WITH CHECK (true);

-- 用戶只能查看自己的報告
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (reporter_id = auth.uid());

-- Admin 可以查看所有報告（通過 user_tiers 檢查）
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_tiers 
            WHERE user_id = auth.uid() 
            AND tier = 'ultra'
        )
    );

-- Admin 可以更新報告狀態
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_tiers 
            WHERE user_id = auth.uid() 
            AND tier = 'ultra'
        )
    );

-- 7. 權限
GRANT INSERT ON reports TO anon;
GRANT SELECT, INSERT ON reports TO authenticated;

-- 8. 註釋
COMMENT ON TABLE reports IS '檢舉/反饋/合作申請系統';
