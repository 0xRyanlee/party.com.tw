# 🚀 快速開發指南

## 當前狀態

✅ **已完成**:

- Vendor/Supplier 生態系統（100%）
- 表單組件重構（100%）
- API 路由更新（100%）
- Migration 文件準備（100%）

⏳ **待完成**:

- 執行 Migration
- 端到端測試

---

## 立即執行：Migration

### ⚠️ Supabase CLI 未安裝

您的系統尚未安裝 Supabase CLI。請選擇以下方式之一執行 migration：

### 方式 1：安裝 CLI（推薦，一勞永逸）

```bash
# 安裝 Supabase CLI
brew install supabase/tap/supabase

# 驗證安裝
supabase --version

# 執行 migration
cd /Users/apple/Desktop/antigravity/party/party-aggregator
supabase db push
```

### 方式 2：使用 Supabase Dashboard（最簡單）

1. 打開瀏覽器前往：<https://app.supabase.com>
2. 登入並選擇您的專案
3. 左側選單 → **SQL Editor**
4. 打開本地檔案：`supabase/migrations/004_event_schema_form_refactor.sql`
5. 複製全部內容
6. 貼到 SQL Editor 中
7. 點擊 **Run** 按鈕

### 方式 3：使用輔助腳本

```bash
cd /Users/apple/Desktop/antigravity/party/party-aggregator
./scripts/run-migration.sh
```

此腳本會檢查環境並提供詳細指引。

---

## Migration 驗證

執行 migration 後，請在 SQL Editor 中執行以下查詢驗證：

```sql
-- 1. 檢查新欄位是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('is_adult_only', 'invitation_code', 'tags');
-- 預期：返回 3 行

-- 2. 檢查舊欄位是否已移除
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('age_min', 'age_max', 'gender_limit', 'vibe_type', 'theme', 'mood_tags');
-- 預期：返回 0 行

-- 3. 檢查索引
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'events'
AND indexname LIKE 'idx_events_%';
-- 預期：看到多個索引，包括 idx_events_tags, idx_events_is_adult_only
```

---

## 測試活動創建

Migration 成功後，測試完整流程：

### 1. 啟動開發伺服器（如未運行）

```bash
npm run dev
```

### 2. 前往活動編輯頁面

```
http://localhost:3000/host/edit
```

### 3. 填寫表單

測試以下新功能：

- ✅ 自定義人數（例如：32）
- ✅ 18+ 成人限定開關
- ✅ 邀請制 + 邀請碼
- ✅ 多個活動標籤選擇

### 4. 提交並檢查資料庫

在 Supabase Dashboard → Table Editor → events 表中，查看新創建的活動：

- `is_adult_only` 欄位值
- `invitation_code` 欄位值  
- `tags` 陣列內容
- `capacity_total` 數值

---

## 常見問題

### Q: Migration 執行時出現權限錯誤

**解決方案**：

- 確保使用 service role key（Dashboard 中自動使用）
- 或在 CLI 中使用 `supabase login` 登入

### Q: 舊活動資料怎麼辦？

**答案**：

- Migration 包含數據遷移邏輯
- `age_min/age_max >= 18` 的活動會自動設定 `is_adult_only = true`
- 其他欄位保持不變

### Q: 可以回滾嗎？

**答案**：
可以，但會遺失新 schema 的數據。回滾 SQL：

```sql
ALTER TABLE public.events 
  DROP COLUMN IF EXISTS is_adult_only,
  DROP COLUMN IF EXISTS invitation_code,
  DROP COLUMN IF EXISTS tags;
```

---

## 檔案位置

| 檔案 | 路徑 |
|------|------|
| Migration 文件 | `supabase/migrations/004_event_schema_form_refactor.sql` |
| Migration 指南 | `supabase/MIGRATION_GUIDE.md` |
| 執行腳本 | `scripts/run-migration.sh` |
| Event API | `src/app/api/events/route.ts` |
| 表單組件 | `src/components/host/ParticipantSettings.tsx` |
| 標籤組件 | `src/components/host/CustomTags.tsx` |

---

## 下一步開發

Migration 完成後的優先任務：

1. **Host Manage 頁面**
   - 顯示申請列表
   - 審核功能（通過/拒絕）

2. **Toast 通知系統**
   - 替代 `alert()`
   - 更好的用戶體驗

3. **QR Code 功能**
   - 邀請碼 QR 生成
   - 掃碼核銷

4. **一般用戶 Profile**
   - 頭像上傳
   - 個人介紹
   - 興趣標籤

---

## 需要幫助？

- 查看完整指南：`supabase/MIGRATION_GUIDE.md`
- 查看任務清單：`task.md` （Artifacts）
- API 文檔：`API_INTEGRATION_STATUS.md`

**當前 MVP 完成度：90%** 🎉

只差 migration 執行和測試！
