# Data Model

> 資料模型與 Schema 設計

---

## 📋 待定義內容

- [ ] 核心表結構
- [ ] 關聯關係 (ERD)
- [ ] 索引設計
- [ ] RLS Policies

---

## 🗄️ 核心表（草案）

```
users
├── profiles
├── subscriptions
└── memberships

events
├── tickets
├── registrations
├── chat_rooms
│   └── messages
├── event_roles
├── event_resources
└── applications

clubs
├── club_members
└── club_events
```

---

## 📎 現有參考

- `supabase/migrations/` 目錄下的 migration 文件
- `docs/data_mapping.md` (舊版映射)

---

## 🔗 相關文件

- [FRD-Event](../02-Requirements/FRD/FRD-Event.md)
- [State-Machine](./State-Machine.md)
