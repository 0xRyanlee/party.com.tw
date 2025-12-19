# 🧪 端到端測試指南

Migration 已完成！現在讓我們測試整個系統。

---

## 測試準備

### 1. 確認開發伺服器運行中

```bash
# 檢查是否運行
ps aux | grep "next dev"

# 如果沒有運行，啟動它
cd /Users/apple/Desktop/antigravity/party/party-aggregator
npm run dev
```

應該在 `http://localhost:3000` 可訪問

---

## 📝 測試 1：驗證資料庫 Schema

### 在 Supabase Dashboard → SQL Editor 執行

```sql
-- 快速驗證（複製整個檔案內容）
-- 位置：supabase/verify_migration.sql
```

**預期結果**：

- ✅ 新欄位存在（3 個）
- ✅ 舊欄位已移除（0 個）
- ✅ 索引已創建（7+ 個）
- ✅ Trigger 存在
- ✅ 約束正確

---

## 🎨 測試 2：活動創建表單

### 步驟

1. **打開活動編輯頁面**

   ```
   http://localhost:3000/host/edit
   ```

2. **填寫基本資訊**
   - 標題：「測試活動 - 酒吧聚會」
   - 描述：「這是一個測試活動」
   - 類型：「Party」
   - 日期/時間：選擇未來日期
   - 地點：「台北某酒吧」
   - 地址：「台北市」

3. **測試新功能：人數設定**
   - 輸入自定義人數：**32**（非整數選項）
   - 確認顯示「32 人」

4. **測試新功能：18+ 成人限定**
   - 開啟「18+ 成人限定」開關
   - 確認 UI 響應

5. **測試新功能：邀請制**
   - 開啟「邀請制活動」開關
   - 點擊「自動生成」邀請碼
   - 應該看到 8 位隨機碼（例如：ABC12XYZ）
   - 點擊「複製」按鈕
   - 或輸入自定義邀請碼：「PARTY2024」

6. **測試新功能：活動標籤**
   - 切換不同類別（活動類型、興趣主題、氛圍、特色）
   - 選擇多個標籤，例如：
     - 活動類型：「酒吧夜店」
     - 興趣主題：「音樂」
     - 氛圍：「派對狂歡」
     - 特色：「18+」
   - 添加自定義標籤：「Techno」
   - 確認已選標籤顯示正確
   - 測試移除標籤

7. **提交表單**
   - 點擊「發布活動」
   - 檢查控制台是否有錯誤
   - 應該看到成功訊息

---

## 🔍 測試 3：驗證資料庫儲存

### 在 Supabase Dashboard

1. **前往 Table Editor → events**

2. **找到剛創建的活動**
   - 按 `created_at` 排序，最新的在上面

3. **檢查欄位值**：

   ```
   ✅ title: "測試活動 - 酒吧聚會"
   ✅ capacity_total: 32
   ✅ is_adult_only: true
   ✅ invitation_only: true
   ✅ invitation_code: "PARTY2024" (或您生成的碼)
   ✅ tags: ["bar", "music", "party", "18+", "Techno"]
   ```

4. **檢查舊欄位不存在**：
   - ❌ 不應該有 `age_min`, `age_max`, `gender_limit`
   - ❌ 不應該有 `vibe_type`, `theme`, `mood_tags`

---

## 🎯 測試 4：API 端點

### 使用瀏覽器或 curl 測試

#### 4.1 獲取活動列表

```bash
# 在瀏覽器打開
http://localhost:3000/api/events?status=published

# 或使用 curl
curl "http://localhost:3000/api/events?status=published"
```

**預期**：返回 JSON，包含剛創建的活動

#### 4.2 檢查返回的資料結構

確認包含新欄位：

```json
{
  "events": [
    {
      "id": "...",
      "title": "測試活動 - 酒吧聚會",
      "capacity_total": 32,
      "is_adult_only": true,
      "invitation_only": true,
      "invitation_code": "PARTY2024",
      "tags": ["bar", "music", "party", "18+", "Techno"],
      ...
    }
  ]
}
```

---

## 🤝 測試 5：Vendor/Supplier 申請流程

### 5.1 查看活動詳情

1. 前往活動列表頁面（如果有）
2. 點擊活動查看詳情
3. 應該看到「合作機會」區塊（如果有添加 roles/resources）

### 5.2 提交申請

1. 點擊「申請」按鈕
2. 填寫申請表單
3. 提交
4. 檢查是否成功

### 5.3 查看我的申請

```
http://localhost:3000/applications
```

應該看到剛才提交的申請

---

## 🐛 常見問題排查

### 問題 1：表單提交後沒有反應

**檢查**：

1. 打開瀏覽器開發者工具（F12）
2. 查看 Console 有無錯誤
3. 查看 Network - 找到 `/api/events` 請求
4. 檢查 Response

**可能原因**：

- Supabase 認證問題
- API 路由錯誤
- 資料驗證失敗

### 問題 2：資料庫中沒有資料

**檢查**：

1. Supabase Dashboard → Logs
2. 查看 API 錯誤日誌
3. 確認 RLS 政策允許插入

**解決方案**：

```sql
-- 臨時關閉 RLS（僅用於測試）
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 或添加政策允許插入
CREATE POLICY "Allow all insert" ON events
FOR INSERT WITH CHECK (true);
```

### 問題 3：欄位顯示 undefined 或 null

**檢查**：

1. 確認 API 返回的欄位名稱（snake_case vs camelCase）
2. 檢查前端是否正確讀取

---

## ✅ 測試檢查清單

完成以下所有項目：

### 資料庫

- [ ] 新欄位存在且正確
- [ ] 舊欄位已移除
- [ ] 索引已創建
- [ ] Trigger 運作正常
- [ ] 約束正確

### 前端表單

- [ ] 自定義人數輸入正常（32）
- [ ] 18+ 開關運作
- [ ] 邀請碼自動生成功能正常
- [ ] 邀請碼自定義輸入正常
- [ ] 邀請碼複製功能正常
- [ ] 標籤分類切換正常
- [ ] 標籤選擇/取消選擇正常
- [ ] 自定義標籤新增正常
- [ ] 表單提交成功

### API

- [ ] POST /api/events 成功創建活動
- [ ] GET /api/events 正確返回資料
- [ ] 新欄位在 API 響應中正確顯示
- [ ] camelCase ↔ snake_case 轉換正確

### 完整流程

- [ ] 創建活動 → 資料庫儲存 → API 返回 → 前端顯示
- [ ] 所有新功能運作正常
- [ ] 無 console 錯誤
- [ ] 無資料遺失

---

## 🎉 測試通過後

恭喜！系統已完全運作。下一步可以：

1. **開發 Host Manage 頁面**
   - 顯示活動申請列表
   - 審核功能（通過/拒絕）

2. **實作 Toast 通知**
   - 替代 `alert()`
   - 更好的用戶體驗

3. **QR Code 功能**
   - 邀請碼 QR 生成
   - 掃碼核銷

4. **繼續其他功能開發**
   - 參考 `task.md` 的待辦清單

---

**測試愉快！有任何問題隨時告訴我。** 🚀
