# 🗺️ Google Maps API 整合指南

## 步驟 1：獲取 API Key

### 1.1 前往 Google Cloud Console

1. 訪問：<https://console.cloud.google.com/>
2. 登入您的 Google 帳號
3. 創建新專案或選擇現有專案

### 1.2 啟用必要的 API

前往 **APIs & Services** → **Library**，搜索並啟用以下 API：

- ✅ **Places API** （地點搜索）
- ✅ **Geocoding API** （地址轉座標）
- ✅ **Maps JavaScript API** （地圖顯示，可選）

### 1.3 創建 API Key

1. 前往 **APIs & Services** → **Credentials**
2. 點擊 **+ CREATE CREDENTIALS** → **API key**
3. 複製生成的 API Key

### 1.4 限制 API Key（重要！）

為了安全，建議限制 API Key 使用：

#### 應用程式限制

- 選擇 **HTTP referrers (web sites)**
- 添加允許的網域：

  ```
  http://localhost:3000/*
  https://yourdomain.com/*
  ```

#### API 限制

- 選擇 **Restrict key**
- 僅選擇以下 API：
  - Places API
  - Geocoding API
  - Maps JavaScript API

## 步驟 2：配置環境變數

### 2.1 創建 `.env.local` 文件

在專案根目錄創建（如果不存在）：

```bash
cp .env.local.example .env.local
```

### 2.2 添加 API Key

編輯 `.env.local`，添加您的 API Key：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...您的API_KEY
```

⚠️ **重要**：

- 變數名必須以 `NEXT_PUBLIC_` 開頭（Next.js 客戶端環境變數）
- **不要**提交 `.env.local` 到 Git（已在 .gitignore）

## 步驟 3：安裝依賴套件

```bash
npm install @googlemaps/js-api-loader
```

這個套件會自動載入 Google Maps JavaScript API。

## 步驟 4：重啟開發伺服器

環境變數變更後需要重啟：

```bash
# 停止當前伺服器（Ctrl+C）
# 重新啟動
npm run dev
```

## 步驟 5：測試功能

### 5.1 打開活動編輯頁面

```
http://localhost:3000/host/edit
```

### 5.2 測試地點搜索

1. 滾動到「活動地點」區塊
2. 在搜索框輸入地點名稱，例如：
   - "台北101"
   - "西門町"
   - "師大夜市"
3. 應該看到自動完成建議
4. 點擊建議項目，自動填入座標

### 5.3 測試當前位置

1. 點擊「使用當前位置」按鈕
2. 瀏覽器會請求位置權限
3. 允許後，自動填入當前地址和座標

### 5.4 測試手動輸入

- 如果 API 無法使用，仍可手動輸入
- 輸入地點名稱和地址

## 功能說明

### LocationPicker 組件功能

#### 🔍 自動完成搜索

- 使用 Google Places Autocomplete API
- 支援中文搜索
- 限制台灣地區結果
- 最少 2 個字符觸發搜索

#### 📍 地點詳情

- 自動獲取完整地址
- 獲取準確的 GPS 座標（lat/lng）
- 地點名稱格式化

#### 🗺️ 反向地理編碼

- 從 GPS 座標轉換為地址
- 支援「使用當前位置」功能
- 中文地址顯示

#### ⚠️ 錯誤處理

- API Key 未設置時顯示提示
- 降級為手動輸入模式
- 載入狀態顯示

## 常見問題

### Q1: API Key 無效

**錯誤訊息**: `Google Maps API Key 未設置` 或載入失敗

**解決方案**:

1. 確認 `.env.local` 文件存在
2. 確認變數名稱為 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. 確認已重啟開發伺服器
4. 檢查 API Key 是否正確

### Q2: 搜索無結果

**可能原因**:

- API 尚未生效（需要幾分鐘）
- API Key 限制設置過嚴
- Places API 未啟用

**解決方案**:

1. 等待 5-10 分鐘
2. 檢查 Google Cloud Console → Credentials → API Key 限制
3. 確認 Places API 已啟用

### Q3: 當前位置無法使用

**可能原因**:

- HTTPS 要求（localhost 除外）
- 用戶拒絕位置權限
- 瀏覽器不支援

**解決方案**:

- 在 localhost 測試
- 生產環境需使用 HTTPS
- 檢查瀏覽器設定

### Q4: 費用問題

**說明**:

- Google Maps Platform 提供**每月 $200 美元免費額度**
- Places API：每 1000 次請求約 $17-32
- Geocoding API：每 1000 次請求約 $5

**預估使用量**:

- 小型應用：通常免費額度足夠
- 建議設置使用量警報

**設置預算警報**:

1. Google Cloud Console → Billing
2. Budgets & alerts
3. 設置每月預算上限

## API 使用限制

### 免費額度（每月）

- Places Autocomplete：28,500 次
- Place Details：100,000 次
- Geocoding：40,000 次

### 請求限制

- 每秒最多 50 次請求
- 建議實作搜索防抖（debounce）

## 下一步優化

### 1. 添加地圖視圖

```typescript
// 可在 LocationPicker 中添加嵌入式地圖
<div className="h-64 rounded-xl overflow-hidden">
  <GoogleMap center={...} zoom={15} />
</div>
```

### 2. 搜索防抖

```typescript
// 減少 API 調用次數
const debouncedSearch = useMemo(
  () => debounce(searchLocation, 300),
  [searchLocation]
);
```

### 3. 快取搜索結果

```typescript
// 使用 React Query 或 SWR 快取
const { data } = useQuery(['places', query], () => searchLocation(query));
```

## 相關資源

- [Google Maps Platform 文檔](https://developers.google.com/maps/documentation)
- [Places API 參考](https://developers.google.com/maps/documentation/places/web-service)
- [定價說明](https://mapsplatform.google.com/pricing/)
- [API Key 最佳實踐](https://developers.google.com/maps/api-security-best-practices)

---

**完成設置後，LocationPicker 將提供完整的地點搜索和選擇功能！** 🎉
