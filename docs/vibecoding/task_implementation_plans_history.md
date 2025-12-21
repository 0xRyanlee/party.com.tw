# Party Aggregator — 任務追蹤（主文檔）

> **最後驗證時間**：2025-12-22 00:25  
> **驗證方式**：MCP + 代碼檔案檢查  
> **項目版本**：v1.9（V0 MVP 階段）

---

## 防幻覺機制說明

> [!IMPORTANT]
> 此文檔是**唯一真實來源**，所有任務狀態以此為準。
> 每次工作前請先用 MCP 或檔案檢查驗證狀態。

### 驗證規則

1. **代碼驗證**：標記為「完成」的項目必須對應存在的檔案/函數
2. **數據庫驗證**：通過 MCP 查詢確認表/欄位存在
3. **Linear 同步**：任務已同步到 Linear (Project: V0 MVP)
4. **狀態標記**：
   - `[x]` = 已驗證完成（附檔案路徑）
   - `[?]` = 存在但未驗證功能完整
   - `[ ]` = 待開發
   - `[!]` = 需調查

---

# 待辦任務（按優先級）

## P0 — 立即執行

### 前端 UI

| 任務 | 說明 | 檔案 | 狀態 |
|------|------|------|------|
| 會員等級限制強制 | 頁面調用 TierGate 檢查 | `host/edit/page.tsx` | [ ] |
| 首頁「之前參加過的活動」 | 黏性設計 | `app/page.tsx` | [ ] |
| 一鍵報名（已登入用戶） | 減少流失 | 活動詳情頁 | [ ] |
| 活動結束後評價邀請 | Modal 觸發 | 新組件 | [ ] |

### 功能邏輯

| 任務 | 說明 | 檔案 | 狀態 |
|------|------|------|------|
| 活動下架流程 | 公示 3 天 + 退款 | API 待實作 | [!] |
| 聊天室延長權限 | Free 立即關閉 Plus/Pro 延長 | 待確認 | [!] |

---

## P1 — 本週

### 前端 UI

| 任務 | 說明 | 狀態 |
|------|------|------|
| 「你可能喜歡」推薦區 | 基於 Tags | [ ] |
| 顯示已報名好友頭像 | 社交證明 | [ ] |
| 報名成功邀請好友 | 裂變增長 | [ ] |
| 複製上次活動模板 | Host 留存 | [ ] |

### 數據庫

| 任務 | 說明 | 狀態 |
|------|------|------|
| Banner 混合模式 | Admin + Events 聯動 | [ ] |

### 功能邏輯

| 任務 | 說明 | 狀態 |
|------|------|------|
| Host 即時報名通知 | Supabase Realtime | [ ] |
| QR Code 簽到完善 | 批量簽到 + 統計 | [ ] |

---

## P2 — 兩週內

| 任務 | 說明 | 狀態 |
|------|------|------|
| 成就徽章系統 | 參加 5/10/20 場解鎖 | [ ] |
| 圖片上傳優化 | 壓縮 + 格式驗證 | [ ] |
| Amplitude 追蹤 | 事件埋點整合 | [ ] |
| E2E 測試補充 | 核心流程覆蓋 | [ ] |

---

## 待確認項目

| 功能 | 檔案存在 | 功能驗證 | 備註 |
|------|----------|----------|------|
| 活動「條件」欄位 UI | [!] | [!] | DB 已有 `requirements` 欄位 |
| 報表導出 CSV | [x] analytics 頁面 | [!] | 需測試按鈕 |
| 敏感詞過濾觸發 | [x] `sensitiveWords.ts` | [!] | 需確認使用位置 |

---

# 已完成功能

## 數據庫（MCP 驗證 2025-12-22）

| 表名 | 欄位數 | RLS | 數據筆數 |
|------|--------|-----|----------|
| `profiles` | 8 | Yes | 3 |
| `events` | 多 | Yes | 5 |
| `clubs` | 多 | Yes | 2 |
| `registrations` | 多 | Yes | 0 |
| `user_tiers` | 11 | Yes | - |
| `version_updates` | 9 | Yes | 4 |
| `milestones` | 10 | Yes | 10（2 已完成） |
| `system_logs` | 6 | Yes | 0 |

## Admin 後台（檔案驗證 2025-12-22）

| 頁面 | 路徑 | 狀態 |
|------|------|------|
| 儀表板 | `/admin/page.tsx` | [x] |
| 用戶儀表板 | `/admin/users/dashboard` | [x] |
| KOL 審核 | `/admin/users/kol` | [x] |
| Vendor 審核 | `/admin/users/vendor` | [x] |
| 操作日誌 | `/admin/logs` | [x] |
| 俱樂部管理 | `/admin/clubs` | [x] |
| 數據儀表板 | `/admin/analytics` | [x] |
| 推播通知 | `/admin/notifications` | [x] |
| 優惠碼管理 | `/admin/coupons` | [x] |
| 敏感詞管理 | `/admin/content/sensitive-words` | [x] |
| 版本更新 | `/admin/versions` | [x] |
| 里程碑 | `/admin/milestones` | [x] |

## 組件（檔案驗證）

| 組件 | 路徑 | 狀態 |
|------|------|------|
| TierGate | `src/components/TierGate.tsx` | [x] |
| TransferOwnershipModal | `src/components/TransferOwnershipModal.tsx` | [x] |

## 工具函數（檔案驗證）

| 工具 | 路徑 | 狀態 |
|------|------|------|
| tiers.ts | `src/lib/tiers.ts` | [x] |
| sensitiveWords.ts | `src/lib/sensitiveWords.ts` | [x] |
| email.ts | `src/lib/email.ts`（405 行，11 模板） | [x] |

## API 端點

| 端點 | 路徑 | 狀態 |
|------|------|------|
| /api/user/tier | `src/app/api/user/tier/route.ts` | [x] |
| /api/admin/verify | `src/app/api/admin/verify/route.ts` | [x] |
| /api/admin/versions | `src/app/api/admin/versions/route.ts` | [x] |
| /api/admin/milestones | `src/app/api/admin/milestones/route.ts` | [x] |
| /api/admin/notifications/send | `src/app/api/admin/notifications/send/route.ts` | [x] |
| /api/webhooks/github | `src/app/api/webhooks/github/route.ts` | [x] |
| /api/webhooks/vercel | `src/app/api/webhooks/vercel/route.ts` | [x] |

## 已刪除（確認不存在）

| 項目 | 驗證結果 |
|------|----------|
| AdminPasswordGate.tsx | [x] 已刪除 |
| /admin/management/ | [x] 已刪除 |

---

# 用戶決策記錄

| 項目 | 決策 |
|------|------|
| Admin 認證 | 密碼 800814，API 驗證 |
| 管理員分級 | 不需要，單人管理 |
| 刪除相關二次確認 | 彈窗確認，不需打字 |
| 活動審核 | 自動發布，敏感詞觸發人工 |
| 活動下架 | Host 發起 -> 公示 3 天 -> 5 天內退款 |
| 俱樂部 | 僅 Private Club 需審核 |
| 標籤 | 純英文 |
| 行程時間線 | 顯示已結束活動（灰色） |

---

# 技術債務

| 項目 | 優先級 | 說明 |
|------|--------|------|
| E2E 測試覆蓋 | P2 | 目前僅框架 |
| API 錯誤處理統一 | P2 | 部分端點缺少 |
| Function search_path | P3 | 14 個函數待修復 |
| 圖片 CDN | P3 | 未配置 Supabase Transform |

---

## 環境配置

| 變量 | 狀態 |
|------|------|
| `ADMIN_SECRET_PASSWORD` | [x] |
| `RESEND_API_KEY` | [x] |
| `LINEAR_API_KEY` | [x] MCP 已連接 |
| `GITHUB_WEBHOOK_SECRET` | [ ] 待設置 |
| `VERCEL_WEBHOOK_SECRET` | [ ] 可選 |

---

# 變更歷史

| 日期 | 變更 |
|------|------|
| 2024-12-22 | 數據庫 Migration 執行（version_updates, milestones, system_logs） |
| 2024-12-22 | 文檔重組 + 防幻覺機制 |
| 2024-12-22 | 儀表板 shadcn 風格重構 |
| 2024-12-21 | Admin 後台全面重構 |
| 2024-12-21 | 推播通知 + Email 模板 |
