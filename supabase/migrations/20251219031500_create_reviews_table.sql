-- ============================================
-- Migration: 互評系統 (Reviews)
-- Created: 2025-12-19 03:15
-- Tables: reviews
-- ============================================

-- 1. 創建評價類型 ENUM
DO $$ BEGIN
    CREATE TYPE review_type AS ENUM ('event', 'host', 'attendee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 創建評價狀態 ENUM
DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. 創建 reviews 表
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 評價對象
    review_type review_type NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    reviewed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 評價者
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 評價內容
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    
    -- 狀態
    status review_status NOT NULL DEFAULT 'approved',
    
    -- 元數據
    is_anonymous BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    
    -- 時間戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 約束：同一用戶對同一對象只能評價一次
    UNIQUE NULLS NOT DISTINCT (reviewer_id, event_id, reviewed_user_id, review_type)
);

-- 4. 創建索引
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type_status ON reviews(review_type, status);

-- 5. 啟用 RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews"
    ON reviews FOR SELECT
    USING (status = 'approved');

DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;
CREATE POLICY "Users can view their own reviews"
    ON reviews FOR SELECT
    USING (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND reviewer_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (reviewer_id = auth.uid())
    WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (reviewer_id = auth.uid());

-- 7. 權限
GRANT SELECT ON reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- 8. 觸發器：更新 events.review_count
CREATE OR REPLACE FUNCTION update_event_review_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.event_id IS NOT NULL THEN
        UPDATE events SET review_count = review_count + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' AND OLD.event_id IS NOT NULL THEN
        UPDATE events SET review_count = GREATEST(0, review_count - 1) WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_event_review_count ON reviews;
CREATE TRIGGER trigger_update_event_review_count
    AFTER INSERT OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_event_review_count();

-- 9. 註釋
COMMENT ON TABLE reviews IS '互評系統 - 用戶對活動/主辦方/參與者的評價';
