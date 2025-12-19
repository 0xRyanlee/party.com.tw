# TRD — External Data Integration

## 1. Data Model

我們將外部數據映射至 `events` 資料表。以下為欄位映射邏輯：

| Target Field | Description | Source Mapping Logic |
| :--- | :--- | :--- |
| `title` | Event Name | 直接映射 (Direct mapping) |
| `description` | Event Details | HTML 或純文字。需進行 HTML Sanitization。 |
| `date` | Start Date | 轉換為 ISO 8601 格式。 |
| `time` | Start Time | 轉換為 24h 格式 (HH:mm)。 |
| `location_name` | Venue Name | 直接映射。 |
| `address` | Full Address | 若來源缺失，嘗試從場地名稱推斷。 |
| `image_url` | Cover Image | 上傳至 Storage 或使用外部 URL (需注意防盜鏈)。 |
| `source_url` | Original Link | **必須 (Required)** 用於合規與導流。 |
| `external_id` | Unique ID | 格式：`source_name:id` (例: `kktix:12345`)。 |
| `original_data` | Raw JSON | 儲存完整原始 Payload 以便 Debug。 |

## 2. API Contract (Crawler Interface)

雖然此為內部邏輯，但 Crawler 應產出符合以下介面的標準化物件：

```typescript
interface NormalizedEvent {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: {
    name: string;
    address: string;
  };
  source: {
    platform: string; // e.g., 'kktix'
    url: string;
    id: string;
  };
  raw: any;
}
```

## 3. Sequence Flow (Deduplication)

1. **Extract**: 從來源抓取資料。
2. **Normalize**: 轉換為上述標準格式。
3. **Check Existence**:
    * 查詢 `events` table where `external_id` = `normalized.source.id`
4. **Upsert**:
    * 若存在：更新資料 (Update)。
    * 若不存在：檢查複合鍵 (`date` + `title` fuzzy match)。
        * 若複合鍵匹配：視為同一活動，更新並補上 `external_id`。
        * 若無匹配：新增 (Insert)。

## 4. Error / Edge Cases

* **Missing Data**: 若缺乏關鍵欄位 (Title, Date, Location)，則該筆資料應標記為 `draft` 或捨棄，並記錄 Error Log。
* **Timezone**: 所有時間需統一轉換為 UTC 儲存，或明確標記為 `Asia/Taipei`。
* **Rate Limit**: 爬蟲需實作 Backoff 機制，避免觸發來源網站封鎖。

## 5. Security / Performance

* **Compliance**: 嚴格遵守 `robots.txt` 與來源網站的使用條款。不儲存 PII。
* **Indexing**: `external_id` 欄位已建立 Index (`idx_events_external_id`) 以優化去重查詢效能。
* **Sanitization**: `description` 欄位在寫入 DB 前必須過濾惡意 Script (XSS 防護)。
