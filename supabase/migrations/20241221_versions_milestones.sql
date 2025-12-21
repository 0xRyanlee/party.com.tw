-- Version Updates Table
-- 版本更新記錄（管理員可編輯，用戶端可見）

CREATE TABLE IF NOT EXISTS version_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'feature', -- 'feature', 'fix', 'improvement', 'breaking'
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_version_updates_created_at ON version_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_version_updates_is_published ON version_updates(is_published);

-- RLS
ALTER TABLE version_updates ENABLE ROW LEVEL SECURITY;

-- 所有人可讀已發布的版本
CREATE POLICY "Anyone can read published versions" ON version_updates
    FOR SELECT
    USING (is_published = true);

-- Admin 完全控制
CREATE POLICY "Admins have full access" ON version_updates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 預設數據
INSERT INTO version_updates (version, title, description, type, is_published, published_at) VALUES
('2.2.0', '活動 UI/UX 優化與行程時間線', '活動詳情頁移除重複報名按鈕、緊湊化佈局。新增「行程時間線」頁面。', 'feature', true, NOW()),
('2.1.0', '俱樂部系統與 KOL 身份驗證', '俱樂部創建動效。KOL 身份申請頁面。', 'feature', true, NOW() - INTERVAL '1 day'),
('2.0.0', '票夾與導航重構', '全新導航結構。票夾頁面管理所有票券。', 'feature', true, NOW() - INTERVAL '2 days'),
('1.2.0', 'Admin 後台全面重構', '推播通知、里程碑管理、版本更新管理。', 'feature', true, NOW() - INTERVAL '3 days');

COMMENT ON TABLE version_updates IS '版本更新記錄';

---

-- Milestones Table
-- 里程碑追蹤

CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'user', -- 'user', 'content', 'tech', 'business'
    target_value INTEGER NOT NULL DEFAULT 1,
    current_value INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_milestones_category ON milestones(category);
CREATE INDEX IF NOT EXISTS idx_milestones_is_completed ON milestones(is_completed);

-- RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Admin 完全控制
CREATE POLICY "Admins have full access to milestones" ON milestones
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 預設里程碑
INSERT INTO milestones (title, description, category, target_value, current_value, is_completed) VALUES
('首位用戶註冊', '平台迎來第一位註冊用戶', 'user', 1, 0, false),
('100 位用戶', '累計 100 位註冊用戶', 'user', 100, 0, false),
('1000 位用戶', '突破千人大關', 'user', 1000, 0, false),
('首場活動發布', '平台發布第一場活動', 'content', 1, 0, false),
('50 場活動', '累計 50 場活動', 'content', 50, 0, false),
('首筆報名', '第一筆活動報名', 'business', 1, 0, false),
('100 筆報名', '累計 100 筆報名', 'business', 100, 0, false),
('首位 KOL 認證', '第一位 KOL 通過認證', 'user', 1, 0, false),
('正式上線', '平台正式對外營運', 'tech', 1, 0, false),
('API 穩定運行 30 天', 'API 連續穩定運行 30 天無重大故障', 'tech', 30, 0, false);

COMMENT ON TABLE milestones IS '平台發展里程碑';
