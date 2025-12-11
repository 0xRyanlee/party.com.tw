---
description: 如何添加新 UI 組件
---

# 添加新 UI 組件

## 1. 優先使用 shadcn/ui

```bash
# 檢查是否有現成組件
# https://ui.shadcn.com/docs/components

# 安裝組件
npx shadcn@latest add [component-name]
```

## 2. 常用組件命令

```bash
# 表單
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add switch

# 反饋
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add skeleton

# 導航
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add breadcrumb
npx shadcn@latest add pagination

# 疊加層
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add popover
npx shadcn@latest add tooltip

# 數據
npx shadcn@latest add table
npx shadcn@latest add card
npx shadcn@latest add accordion
```

## 3. 組件位置

- shadcn 組件: `src/components/ui/`
- 業務組件: `src/components/`

## 4. 參考文檔

- DRD: `.agent/ui/DRD.md`
- 組件規格: `.agent/ui/COMPONENT_SPEC.md`
- shadcn 官方: <https://ui.shadcn.com>
