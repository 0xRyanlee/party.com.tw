-- ==========================================
-- Migration 驗證查詢
-- 執行這些查詢來確認 migration 成功
-- ==========================================

-- 1. 檢查新欄位是否存在
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('is_adult_only', 'invitation_code', 'tags')
ORDER BY column_name;
-- 預期：返回 3 行
-- is_adult_only | boolean | YES | false
-- invitation_code | text | YES | NULL
-- tags | ARRAY | YES | '{}'::text[]

-- 2. 檢查舊欄位是否已移除
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('age_min', 'age_max', 'gender_limit', 'vibe_type', 'theme', 'mood_tags');
-- 預期：返回 0 行（所有舊欄位已刪除）

-- 3. 檢查所有索引
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'events'
AND indexname LIKE 'idx_events_%'
ORDER BY indexname;
-- 預期：看到多個索引，包括：
-- idx_events_is_adult_only
-- idx_events_invitation_only
-- idx_events_tags
-- idx_events_category
-- idx_events_city
-- idx_events_start_time
-- idx_events_status

-- 4. 檢查 Trigger 是否存在
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'events'
AND trigger_name = 'trigger_update_capacity';
-- 預期：返回 1 行，顯示 trigger 詳情

-- 5. 檢查約束
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'events'
AND conname IN ('events_status_check', 'events_attendee_list_visibility_check')
ORDER BY conname;
-- 預期：看到 status 和 attendee_list_visibility 的 CHECK 約束

-- 6. 驗證現有資料（如果有）
SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN is_adult_only = true THEN 1 END) as adult_only_events,
    COUNT(CASE WHEN invitation_only = true THEN 1 END) as invitation_only_events,
    COUNT(CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN 1 END) as events_with_tags
FROM events;
-- 預期：顯示統計數據

-- 7. 查看欄位註解
SELECT 
    col.column_name,
    pgd.description
FROM pg_catalog.pg_statio_all_tables as st
INNER JOIN pg_catalog.pg_description pgd ON (
    pgd.objoid = st.relid
)
INNER JOIN information_schema.columns col ON (
    pgd.objsubid = col.ordinal_position AND
    col.table_schema = st.schemaname AND
    col.table_name = st.relname
)
WHERE st.relname = 'events'
AND col.column_name IN ('is_adult_only', 'invitation_code', 'tags', 'ticket_types')
ORDER BY col.column_name;
-- 預期：看到欄位的中文註解

-- ==========================================
-- 🎉 如果以上查詢都返回預期結果，Migration 成功！
-- ==========================================
