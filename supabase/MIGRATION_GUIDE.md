# Migration 執行指南

## 概覽

本專案包含多個資料庫 migration 文件，請按照以下順序和步驟執行。

## Migration 文件列表

### 1. `003_event_schema_mvp_expansion.sql`（已過時）

**狀態**: ⚠️ 不建議使用
**原因**: 此 migration 包含已被表單重構移除的欄位（age_min, age_max, gender_limit, vibe_type, theme, mood_tags）

### 2. `004_event_schema_form_refactor.sql`（推薦）

**狀態**: ✅ 最新版本
**用途**: 匹配最新的表單設計
**主要變更**:

- 移除: `age_min`, `age_max`, `gender_limit`
- 移除: `vibe_type`, `theme`, `mood_tags`
- 新增: `is_adult_only` (boolean) - 18+ 限制
- 新增: `invitation_code` (text) - 邀請碼
- 新增: `tags` (text[]) - 統一標籤系統

## 執行步驟

### 方式 1：使用 Supabase CLI（推薦）

```bash
# 進入專案目錄
cd /Users/apple/Desktop/antigravity/party/party-aggregator

# 確認 Supabase 連線
supabase status

# 執行最新 migration
supabase db push

# 或者執行特定 migration
supabase db execute --file supabase/migrations/004_event_schema_form_refactor.sql
```

### 方式 2：使用 Supabase Dashboard

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 進入 **SQL Editor**
4. 開啟 `004_event_schema_form_refactor.sql` 文件
5. 複製全部內容
6. 貼上到 SQL Editor
7. 點擊 **Run** 執行

### 方式 3：使用 psql

```bash
# 連接到 Supabase 資料庫
psql "postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]"

# 執行 migration
\i /Users/apple/Desktop/antigravity/party/party-aggregator/supabase/migrations/004_event_schema_form_refactor.sql
```

## 驗證步驟

執行 migration 後，請驗證以下內容：

### 1. 檢查欄位是否正確

```sql
-- 確認新欄位存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('is_adult_only', 'invitation_code', 'tags');

-- 確認舊欄位已移除
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('age_min', 'age_max', 'gender_limit', 'vibe_type', 'theme', 'mood_tags');
```

預期結果：

- 新欄位應該存在（返回 3 行）
- 舊欄位應該不存在（返回 0 行）

### 2. 檢查索引

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'events'
AND indexname IN ('idx_events_tags', 'idx_events_is_adult_only', 'idx_events_invitation_only');
```

預期結果：應返回 3 個索引

### 3. 檢查 Trigger

```sql
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'events';
```

預期結果：應該看到 `trigger_update_capacity`

## 測試資料

執行 migration 後，可以插入測試資料驗證：

```sql
-- 插入測試活動
INSERT INTO public.events (
    title,
    description_long,
    start_time,
    venue_name,
    capacity_total,
    is_adult_only,
    invitation_only,
    invitation_code,
    tags,
    status
) VALUES (
    '測試活動 - 18+ 酒吧聚會',
    '這是一個測試活動，用於驗證新的 schema',
    NOW() + interval '7 days',
    '台北某酒吧',
    50,
    true,
    true,
    'PARTY2024',
    ARRAY['bar', 'networking', 'party', '18+'],
    'published'
);

-- 查詢測試
SELECT 
    id,
    title,
    is_adult_only,
    invitation_code,
    tags,
    capacity_total,
    capacity_remaining
FROM public.events 
WHERE title LIKE '測試活動%';
```

## 回滾計畫

如果需要回滾 migration，執行以下 SQL：

```sql
-- 回滾 004_event_schema_form_refactor.sql
ALTER TABLE public.events 
  DROP COLUMN IF EXISTS is_adult_only,
  DROP COLUMN IF EXISTS invitation_code,
  DROP COLUMN IF EXISTS tags;

-- 恢復舊欄位（如果需要）
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS age_min integer,
  ADD COLUMN IF NOT EXISTS age_max integer,
  ADD COLUMN IF NOT EXISTS gender_limit text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS vibe_type text,
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS mood_tags text[];
```

⚠️ **注意**: 回滾會導致使用新 schema 創建的資料遺失！

## 常見問題

### Q: 執行 migration 時出現 permission denied

**A**: 確保您使用的資料庫用戶有 ALTER TABLE 權限。如使用 Supabase，請使用 service role key 或在 Dashboard 中執行。

### Q: Trigger 沒有生效

**A**: 確認 Trigger 函數已正確創建：

```sql
SELECT proname FROM pg_proc WHERE proname = 'update_capacity_remaining';
```

### Q: 索引創建失敗

**A**: GIN 索引需要在陣列欄位上。確認 `tags` 欄位類型為 `text[]`。

## 下一步

Migration 執行成功後：

1. ✅ 重啟開發伺服器（如正在運行）
2. ✅ 測試活動創建流程
3. ✅ 驗證 API 端點正常運作
4. ✅ 檢查前端表單是否正確保存資料

## 聯絡資訊

如遇到問題，請參考：

- Supabase 文檔：<https://supabase.com/docs/guides/database/migrations>
- 專案 README：`/README.md`
