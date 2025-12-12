# Event Tracking Spec

> 事件追蹤規格

---

## 📋 待定義內容

- [ ] 事件命名規範
- [ ] 事件屬性定義
- [ ] 事件觸發時機
- [ ] 數據驗證規則

---

## 📊 核心事件清單（草案）

### V0 必追蹤

| 事件名稱 | 觸發時機 | 關鍵屬性 |
|----------|----------|----------|
| `view_event` | 進入活動詳情頁 | event_id, source |
| `register_event` | 完成報名 | event_id, ticket_type |
| `check_in` | 簽到成功 | event_id |
| `open_chat` | 開啟聊天室 | event_id |
| `send_message` | 發送訊息 | event_id, message_type |

### V1 新增

| 事件名稱 | 觸發時機 | 關鍵屬性 |
|----------|----------|----------|
| `upgrade_prompt` | 顯示升級提示 | trigger, current_tier |
| `upgrade_complete` | 完成升級 | from_tier, to_tier |
| `rate_host` | 評價 Host | event_id, rating |

---

## 🔗 相關文件

- [Attendee-Journey](../01-Product/User-Journey/Attendee-Journey.md)
- [Host-Journey](../01-Product/User-Journey/Host-Journey.md)
