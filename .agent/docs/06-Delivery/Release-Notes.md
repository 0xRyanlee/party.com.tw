# Release Notes

> 版本更新日誌
> 格式：[版本號] - 日期

---

## [v1.8] - 2025-12-20

### 新增

- 結構化圖片資產架構 (`StructuredImage` + `ImageUploader`)
- Supabase Storage 整合（直接上傳與自動命名）
- SEO 圖片元數據編輯支援
- Admin 與 Host 編輯介面同步優化
- **Club 功能完整實裝**
  - Club 列表頁、創建頁、詳情頁、管理頁
  - Club 討論區（留言板）
  - Club 活動關聯（API + UI）
- Vendor/Supplier 角色說明頁面
- **票券轉送多路徑**
  - QR 碼面對面轉送
  - 鏈接分享轉送（24 小時有效）
  - Email 直接轉送
- **Vendor 詳情頁重構**
  - 統一 rounded-3xl 樣式
  - 新增「成為 Vendor/Supplier」CTA
- **聊天室 API 完善**
  - `/api/events/[eventId]/messages` (GET/POST)
  - `/api/clubs/[id]/discussions` (GET/POST)
  - `/api/clubs/[id]/discussions/[discussionId]/like` (POST)
- **聊天室安全機制**
  - Rate Limiting（1 訊息/2 秒）
  - Message Retention（500 條或 30 天）

### 變更

- 全站樣式統一 (Nine Unities: `rounded-3xl`)
- **全面中文化與 Emoji 清理**
  - 移除所有 UI Emoji（dictionaries.ts, AuthModal, wallet, following, VibeAttributes）
  - Club 頁面全面中文化（標題、標籤、toast、empty state）
- 遷移文件規範化 (Supabase CLI Timestamped)

---

## [v1.7] - 2025-12-19

## [v1.5] - 2025-12-19

### 新增

- 真實活動數據錄入（5場 Accupass/Meetup 活動）
- Seed API 端點 `/api/seed`
- Service Role Key 支援

### 修復

- Supabase API Key 更新

---

## [v1.4] - 2025-12-18

### 新增

- 會員定價頁面
- Plus 功能規劃
- Emoji 全面替換為 Lucide Icons

---

## [v1.3] - 2025-12-17

### 新增

- 首頁真實數據整合
- HeroCarousel 組件
- WeeklyCalendar 組件

---

## [v1.2] - 2025-12-16

### 新增

- 活動編輯器
- 主辦方儀表板
- 活動管理頁面

---

## [v1.1] - 2025-12-15

### 新增

- Admin Reports 界面
- Vendor Profile 表

---

## [v1.0] - 2025-12-01

### 初始版本

- 基礎框架建立
- Supabase 認證整合
- 活動列表頁面
- 活動詳情頁面
