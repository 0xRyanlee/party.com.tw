---
description: 資料庫 Schema 安全規則 - 防止上下文丟失導致的數據污染
---

# Database Schema Rules（必須遵守）

> ⚠️ **重要**：此規則用於防止 Agent 在長對話中產生幻覺或遺漏，導致資料庫污染。

## 🔴 強制規則

### 1. 不自行發明表/欄位名

- 執行任何 DDL 操作前，**必須先查詢現有 schema**
- 使用 `\d tablename` 或 Supabase Dashboard 確認結構
- 不確定時 → **停止並詢問用戶**

### 2. Migration 命名規範

```
{YYYYMMDDHHMMSS}_{描述}.sql
```

示例：`20251219030000_add_reviews_table.sql`

### 3. 安全 SQL 模板（防重複錯誤）

```sql
-- 安全 TYPE
DO $$ BEGIN
    CREATE TYPE my_enum AS ENUM ('a', 'b');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 安全 TABLE/INDEX
CREATE TABLE IF NOT EXISTS ...
CREATE INDEX IF NOT EXISTS ...

-- 安全 TRIGGER/POLICY
DROP TRIGGER IF EXISTS ... ON table;
CREATE TRIGGER ...

DROP POLICY IF EXISTS "..." ON table;
CREATE POLICY "..." ...
```

### 4. ALTER TABLE 限制

- 執行 ALTER TABLE 前 **必須確認影響範圍**
- 列出受影響的：
  - 現有數據行數
  - 依賴此表的外鍵
  - 應用層代碼引用

### 5. Schema 衝突處理

當發現以下情況時，**立即停止並詢問用戶**：

- 表/欄位名與現有結構不符
- Migration 版本衝突
- ENUM 值不匹配
- 外鍵約束失敗

### 6. status/type 欄位使用 ENUM

```sql
-- 正確 ✓
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled');
status event_status NOT NULL DEFAULT 'draft'

-- 錯誤 ✗
status TEXT NOT NULL DEFAULT 'draft'
```

---

## 📋 執行 DDL 前檢查清單

```markdown
- [ ] 已查詢目標表現有結構
- [ ] 確認欄位名/類型與現有一致
- [ ] Migration 使用時間戳命名
- [ ] 使用 IF NOT EXISTS / IF EXISTS 語法
- [ ] 不確定的部分已詢問用戶
```

---

## 💡 用戶初衷

> 避免 Agent 在上下文過長時產生幻覺和缺漏，導致資料庫污染。
> 即使在新對話中，也必須自動遵守此規則，無需用戶提醒。

---

## 📝 開發文件更新規則

### 7. 總是更新開發進度文件

每完成一個任務後，**必須更新**以下文件：

1. **task.md** - 更新進度百分比和完成項目
2. **implementation_plan.md** - 更新進度條和任務狀態

### 更新時機

- 任務完成後
- Build 驗證成功後
- Migration 推送成功後
- 重要里程碑達成後

### 進度格式

```markdown
**整體進度：XX%** | P0: XX% | P1: XX% | P2: XX% | Backlog: XX%
```
