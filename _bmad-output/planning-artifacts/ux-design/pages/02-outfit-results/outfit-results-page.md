# 方案展示页 - 搭配结果

**页面标识：** `OutfitResultsPage` / `OutfitResultsScreen`
**导航路径：** 首页 → 拍照/选择照片 → 选择场合 → 方案展示页
**设计版本：** v1.1
**最后更新：** 2026-01-04

---

## 页面概述

### 页面目标
- **主要目标**：展示 AI 生成的搭配方案，利用 **Concave Header** 创造强烈的品牌视觉冲击。

---

## 设计方向 (v1.1)

**核心视觉特征：**
- **Mesh Gradient Header**: 顶部强烈的紫色极光背景。
- **Concave Integration**: 成功提示 (Success Banner) 与 Header 融为一体，下方连接反向圆角。
- **Card Carousel**: 卡片向上探入圆角区域，形成层次感。

---

## 布局结构

```
┌─────────────────────────────────┐
│  [Header - Mesh Gradient]        │ 120px
│  [Nav: ← Back   AI Recommend]    │
│  [Success Banner]                │
│  (Concave Radius Bottom 32px)    │
│─────────────────────────────────│
│                                 │
│  [Carousel Area]                 │
│  (Margin Top: -10px)             │
│  ┌─────────────────────────┐   │
│  │ [Card 1]                  │   │
│  │ (Rounded 24px)            │   │
│  └─────────────────────────┘   │
│       ⚫ ⚪ ⚪                  │
│                                 │
│─────────────────────────────────│
│  [Bottom Action Area]            │
│  [Detail] [Share] [Regen]        │
└─────────────────────────────────┘
```

---

## 组件清单

### 1. 头部 (Concave Header)
- **背景**: Mesh Gradient (`#8B7FFF`, `#6C63FF`)
- **形状**: 底部 `border-radius: 32px 32px 0 0` (via pseudo-element overlay)
- **内容**: 
  - 返回按钮 (玻璃态)
  - 标题 (白色)
  - 成功提示 (半透明胶囊)

### 2. 方案卡片 (Outfit Card)
- **样式**:
  - 背景: 白色
  - 圆角: 24px
  - 阴影: `0 4px 16px rgba(0,0,0,0.1)`
- **交互**: 左右滑动切换 (Paging)。

### 3. 操作栏 (Bottom Bar)
- **背景**: 白色/透明
- **按钮**: 
  - "查看详情" (紫色主按钮)
  - "分享" (灰色次按钮)

---

## 交互规范

- **进入动画**: 卡片从底部依次滑入 (Staggered Slide Up)。
- **Header**: 固定不动，卡片在其下方/部分重叠区域滑动。

---

## 原型文件
- [outfit-results-page.html](outfit-results-page.html)
