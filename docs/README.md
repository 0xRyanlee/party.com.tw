# Party Platform 文檔中心

> 最後更新：2025-12-19

本目錄為項目文檔的統一存放位置，按照功能分類組織。

---

## 📁 目錄結構

```
docs/
├── business/              # 業務與策略
│   ├── compliance/        # 合規相關
│   ├── monetization/      # 變現策略
│   └── market/            # 市場分析
│
├── technical/             # 技術文檔
│   ├── api/               # API 文檔
│   ├── database/          # 數據庫設計
│   └── architecture/      # 架構設計
│
├── product/               # 產品設計
│   ├── prd/               # 產品需求
│   ├── design/            # UI/UX 設計
│   └── roadmap/           # 路線圖
│
└── operations/            # 運營文檔
    ├── guides/            # 操作指南
    └── testing/           # 測試文檔
```

---

## 📋 文檔索引

### 業務文檔

- [合規規範](business/compliance/COMPLIANCE_SPEC.md)
- [會員系統設計](business/monetization/membership-design.md)

### 技術文檔

- [開發總結](technical/architecture/dev-summary.md)
- [API 整合狀態](technical/api/integration-status.md)
- [Google Maps 設置](technical/api/google-maps-setup.md)
- [Supabase OAuth 設置](technical/api/supabase-oauth-setup.md)
- [數據映射](technical/database/data-mapping.md)
- [數據來源](technical/database/data-sources.md)

### 產品文檔

- [產品路線圖](product/roadmap/PRODUCT_ROADMAP.md)

### 運營文檔

- [快速開始](operations/guides/quickstart.md)
- [測試指南](operations/testing/test-guide.md)
- [測試日誌](operations/testing/test-log.md)

---

## 📝 命名規範

| 類型 | 格式 | 示例 |
|------|------|------|
| 規範文檔 | `UPPER_SNAKE_CASE.md` | `COMPLIANCE_SPEC.md` |
| PRD 文檔 | `PRD-NNN-name.md` | `PRD-001-event-booking.md` |
| 技術文檔 | `kebab-case.md` | `api-endpoints.md` |
| 指南文檔 | `kebab-case.md` | `deployment-guide.md` |

---

## ⚠️ 維護規則

1. **每輪開發結束必須更新相關文檔**
2. **新增文檔必須添加到本索引**
3. **API 變更必須同步更新文檔**
4. **過期文檔標記 `[DEPRECATED]`**
