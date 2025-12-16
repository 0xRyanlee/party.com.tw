# Party 平台產品開發路線圖

> 最後更新：2025-12-17

---

## 🎯 產品願景

**城市活動行事曆** — 連接、慶祝、創造難忘回憶  
**Tagline**: Meetup, Anytime, Anywhere

---

## 版本規劃

### MVP (v0.1) — 核心功能 ✅ 已完成

| 功能 | 狀態 | 說明 |
|-----|------|------|
| 活動瀏覽 | ✅ | 首頁卡片、探索頁 |
| 多維度篩選 | ✅ | Category Tags、日期、價格 |
| 活動詳情 | ✅ | 完整資訊展示、報名按鈕 |
| 用戶認證 | ✅ | Google/Line/Email OAuth |
| 主辦方後台 | ✅ | 創建、編輯、管理活動 |
| Admin 後台 | ✅ | Banner、公告管理 |
| PWA 支援 | ✅ | 安裝提示、離線體驗 |
| 法律頁面 | ✅ | Privacy/Terms/Help 雙語 |

---

### v1 — 穩定發布 🔄 進行中

| 優先級 | 功能 | 狀態 | 備註 |
|-------|-----|------|------|
| P0 | Google OAuth 驗證 | 🔄 | 需重新提交 |
| P0 | Sitemap/Robots 優化 | ✅ | 已完成 |
| P0 | Migration 驗證 | 🔄 | Ultra tier + source 欄位 |
| P1 | 真實活動數據入庫 | ⏳ | 20+ 活動 |
| P1 | 外部連結多選 | ⏳ | 最多3個，自動識別平台 |
| P1 | 距離 Tags | ⏳ | GPS 授權、距離計算 |
| P2 | Banner 輪播真實數據 | ⏳ | 3個真實活動 |
| P2 | OAuth 應用名稱修改 | ⏳ | 手動 Google Cloud |

---

### v2 — 用戶增長

| 功能 | 類型 | 說明 |
|-----|------|------|
| 會員中心快速操作 | UI | 移動至會員中心 |
| Vendor/Supplier 頁面 | 功能 | 完整資料頁、服務列表、邀請 |
| 單次付費購買 | 金流 | NT$29 活動詳情解鎖 |
| Check-in 功能 | 功能 | QR code 簽到 |
| 私人訊息留言板 | 社交 | 主辦方與參與者溝通 |

---

### v3 — AI 增強

| 功能 | 說明 |
|-----|------|
| AI 文案生成 | 活動介紹、標籤建議 |
| Chatbot QA | 網站即時問答 |
| Club 聊天摘要 | LLM 每日總結 |
| 向量資料庫 | Embedding 搜尋 |

---

## 設計原則

### 視覺規範

- **配色**：中性灰色調為主，避免鮮豔色彩（藍色→灰色）
- **圓角**：`rounded-full` 按鈕、`rounded-[24px]` 卡片
- **間距**：統一 `gap-4`、`space-y-6`
- **字體**：英文 Inter、中文系統字體

### 交互模式

- **Mobile First**：優先手機體驗
- **Sheet/Drawer**：底部彈出 Modal
- **Tags**：可多選篩選、自動平台識別

### 語言

- **雙語**：英文優先、中文補充
- **SEO**：Meta description 雙語

---

## 文件結構

```
docs/
├── TASKS.md          # Sprint 任務（已完成 Sprint 1）
├── data_sources.md   # 資料來源清單
├── data_mapping.md   # 資料映射 TRD
└── PRODUCT_ROADMAP.md # 本文件
```

---

## 待清理文件

以下文件已整合至本路線圖，可考慮刪除：

- `PRODUCTION_CHECKLIST.md` → 已整合
- `1216修改意見記錄.md` → 已整合
- `docs/TASKS.md` → Sprint 1 已完成

---

## 下一步行動

1. [ ] 驗證 build 並部署
2. [ ] 重新提交 Google OAuth 審核
3. [ ] 創建 20+ 真實活動數據
4. [ ] 實作外部連結多選組件
