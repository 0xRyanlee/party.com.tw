# Permission Matrix

> 權限控制矩陣

---

## 📋 待定義內容

- [ ] 各角色（Guest / User / Host / Admin）權限列表
- [ ] 各會員等級（Free / Plus / Pro）權限差異
- [ ] 資源層級權限（Event / Chat / Club）

---

## 🎯 權限矩陣（草案）

### 按角色

| 操作 | Guest | User | Host | Admin |
|------|-------|------|------|-------|
| 瀏覽活動 | ✅ | ✅ | ✅ | ✅ |
| 報名活動 | ❌ | ✅ | ✅ | ✅ |
| 建立活動 | ❌ | ❌ | ✅ | ✅ |
| 刪除活動 | ❌ | ❌ | own | ✅ |
| 管理用戶 | ❌ | ❌ | ❌ | ✅ |

### 按會員等級

| 功能 | Free | Plus | Pro |
|------|------|------|-----|
| 同時舉辦活動數 | 1 | 5 | ∞ |
| 單場人數上限 | 50 | 500 | ∞ |
| 聊天室延長 | ❌ | ✅ | ✅ |
| 進階票務 | ❌ | ✅ | ✅ |
| 合作招募 | ❌ | ✅ | ✅ |
| 數據報表 | 基本 | 完整 | API |

---

## 🔗 相關文件

- [Subscription-Pricing-PRD](../01-Product/Feature-PRD/Subscription-Pricing-PRD.md)
- [FRD-Subscription](./FRD/FRD-Subscription.md)
