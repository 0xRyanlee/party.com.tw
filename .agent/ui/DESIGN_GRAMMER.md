PARTY DESIGN GRAMMAR v1（LLM 解析版 / 中英文）

⸻

0. Purpose / 目的

EN (Rule):
The Design Grammar defines how every UI element in Party behaves, aligns, scales, and interacts.
It ensures structural consistency across all views, devices, and LLM-generated components.

CN（註釋）:
這部分定義 Party UI「如何排列、如何縮放、如何互動」。
LLM 只要遵守此語法，就能生成一致、可控的 UI。

⸻

1. Grid System / 網格系統

EN (Rule):
 • Use a 12-column grid on desktop.
 • Use a 4-column grid on mobile.
 • Gutter: 24px desktop / 16px mobile.
 • Max content width: 1200px.
 • All components must snap to grid edges; no free-floating elements.
 • Hero media aligns to full-width grid but respects safe padding.

CN（註釋）:
桌面 12 欄、手機 4 欄。間距固定。所有元素必須貼齊欄位，不能漂浮。
Hero 是可滿版，但內文仍要遵守安全邊距。

⸻

2. Spacing System / 間距語法

EN (Rule):

Use a modular scale spacing system:
4, 8, 12, 16, 24, 32, 48, 64 px.
 • Small components (tags, badges): 4–8px
 • Lists / cards internal padding: 16–24px
 • Section spacing: 48–64px
 • No spacing outside this scale is allowed unless explicitly required.

CN（註釋）:
間距採模組化尺度（4–64px）。
不允許出現不符合尺度的任意間距，保持設計節奏統一。

⸻

3. Layout Hierarchy / 版面階層語法

EN (Rule):

Every screen follows this hierarchy:

 1. Primary Section（title, key action, global filter）
 2. Secondary Section（lists, tabs, cards）
 3. Tertiary Section（meta info, host summary, related events）

Hierarchy is expressed via:
 • spacing
 • typography size
 • alignment
 • not color or decoration

CN（註釋）:
頁面階層＝主區塊 → 次區塊 → 三階區塊。
階層只能藉由「空間、字級、對齊」表現，不能用顏色或裝飾。

⸻

4. Card Types / 卡片語法

Party 有 3 類卡片：

⸻

4.1 Event Card（最核心）

EN (Rule):

Structure (top → bottom):

 1. Hero media（image/video, 30% emotional weight max）
 2. Title（single or two-line max）
 3. Datetime
 4. Location
 5. Tag set
 6. Host summary（minimal）

Constraints:
 • Aspect ratio for hero: 16:9 or 4:3 fixed
 • Hero media must not distort layout
 • No heavy shadow, no gradient UI
 • Event color comes only from media and tags

CN（註釋）:
活動卡片＝Hero（不可超過 30%）＋標題＋時間＋地點＋標籤＋主辦摘要。
Hero 有固定比例，平台不加顏色。

⸻

4.2 Inline Card（用於列表或側欄）

EN (Rule):
 • Minimal layout
 • No media unless critical
 • Text: Title → Meta（time/location）
 • Compact spacing only (8–16px)

CN（註釋）:
行內卡片＝極簡、無媒體、小資訊用。

⸻

4.3 Host Card

EN (Rule):

Must include:
 • Host name
 • Role (Host / Vendor / Collaborator)
 • Key metric (events hosted, attendance, credibility score)

Must not include:
 • Personality photos
 • Biography paragraphs

CN（註釋）:
主辦卡片以資料為主，不做人設，不放自拍、不放長文介紹。

⸻

5. Page Types / 頁面語法

Party 主要有以下頁面類型：

⸻

5.1 Event List Page

EN (Rule):
 • Filter bar at top (functional, not decorative)
 • Layout: 3-column card grid desktop / 1-column mobile
 • Sorting always available
 • Persistent location context (city/area) shown subtly

CN（註釋）:
活動列表頁＝篩選列＋卡片網格。
地區資訊微弱呈現，不喧賓奪主。

⸻

5.2 Event Detail Page

EN (Rule):

Sections must appear in strict order:

 1. Hero (image/video)
 2. Title & Core Actions
 3. Time & Location
 4. Tags
 5. Description (user content)
 6. Host Block（Event CV style）
 7. Related Events

CN（註釋）:
活動詳情的順序是固定的，不可打亂。
主辦區在描述之後，但在推薦之前。

⸻

5.3 Host Profile Page

EN (Rule):

Host page = Event CV
Required elements:
 • Name
 • Host metrics (events hosted, attendance, reliability)
 • Timeline of events
 • Network graph (host ↔ participants ↔ events)

Forbidden:
 • Personality-driven content
 • Large portraits
 • Social media–style feeds

CN（註釋）:
主辦頁＝履歷＋事件軌跡＋行為圖譜。
禁止像社群一樣展示個性。

⸻

5.4 Tag Semantic Page

EN (Rule):
 • Tag header
 • Description (1 short sentence)
 • Event list filtered by tag
 • Related tags (semantic neighbors)

CN（註釋）:
標籤頁呈現該語意的活動，不過度解釋語感。

⸻

6. Interaction Grammar / 互動語法

EN (Rule):
 • All interactions must be functional and minimal.
 • Transition speed: 0.12–0.2s.
 • Allowed motions: fade, slide, opacity.
 • Forbidden motions: bounce, elastic, playful dynamics.

Border Radius Rules:
 • Buttons: rounded-full (pill shape) for all interactive buttons
 • Input fields: rounded-full (pill shape) for search bars and text inputs
 • Tags / Badges: rounded-full (pill shape)
 • Dialogs / Modals: rounded-xl or rounded-2xl (large but not pill)
 • Cards: rounded-lg or rounded-xl (medium radius, NOT rounded-full)
 • Card internal elements follow card styling

 • Hover states: minimal elevation or subtle border-darken.

CN（註釋）:
互動＝極簡功能性。
動效速度固定，不允許彈跳。
按鈕、輸入框、標籤使用膠囊形狀 (rounded-full)。
卡片使用中等圓角 (rounded-lg/xl)，不使用膠囊形狀。

⸻

7. Iconography Rules / 圖示語法

EN (Rule):
 • Line icons, 1.5–2px stroke
 • No filled icons
 • No emoji
 • Icons represent function, not emotion
 • Iconography should resemble civic wayfinding (metro-style simplicity)

CN（註釋）:
icons 用線性風、不可填滿、不可用 emoji。
語言上要像城市導覽標識。

⸻

8. Data → UI Mapping Rules / 資料如何對應到 UI

EN (Rule):

UI always prioritizes:

 1. Truthfulness of data
 2. Clarity of hierarchy
 3. No inferred emotions
 4. No generated decorative media

Data fields map to UI as follows:
 • event.title → primary heading
 • event.datetime → second-level meta
 • event.location → second-level meta
 • event.tags[] → semantic indicators
 • event.host → provenance block

CN（註釋）:
資料映射嚴格固定，不允許 LLM 為了美觀而添加虛構資訊。

⸻

9. Forbidden Patterns / 嚴禁語法

EN (Rule):

LLM must not output:
 • Social-media style feeds
 • Personality-driven host pages
 • Gradient UI backgrounds
 • Overly colorful templates
 • Playful illustrations
 • Cards without hero-safe padding
 • Non-grid layouts
 • Floating elements
 • Decorative patterns
 • Emotion-first designs

CN（註釋）:
禁止社群化、可愛化、裝飾化、脫離 grid、過度情緒的 UI。

⸻

10. Meta Rule：Role of the Platform / 平台角色的最高規則

EN (Rule):
The platform is infrastructure, not personality.
The event is the protagonist, not the platform.
Every LLM-generated UI must reinforce this separation.

CN（註釋）:
平台是基礎設施，不是敘事者；活動才是主角。
所有 UI 都要遵守這個層級關係。
