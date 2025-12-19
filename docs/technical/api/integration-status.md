# API 整合完成小結

## ✅ 已完成的 API 整合

### 1. ApplicationModal 組件

**檔案**: `src/components/ApplicationModal.tsx`  
**連接**: `POST /api/applications`

**功能**:

- 提交申請（角色或資源）
- 驗證聯絡方式必填
- 錯誤處理和成功提示
- 防止重複提交（API 端檢查）

**使用範例**:

```typescript
// 點擊「申請」按鈕後
await fetch('/api/applications', {
  method: 'POST',
  body: JSON.stringify({
    eventId,
    targetRoleId,
    targetResourceId,
    message,
    contactInfo,
  })
});
```

---

### 2. Host Edit 頁面

**檔案**: `src/app/host/edit/page.tsx`  
**連接**:

- `POST /api/events` - 創建活動
- `POST /api/events/[eventId]/roles` - 保存角色需求
- `POST /api/events/[eventId]/resources` - 保存資源需求

**功能**:

- 創建包含所有 MVP 擴展欄位的活動
- 自動保存合作招募資訊（roles & resources）
- 包含新的參與者設定、氛圍屬性、票務資訊
- 完整錯誤處理

**提交流程**:

1. 創建活動 → 獲得 eventId
2. 保存角色需求（如有）
3. 保存資源需求（如有）
4. 顯示成功訊息

---

## 📋 待整合的組件

### 1. Applications 頁面 (我的申請)

**檔案**: `src/app/applications/page.tsx`  
**需連接**: `GET /api/applications?status=xxx`

**待實作**:

```typescript
// 替換 mock 數據
const fetchApplications = async (status?: string) => {
  const response = await fetch(`/api/applications${status ? `?status=${status}` : ''}`);
  const { applications } = await response.json();
  return applications;
};
```

---

### 2. Host Manage 頁面 (申請管理)

**檔案**: `src/app/host/manage/page.tsx`  
**需連接**:

- `GET /api/events/:id` - 獲取活動詳情
- `PATCH /api/applications/:id` - 通過/拒絕申請

**待實作**:

- 獲取該主辦方活動的所有申請
- 實作通過/拒絕按鈕功能

---

### 3. EventDetailModal 組件

**檔案**: `src/components/EventDetailModal.tsx`  
**需連接**:

- `GET /api/events/:id/roles` - 獲取角色列表
- `GET /api/events/:id/resources` - 獲取資源列表

**待實作**:

```typescript
// 替換 mock roles 和 resources
useEffect(() => {
  const fetchOpportunities = async () => {
    const [rolesRes, resourcesRes] = await Promise.all([
      fetch(`/api/events/${eventId}/roles`),
      fetch(`/api/events/${eventId}/resources`)
    ]);
    const { roles } = await rolesRes.json();
    const { resources } = await resourcesRes.json();
    setRoles(roles);
    setResources(resources);
  };
  fetchOpportunities();
}, [eventId]);
```

---

## 🔧 下一步建議

### 優先級 1: 完成頁面級整合

1. **Applications 頁面** - 連接 GET API，顯示真實申請
2. **Host Manage 頁面** - 連接申請審核 API

### 優先級 2: 完善用戶體驗

1. 添加 Loading 狀態組件
2. 實作 Toast 通知（替代 alert）
3. 表單驗證優化

### 優先級 3: 資料同步

1. 提交申請後自動重新加載列表
2. 審核申請後更新狀態
3. WebSocket 或輪詢實時更新

---

## 🐛 已知問題

### 1. Supabase Client 依賴

**問題**: API 路由中使用 `createClient()` from `@/lib/supabase/server`  
**狀態**: 需要確認此函數已正確實作  
**解決**: 檢查 `/src/lib/supabase/server.ts` 是否存在

### 2. Migration 未執行

**問題**: 資料庫尚未應用新的 schema  
**狀態**: 需要執行 `003_event_schema_mvp_expansion.sql`  
**解決**: 參考 `supabase/MIGRATION_GUIDE.md`

### 3. 認證狀態

**問題**: API 需要用戶已登入  
**狀態**: 確認 Supabase Auth 已配置  
**解決**: 測試時確保用戶已登入

---

## ✅ 驗證檢查清單

- [ ] 執行資料庫 migration
- [ ] 測試創建活動（含所有新欄位）
- [ ] 測試提交申請
- [ ] 測試查詢申請列表
- [ ] 測試審核申請
- [ ] 檢查權限控制（非組織者無法審核）
- [ ] 檢查防重複申請機制

---

**估計剩餘時間**: 1-2 小時（完成所有頁面級整合）
