# 數據源清單 (Data Sources)

> **目標**: 收集 100+ 種類，數千個數據來源，覆蓋台灣主要的線下活動。

## ⚖️ 合規與免責原則 (Compliance Guidelines)

1. **著作權 (Copyright)**: 僅抓取事實性資訊 (標題、時間、地點、票價)，避免複製具原創性的描述文本或編輯著作。
2. **個資法 (PDPA)**: 嚴禁抓取非公開的個人資料。若公開資訊含個資 (如聯絡人)，僅用於特定目的且不進行二次利用。
3. **電腦使用罪 (Criminal Code)**: 嚴禁繞過網站安全機制 (如登入驗證、IP 封鎖)，僅存取公開頁面。
4. **Robots.txt**: 遵守目標網站的 `robots.txt` 協議。
5. **引用與導流**: 必須保留原始連結 (Source URL)，將流量導回原主辦方。

## 📱 社交平台與論壇 (Social & Community)

| 名稱 | 網址 | 類型 | 優先級 | 備註 |
|------|------|------|--------|------|
| Threads (TW) | <https://www.threads.net/> | Social | High | 需關鍵字監聽 (#台北活動, #週末) |
| Instagram | <https://www.instagram.com/> | Social | High | 透過 Hashtag 或公開帳號 (需官方 API 或合規工具) |
| Dcard (活動板) | <https://www.dcard.tw/f/event> | Forum | Med | 年輕族群活動為主 |
| X (Twitter) | <https://twitter.com/> | Social | Low | 台灣活動較少，但在 Tech 圈有部分資訊 |
| Facebook Events | <https://www.facebook.com/events> | Social | High | 難度高，優先尋找主辦方粉專 |

## 🎵 Live House & 演出空間

| 名稱 | 網址 | 類型 | 優先級 | 備註 |
|------|------|------|--------|------|
| 女巫店 (Witch House) | <http://www.witchhouse.org/> | Live Music | High | 官網結構老舊，需解析 HTML |
| The Wall Live House | <https://thewall.tw/> | Live Music | High | |
| Legacy Taipei | <https://www.legacy.com.tw/> | Live Music | High | |
| Revolver | <https://www.facebook.com/revolver.taipei> | Live Music | High | FB 來源，需 Graph API 或替代方案 |
| Pipe Live Music | <https://www.facebook.com/pipelivemusic/> | Live Music | Med | |
| 樂悠悠之口 (The UU Mouth) | <https://www.theuumouth.tw/> | Live Music | Med | |
| 河岸留言 (Riverside) | <https://www.riverside.com.tw/> | Live Music | Med | |
| 海邊的卡夫卡 | <https://kafka.com.tw/> | Live Music | Low | |

## 🏃 運動與戶外 (Sports & Outdoor)

| 名稱 | 網址 | 類型 | 優先級 | 備註 |
|------|------|------|--------|------|
| 中華民國路跑協會 | <https://www.sportsnet.org.tw/> | Marathon | High | |
| 伊貝特報名網 | <https://www.bao-ming.com/> | Marathon/Tri | High | 聚合平台，資料豐富 |
| 筆記報名 (Running Biji) | <https://biji.co/> | Marathon | High | |
| 台灣鐵人三項公司 | <https://www.taiwantriathlon.com/> | Triathlon | Med | |
| Accupass (運動分類) | <https://www.accupass.com/> | General | High | |

## 💻 科技與黑客松 (Tech & Hackathons)

| 名稱 | 網址 | 類型 | 優先級 | 備註 |
|------|------|------|--------|------|
| KKTIX (科技分類) | <https://kktix.com/> | Tech | High | |
| Accupass (科技分類) | <https://www.accupass.com/> | Tech | High | |
| COSCUP | <https://coscup.org/> | Conference | High | 年度活動 |
| SITCON | <https://sitcon.org/> | Conference | Med | |
| g0v (零時政府) | <https://g0v.tw/> | Hackathon | Med | |
| DevFest Taipei | <https://gdg.community.dev/gdg-taipei/> | Tech | Med | |

## 🧗 生活風格與興趣 (Lifestyle)

| 名稱 | 網址 | 類型 | 優先級 | 備註 |
|------|------|------|--------|------|
| Meetup.com (Taipei) | <https://www.meetup.com/> | General | High | 語言交換、讀書會為主 |
| 台北市攀岩館列表 | (Aggregation) | Bouldering | Med | 需整理各大岩館 FB/IG |
| 兩廳院售票 (OPENTIX) | <https://www.opentix.life/> | Arts | High | 藝文活動 |
| 誠品講座 | <https://meet.eslite.com/> | Culture | Med | |

## 🌐 社交平台與公開社團 (Social Platforms)

| 名稱 | 網址 | 類型 | 優先級 | 備註 |
|------|------|------|--------|------|
| Facebook Events (Public) | <https://www.facebook.com/events> | General | High | 難度高，需考慮合規性 |
| Instagram Hashtags | #台北活動 #週末去哪 | Discovery | Low | 僅作發現源，非直接數據源 |
| PTT (Drama, Indie-band) | <https://www.ptt.cc/> | Community | Med | 文字解析難度高 |

---

## 📝 爬取策略備註

1. **優先級**: 優先處理結構化程度高 (如 KKTIX, Accupass) 的聚合平台，再處理單一官網 (如女巫店)。
2. **合規性**:
    - 對於 FB/IG，優先尋找主辦方是否有其他公開網頁。
    - 僅抓取「公開」資訊 (標題、時間、地點、摘要)。
    - 導流：詳情頁必須包含 "Official Link" 指向原活動頁面。
