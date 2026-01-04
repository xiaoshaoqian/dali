# 搭配列表页 (原衣橱页)

**页面标识：** `OutfitListScreen` (prev: WardrobeScreen)
**导航路径：** 首页 → 查看全部搭配
**设计版本：** v1.1
**最后更新：** 2026-01-04

---

## 页面概述

### 页面目标
- **主要目标**：浏览和管理历史生成的 AI 搭配方案。
- **视觉目标**：采用 **Concave Header** 保持全局统一。

---

## 布局结构

```
┌─────────────────────────────────┐
│  [Header - Mesh Gradient]        │
│  [Search Bar & Filter]           │
│  (Concave Radius Bottom 32px)    │
│─────────────────────────────────│
│                                 │
│  [Control Bar (Transparent)]     │
│  [Total: 12]     [Sort: Newest]  │
│                                 │
│  [Outfit Grid / List]            │
│  ┌──────────┐ ┌──────────┐     │
│  │ Image    │ │ Image    │     │
│  │ Title    │ │ Title    │     │
│  └──────────┘ └──────────┘     │
│                                 │
└─────────────────────────────────┘
```

---

## 组件清单

### 1. 头部 (Search Header)
- **背景**: Mesh Gradient
- **内容**: 搜索框 (半透明白色)、筛选按钮。
- **形状**: 底部反向圆角 32px。

### 2. 列表 (Outfit Grid)
- **布局**: Masonry 或 Grid。
- **卡片**: 缩略图 + 标题 + 日期。

---

## 原型文件
- [outfit-page.html](outfit-page.html)
