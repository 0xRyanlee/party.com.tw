# Sprint 1 — Admin & Data Foundation

## Discovery

- [x] 分析目前資料庫架構與數據來源
- [x] 定義管理後台 (Admin Dashboard) 需求
- [x] 定義數據映射策略 (TRD)

## Delivery — Backend

- [x] Migration: 新增 `banners` 資料表
- [x] Migration: 新增 `announcements` 資料表
- [x] Migration: 新增 `events` 來源欄位 (`source_url`, `external_id`)

## Delivery — Frontend

- [x] 實作 Admin Layout (`/admin`) 與 RBAC 權限控管
- [x] 實作 Admin Dashboard 首頁 (統計數據)
- [x] 實作 Banner 管理頁面 (CRUD)
- [x] 實作公告 (Announcement) 管理頁面 (CRUD)

## Delivery — iOS

- [ ] (待未來規劃)

## AI / Prompt

- [ ] 根據 TRD 優化爬蟲 Prompt

## QA

- [x] 驗證 Admin 存取權限控制
- [x] 驗證 Banners/Announcements CRUD 功能

## Docs

- [x] 建立 `docs/data_mapping.md` (TRD)
- [ ] 更新 `README.md` 加入 Admin 相關說明
