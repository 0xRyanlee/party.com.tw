# Release Notes

> 版本更新日誌
> 格式：[版本號] - 日期

---

## [v1.9] - 2025-12-21

**系統健康檢查與修復 (Health Check)**

- **Host 活動編輯功能修復 (Critical)**
  - 修復 `/host/edit` 默認進入新建模式的錯誤
  - 新增 `useSearchParams` 支援 `?id=` 參數讀取
  - 實作完整活動資料載入 (含票券、資源、標籤)
  - 修正儲存邏輯，支援 PATCH/PUT 更新現有活動
  - Host 儀表板新增「編輯」按鈕
- **票券轉送系統增強**
  - **Email 通知實作**：新增 `ticket_transfer_received` 郵件模板
  - **API 修復**：修正 SQL 表關聯錯誤 (`users` -> `profiles`)
- **Admin 管理後台優化**
  - 新增用戶列表管理 `/admin/users`
  - 新增活動列表管理 `/admin/events`
  - 新增公告與 Banner 管理
- **郵件系統整合**
  - 報名確認、取消、提醒郵件
  - 票券轉送通知

---

## [v1.8] - 2025-12-20

**新增功能**

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
- **體驗優化 (P2)**
  - Skeleton 骨架屏全站優化（18 種變體）
  - 動態 OG Image 產生器 `/api/og`
  - 多欄位關鍵字搜尋（title, description, venue）
- **Analytics 統一 Hook**
  - GA4 + Amplitude 雙軌整合
  - 預設事件：auth, events, tickets, clubs, social, chat
- **品質保證 (P3)**
  - Playwright E2E 測試框架設定
  - 全站鏈接正確性檢查腳本
  - Admin 測試儀表板 `/admin/tests`（一鍵複製報告）
  - QR 掃碼核銷功能（即時偵測、震動回饋）
  - 聊天室票券轉讓（30 分鐘限時邀請）
  - 海報模板生成器（6 種漸層模板 + PNG 下載）
  - 系統公告欄（AnnouncementBar）

**變更**

- 全站樣式統一 (Nine Unities: `rounded-3xl`)
- **全面中文化與 Emoji 清理**
  - 移除所有 UI Emoji（dictionaries.ts, AuthModal, wallet, following, VibeAttributes）
  - Club 頁面全面中文化（標題、標籤、toast、empty state）
- 遷移文件規範化 (Supabase CLI Timestamped)

---

## [v1.7] - 2025-12-19

活動數據整合與 Seed API。

- 真實活動數據錄入（5場 Accupass/Meetup 活動）
- Seed API 端點 `/api/seed`
- Service Role Key 支援
- Supabase API Key 更新

---

## [v1.6] - 2025-12-18

會員定價與 UI 優化。

- 會員定價頁面
- Plus 功能規劃
- Emoji 全面替換為 Lucide Icons

---

## [v1.5] - 2025-12-17

首頁真實數據。

- 首頁真實數據整合
- HeroCarousel 組件
- WeeklyCalendar 組件

---

## [v1.4] - 2025-12-16

主辦方工具。

- 活動編輯器
- 主辦方儀表板
- 活動管理頁面

---

## [v1.3] - 2025-12-15

Admin 功能。

- Admin Reports 界面
- Vendor Profile 表

---

## [v1.0] - 2025-12-01

初始版本。

- 基礎框架建立
- Supabase 認證整合
- 活動列表頁面
- 活動詳情頁面
