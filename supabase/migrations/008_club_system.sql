-- Club System Enhancement Migration
-- Implements Club A Plan + Discussion Board
-- 方案 A：精簡版 + 公共留言板討論串

-- ============================================
-- 1. 擴展 clubs 表
-- ============================================
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS club_type TEXT DEFAULT 'public'
    CHECK (club_type IN ('public', 'private', 'vendor'));
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- 2. 擴展 club_members 表
-- ============================================
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- 確保 role 欄位有正確的值
ALTER TABLE club_members 
    DROP CONSTRAINT IF EXISTS club_members_role_check;
ALTER TABLE club_members 
    ADD CONSTRAINT club_members_role_check 
    CHECK (role IN ('owner', 'admin', 'moderator', 'member'));

-- ============================================
-- 3. Club 討論板（公共留言板）
-- ============================================
CREATE TABLE IF NOT EXISTS club_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- 內容
    content TEXT NOT NULL,
    
    -- 多身份支援（可選擇匿名或使用暱稱）
    display_mode TEXT DEFAULT 'real' CHECK (display_mode IN ('real', 'nickname', 'anonymous')),
    display_name TEXT, -- 快取的顯示名稱
    
    -- 回覆結構（支援巢狀）
    parent_id UUID REFERENCES club_discussions(id) ON DELETE CASCADE,
    reply_count INTEGER DEFAULT 0,
    
    -- 互動統計
    like_count INTEGER DEFAULT 0,
    
    -- 狀態
    is_pinned BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    
    -- 時間戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. 討論互動（按讚）
-- ============================================
CREATE TABLE IF NOT EXISTS club_discussion_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES club_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(discussion_id, user_id)
);

-- ============================================
-- 5. 活動與 Club 關聯
-- ============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id);

-- ============================================
-- 6. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clubs_owner ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_type ON clubs(club_type);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_discussions_club ON club_discussions(club_id);
CREATE INDEX IF NOT EXISTS idx_club_discussions_author ON club_discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_club_discussions_parent ON club_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_events_club ON events(club_id);

-- ============================================
-- 7. 成員計數觸發器
-- ============================================
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clubs SET member_count = member_count + 1, updated_at = NOW() 
        WHERE id = NEW.club_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clubs SET member_count = GREATEST(member_count - 1, 0), updated_at = NOW() 
        WHERE id = OLD.club_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_club_member_count ON club_members;
CREATE TRIGGER trigger_update_club_member_count
    AFTER INSERT OR DELETE ON club_members
    FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- ============================================
-- 8. 回覆計數觸發器
-- ============================================
CREATE OR REPLACE FUNCTION update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE club_discussions SET reply_count = reply_count + 1, updated_at = NOW()
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE club_discussions SET reply_count = GREATEST(reply_count - 1, 0), updated_at = NOW()
        WHERE id = OLD.parent_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_discussion_reply_count ON club_discussions;
CREATE TRIGGER trigger_update_discussion_reply_count
    AFTER INSERT OR DELETE ON club_discussions
    FOR EACH ROW EXECUTE FUNCTION update_discussion_reply_count();

-- ============================================
-- 9. 按讚計數觸發器
-- ============================================
CREATE OR REPLACE FUNCTION update_discussion_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE club_discussions SET like_count = like_count + 1
        WHERE id = NEW.discussion_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE club_discussions SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.discussion_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_discussion_like_count ON club_discussion_likes;
CREATE TRIGGER trigger_update_discussion_like_count
    AFTER INSERT OR DELETE ON club_discussion_likes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_like_count();

-- ============================================
-- 10. RLS 政策 - Clubs
-- ============================================
-- 所有人可查看公開 Club
DROP POLICY IF EXISTS "Anyone can view public clubs" ON clubs;
CREATE POLICY "Anyone can view public clubs"
    ON clubs FOR SELECT
    USING (club_type = 'public' OR owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM club_members cm WHERE cm.club_id = clubs.id AND cm.user_id = auth.uid()
    ));

-- Owner 可管理 Club
DROP POLICY IF EXISTS "Owner can manage club" ON clubs;
CREATE POLICY "Owner can manage club"
    ON clubs FOR ALL
    USING (owner_id = auth.uid());

-- ============================================
-- 11. RLS 政策 - Club Members
-- ============================================
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- 會員可查看同 Club 成員
DROP POLICY IF EXISTS "Members can view club_members" ON club_members;
CREATE POLICY "Members can view club_members"
    ON club_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM club_members cm 
        WHERE cm.club_id = club_members.club_id 
        AND cm.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM clubs c 
        WHERE c.id = club_members.club_id 
        AND c.owner_id = auth.uid()
    ));

-- 用戶可加入 public Club
DROP POLICY IF EXISTS "Users can join public clubs" ON club_members;
CREATE POLICY "Users can join public clubs"
    ON club_members FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_id AND c.club_type = 'public')
    );

-- 用戶可離開 Club
DROP POLICY IF EXISTS "Users can leave clubs" ON club_members;
CREATE POLICY "Users can leave clubs"
    ON club_members FOR DELETE
    USING (user_id = auth.uid());

-- Owner/Admin 可管理成員
DROP POLICY IF EXISTS "Admins can manage members" ON club_members;
CREATE POLICY "Admins can manage members"
    ON club_members FOR ALL
    USING (EXISTS (
        SELECT 1 FROM club_members cm
        WHERE cm.club_id = club_members.club_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    ));

-- ============================================
-- 12. RLS 政策 - Discussions
-- ============================================
ALTER TABLE club_discussions ENABLE ROW LEVEL SECURITY;

-- Club 成員可查看討論
DROP POLICY IF EXISTS "Members can view discussions" ON club_discussions;
CREATE POLICY "Members can view discussions"
    ON club_discussions FOR SELECT
    USING (NOT is_hidden AND EXISTS (
        SELECT 1 FROM club_members cm
        WHERE cm.club_id = club_discussions.club_id
        AND cm.user_id = auth.uid()
    ));

-- 成員可發布討論
DROP POLICY IF EXISTS "Members can post discussions" ON club_discussions;
CREATE POLICY "Members can post discussions"
    ON club_discussions FOR INSERT
    WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM club_members cm
            WHERE cm.club_id = club_discussions.club_id
            AND cm.user_id = auth.uid()
        )
    );

-- 作者可編輯/刪除自己的討論
DROP POLICY IF EXISTS "Authors can edit own discussions" ON club_discussions;
CREATE POLICY "Authors can edit own discussions"
    ON club_discussions FOR UPDATE
    USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own discussions" ON club_discussions;
CREATE POLICY "Authors can delete own discussions"
    ON club_discussions FOR DELETE
    USING (author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM club_members cm
        WHERE cm.club_id = club_discussions.club_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin', 'moderator')
    ));

-- ============================================
-- 13. RLS 政策 - Likes
-- ============================================
ALTER TABLE club_discussion_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can like discussions" ON club_discussion_likes;
CREATE POLICY "Users can like discussions"
    ON club_discussion_likes FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unlike discussions" ON club_discussion_likes;
CREATE POLICY "Users can unlike discussions"
    ON club_discussion_likes FOR DELETE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view likes" ON club_discussion_likes;
CREATE POLICY "Anyone can view likes"
    ON club_discussion_likes FOR SELECT
    USING (true);

-- ============================================
-- 14. 權限
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON clubs TO authenticated;
GRANT SELECT, INSERT, DELETE ON club_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON club_discussions TO authenticated;
GRANT SELECT, INSERT, DELETE ON club_discussion_likes TO authenticated;

-- ============================================
-- 15. 註釋
-- ============================================
COMMENT ON TABLE club_discussions IS 'Club 公共討論區，支援巢狀回覆和多身份顯示';
COMMENT ON TABLE club_discussion_likes IS 'Club 討論按讚記錄';
COMMENT ON COLUMN club_discussions.display_mode IS 'real=真實姓名, nickname=自定義暱稱, anonymous=匿名';
