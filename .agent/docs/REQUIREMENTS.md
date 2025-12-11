# Party 需求與架構參考

> 整合自 party-aggregator-ui/requirements.md 和 design.md

---

## 核心需求摘要

### 用戶故事

1. **活動發現** - 極簡主界面，快速找到附近活動
2. **導航切換** - 首頁/活動管理/會員中心
3. **快速創建** - 懸浮按鈕發起活動
4. **組織管理** - 俱樂部/資源方/私人群組
5. **地圖探索** - 互動地圖查看附近活動
6. **個人設置** - 語言/主題/通知
7. **動畫體驗** - 流暢過渡（≤300ms）
8. **分享推廣** - 海報/二維碼/推薦追蹤
9. **數據分析** - 曲線圖/漏斗/轉化
10. **簽到系統** - 掃碼/序號/暗號

### 活動類型

- `meetup` 小聚
- `workshop` 小會
- `event` 小活動
- `popup` 小快閃

### 組織類型

- `club` 俱樂部
- `vendor` 個人資源方
- `supplier` 企業資源方
- `private_group` 私人群組

### 會員等級

| 等級 | 價格 | 限制 |
|------|------|------|
| Free | 免費 | 1活動/3參加/3組織 |
| Plus | ¥29/月 | 無限制 |
| Pro | ¥99/月 | +服務+付費活動 |
| Ultra | ¥199/月 | +私人俱樂部 |

---

## 架構概覽

```
Next.js (App Router)
    ↓
Zustand (狀態)
    ↓
Supabase (API + Auth + Storage + Realtime)
    ↓
PostgreSQL
```

### 核心接口

```typescript
// 活動
interface Event {
  id: string;
  code: string;        // 6位數字
  title: string;
  type: 'meetup' | 'workshop' | 'event' | 'popup';
  startTime: Date;
  endTime: Date;
  location: Location;
  capacity: number;
  attendeeCount: number;
  organizerId: string;
  tags: string[];
}

// 組織
interface Organization {
  id: string;
  name: string;
  type: 'club' | 'vendor' | 'supplier' | 'private_group';
  memberCount: number;
  eventCount: number;
  services?: Service[];
  inviteCode?: string;
}

// 用戶
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  membershipTier: 'free' | 'premium' | 'pro';
}
```

---

## 錯誤處理策略

| 類型 | 處理 |
|------|------|
| 網絡錯誤 | 友好提示 + 重試 |
| 驗證錯誤 | 實時表單 + 高亮 |
| 權限錯誤 | 重定向登入 |
| 資源不存在 | 404 + 返回選項 |

---

## 測試金字塔

```
    E2E   10%
  集成測試  30%
  單元測試  60%
```

---

> 完整內容參見原始文件 `party-aggregator-ui/design.md`
