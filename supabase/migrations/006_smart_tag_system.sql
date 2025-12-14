-- 智能標籤系統 Migration
-- Smart Tag Inference System for Party.com.tw
-- 平台核心功能：自動匹配從屬包含關係的 tag 串

-- ============================================
-- 1. 智能標籤規則表
-- ============================================
CREATE TABLE IF NOT EXISTS tag_inference_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_tag TEXT NOT NULL,           -- 觸發標籤（用戶選擇的）
    implied_tags TEXT[] NOT NULL,       -- 自動添加的標籤
    rule_type TEXT DEFAULT 'implies',   -- implies: 暗示, requires: 必須, excludes: 排斥
    priority INTEGER DEFAULT 0,         -- 優先級（用於衝突解決）
    is_active BOOLEAN DEFAULT true,     -- 是否啟用
    description TEXT,                   -- 規則說明
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 約束
    CONSTRAINT valid_rule_type CHECK (rule_type IN ('implies', 'requires', 'excludes'))
);

-- ============================================
-- 2. 預設規則 - 酒精/夜生活類
-- ============================================
INSERT INTO tag_inference_rules (source_tag, implied_tags, description) VALUES
    ('bar', ARRAY['18+', 'nightlife'], '酒吧類活動自動添加 18+ 和夜生活標籤'),
    ('barhopping', ARRAY['18+', 'bar', 'nightlife', 'social'], '酒吧巡禮活動'),
    ('club', ARRAY['18+', 'nightlife', 'music', 'party'], '夜店活動'),
    ('wine-tasting', ARRAY['18+', 'food', 'social'], '品酒活動'),
    ('beer-festival', ARRAY['18+', 'food', 'outdoor'], '啤酒節'),
    ('cocktail-class', ARRAY['18+', 'workshop', 'social'], '調酒課程'),
    ('alcohol-run', ARRAY['18+', 'sport', 'outdoor'], '酒精路跑活動');

-- ============================================
-- 3. 預設規則 - 運動類
-- ============================================
INSERT INTO tag_inference_rules (source_tag, implied_tags, description) VALUES
    ('basketball', ARRAY['sport', 'indoor'], '籃球比賽'),
    ('soccer', ARRAY['sport', 'outdoor'], '足球活動'),
    ('hiking', ARRAY['sport', 'outdoor', 'nature'], '健行活動'),
    ('yoga', ARRAY['sport', 'wellness', 'indoor'], '瑜伽活動'),
    ('running', ARRAY['sport', 'outdoor'], '跑步活動'),
    ('cycling', ARRAY['sport', 'outdoor'], '自行車活動'),
    ('swimming', ARRAY['sport', 'outdoor'], '游泳活動'),
    ('tennis', ARRAY['sport', 'outdoor'], '網球活動'),
    ('badminton', ARRAY['sport', 'indoor'], '羽毛球活動'),
    ('volleyball', ARRAY['sport'], '排球活動'),
    ('gym', ARRAY['sport', 'indoor', 'fitness'], '健身房活動'),
    ('crossfit', ARRAY['sport', 'indoor', 'fitness'], 'CrossFit 活動'),
    ('martial-arts', ARRAY['sport', 'indoor'], '武術/格鬥運動');

-- ============================================
-- 4. 預設規則 - 社交/學習類
-- ============================================
INSERT INTO tag_inference_rules (source_tag, implied_tags, description) VALUES
    ('language-exchange', ARRAY['cafe', 'social', 'learning'], '語言交換活動'),
    ('book-club', ARRAY['reading', 'cafe', 'social'], '讀書會'),
    ('startup-pitch', ARRAY['networking', 'tech', 'business'], '創業提案活動'),
    ('networking', ARRAY['social', 'business'], '商務社交'),
    ('meetup', ARRAY['social'], '聚會活動'),
    ('workshop', ARRAY['learning'], '工作坊'),
    ('seminar', ARRAY['learning', 'indoor'], '研討會'),
    ('hackathon', ARRAY['tech', 'learning', 'indoor'], '黑客松');

-- ============================================
-- 5. 預設規則 - 娛樂/藝文類
-- ============================================
INSERT INTO tag_inference_rules (source_tag, implied_tags, description) VALUES
    ('concert', ARRAY['music', 'entertainment'], '演唱會'),
    ('live-music', ARRAY['music', 'entertainment'], '現場音樂'),
    ('art-exhibition', ARRAY['art', 'culture', 'indoor'], '藝術展覽'),
    ('movie-night', ARRAY['entertainment', 'indoor'], '電影之夜'),
    ('karaoke', ARRAY['music', 'entertainment', 'indoor'], 'KTV/卡拉OK'),
    ('comedy-show', ARRAY['entertainment', 'indoor'], '喜劇表演'),
    ('theater', ARRAY['art', 'culture', 'indoor'], '戲劇表演'),
    ('photography', ARRAY['art', 'outdoor'], '攝影活動');

-- ============================================
-- 6. 預設規則 - 美食類
-- ============================================
INSERT INTO tag_inference_rules (source_tag, implied_tags, description) VALUES
    ('brunch', ARRAY['food', 'social'], '早午餐聚會'),
    ('cooking-class', ARRAY['food', 'workshop', 'indoor'], '烹飪課程'),
    ('food-tour', ARRAY['food', 'outdoor', 'social'], '美食探索'),
    ('cafe-hopping', ARRAY['cafe', 'food', 'social'], '咖啡廳巡禮'),
    ('tea-ceremony', ARRAY['culture', 'indoor'], '茶道活動');

-- ============================================
-- 7. 預設規則 - 特殊屬性類
-- ============================================
INSERT INTO tag_inference_rules (source_tag, implied_tags, description) VALUES
    ('family-friendly', ARRAY['kids-friendly'], '親子友善'),
    ('pet-friendly', ARRAY['outdoor'], '寵物友善通常戶外'),
    ('vegan', ARRAY['food'], '素食活動'),
    ('lgbtq', ARRAY['inclusive'], 'LGBTQ+ 友善');

-- ============================================
-- 8. 標籤使用統計表（用於推薦和熱門標籤）
-- ============================================
CREATE TABLE IF NOT EXISTS tag_usage_stats (
    tag TEXT PRIMARY KEY,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化常用標籤統計
INSERT INTO tag_usage_stats (tag, usage_count) VALUES
    ('social', 100),
    ('sport', 80),
    ('food', 75),
    ('music', 70),
    ('outdoor', 65),
    ('indoor', 60),
    ('18+', 55),
    ('networking', 50),
    ('workshop', 45),
    ('cafe', 40),
    ('art', 35),
    ('tech', 30),
    ('party', 28),
    ('nightlife', 25),
    ('learning', 22),
    ('culture', 20),
    ('wellness', 18),
    ('entertainment', 15),
    ('nature', 12),
    ('business', 10)
ON CONFLICT (tag) DO NOTHING;

-- ============================================
-- 9. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tag_rules_source ON tag_inference_rules(source_tag);
CREATE INDEX IF NOT EXISTS idx_tag_rules_active ON tag_inference_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_tag_usage_count ON tag_usage_stats(usage_count DESC);

-- ============================================
-- 10. 更新時間觸發器
-- ============================================
CREATE OR REPLACE FUNCTION update_tag_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_rules_timestamp
    BEFORE UPDATE ON tag_inference_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_rules_updated_at();

-- ============================================
-- 11. RLS 政策
-- ============================================
ALTER TABLE tag_inference_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_usage_stats ENABLE ROW LEVEL SECURITY;

-- 所有人可讀取規則（公開資料）
CREATE POLICY "Anyone can read tag rules"
    ON tag_inference_rules FOR SELECT
    USING (true);

CREATE POLICY "Anyone can read tag stats"
    ON tag_usage_stats FOR SELECT
    USING (true);

-- 只有 admin 可修改規則
CREATE POLICY "Admins can manage tag rules"
    ON tag_inference_rules FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- 系統可更新統計（透過 service role）
CREATE POLICY "System can update tag stats"
    ON tag_usage_stats FOR ALL
    USING (true);

-- ============================================
-- 12. 輔助函數：獲取標籤的所有隱含標籤
-- ============================================
CREATE OR REPLACE FUNCTION get_implied_tags(input_tags TEXT[])
RETURNS TEXT[] AS $$
DECLARE
    result_tags TEXT[];
    new_tags TEXT[];
    rule RECORD;
BEGIN
    result_tags := input_tags;
    
    -- 循環應用規則直到沒有新標籤
    LOOP
        new_tags := result_tags;
        
        FOR rule IN 
            SELECT implied_tags 
            FROM tag_inference_rules 
            WHERE source_tag = ANY(result_tags) 
            AND is_active = true
            AND rule_type = 'implies'
        LOOP
            new_tags := array_cat(new_tags, rule.implied_tags);
        END LOOP;
        
        -- 去重
        SELECT ARRAY(SELECT DISTINCT unnest(new_tags)) INTO new_tags;
        
        -- 如果沒有新增標籤，結束循環
        IF array_length(new_tags, 1) = array_length(result_tags, 1) THEN
            EXIT;
        END IF;
        
        result_tags := new_tags;
    END LOOP;
    
    RETURN result_tags;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 13. 權限
-- ============================================
GRANT SELECT ON tag_inference_rules TO authenticated;
GRANT SELECT ON tag_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_implied_tags(TEXT[]) TO authenticated;

-- ============================================
-- 註釋
-- ============================================
COMMENT ON TABLE tag_inference_rules IS '智能標籤推理規則表，定義標籤之間的從屬關係';
COMMENT ON TABLE tag_usage_stats IS '標籤使用統計，用於推薦熱門標籤';
COMMENT ON FUNCTION get_implied_tags IS '根據輸入標籤，返回所有隱含標籤（遞歸應用規則）';
