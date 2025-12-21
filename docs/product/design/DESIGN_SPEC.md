# Party Aggregator 設計規範

> 最後更新：2025-12-22
> 版本：1.0

---

## 視覺設計系統

### 色彩

| 用途 | 顏色 | CSS |
|------|------|-----|
| 主色 | 黑色 | `#000000` |
| 背景 | 中性灰白 | `#FAFAFA` |
| 卡片 | 白色 | `#FFFFFF` |
| 次要文字 | 灰色 | `#71717A` |
| 成功 | 綠色 | `#22C55E` |
| 警告 | 橙色 | `#F97316` |
| 錯誤 | 紅色 | `#EF4444` |

### 圓角

| 元素 | 圓角 |
|------|------|
| 按鈕 | `rounded-full` |
| 卡片 | `rounded-xl` |
| 輸入框 | `rounded-lg` |
| Modal | `rounded-2xl` |
| 頭像 | `rounded-full` |

### 字體

- **主字體**: system-ui, -apple-system, sans-serif
- **標題**: font-black, tracking-tight
- **正文**: font-normal
- **按鈕**: font-bold

### 間距

- 使用 4px 基準（Tailwind 預設）
- 頁面邊距：`px-4 md:px-6`
- 卡片內距：`p-4 md:p-6`
- 元素間距：`gap-4`

---

## UI 組件規範

### 按鈕

```tsx
// Primary Button
<Button className="bg-black text-white rounded-full font-bold">
  文字
</Button>

// Secondary Button
<Button variant="outline" className="rounded-full">
  文字
</Button>
```

### 卡片

```tsx
<Card className="bg-white rounded-xl border border-neutral-200 shadow-sm">
  <CardContent className="p-4">
    內容
  </CardContent>
</Card>
```

### 表單

- 標籤：灰色小字
- 輸入框：白底、灰邊框、focus 時黑邊框
- 錯誤：紅色邊框 + 紅色提示文字

---

## 動效規範

### 過渡

- 預設：`transition-all duration-200`
- 按鈕懸停：`hover:bg-zinc-800`
- 卡片懸停：`hover:shadow-md`

### 動畫

- 使用 Framer Motion
- 入場：`initial={{ opacity: 0, y: 20 }}`
- 出場：`exit={{ opacity: 0 }}`

---

## 響應式斷點

| 斷點 | 寬度 | 用途 |
|------|------|------|
| sm | 640px | 手機橫屏 |
| md | 768px | 平板 |
| lg | 1024px | 筆電 |
| xl | 1280px | 桌面 |

---

## 圖標

- 使用 Lucide React
- 預設大小：`w-4 h-4` 或 `w-5 h-5`
- 顏色繼承父元素

---

## 無障礙

- 所有按鈕有 aria-label
- 圖片有 alt 屬性
- 表單有 label 關聯
- 對比度符合 WCAG AA
