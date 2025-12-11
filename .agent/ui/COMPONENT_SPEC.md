# Party UI Component Spec

**用途**: 組件開發規格說明，確保一致性

---

## 📐 設計 Token

### 顏色

```css
/* 使用 CSS 變數 */
--background   /* 背景色 */
--foreground   /* 前景色 */
--primary      /* 主色 */
--secondary    /* 次要色 */
--muted        /* 柔和色 */
--accent       /* 強調色 */
--destructive  /* 危險色 */
--border       /* 邊框色 */
```

### 間距

```
4px 基礎單位
p-1=4px, p-2=8px, p-4=16px, p-6=24px, p-8=32px
```

### 圓角

```css
--radius: 0.625rem  /* 基礎 10px */
rounded-sm=6px, rounded-md=8px, rounded-lg=10px
```

---

## 🧱 組件規格

### Button

```tsx
// 變體: default | outline | ghost | destructive | link
// 尺寸: sm | default | lg | icon
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">
  按鈕
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>標題</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>內容</CardContent>
  <CardFooter>頁腳</CardFooter>
</Card>
```

### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>打開</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>標題</DialogTitle>
      <DialogDescription>描述</DialogDescription>
    </DialogHeader>
    {/* 內容 */}
    <DialogFooter>
      <Button>確認</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form (RHF + Zod)

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

### Sheet (側邊抽屜)

```tsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button>打開</Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>標題</SheetTitle>
    </SheetHeader>
    {/* 內容 */}
  </SheetContent>
</Sheet>
```

---

## 📱 響應式斷點

```
sm: 640px   # 手機橫屏
md: 768px   # 平板
lg: 1024px  # 桌面
xl: 1280px  # 大桌面
2xl: 1536px # 超大屏
```

---

## ✅ 組件開發規則

1. **優先使用 shadcn/ui 組件**
2. **使用 Tailwind CSS 樣式**
3. **使用 Lucide React 圖標**
4. **確保無障礙支持 (ARIA)**
5. **支持深淺色模式**
6. **響應式設計優先**

---

## 📦 新組件安裝

```bash
npx shadcn@latest add [component-name]
```

常用組件列表: <https://ui.shadcn.com/docs/components>
