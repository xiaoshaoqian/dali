# 个人页 (Profile Page)

**页面标识：** `ProfileScreen`
**导航路径：** 首页 → 点击头像
**设计版本：** v1.1
**最后更新：** 2026-01-04

---

## 页面概述

### 页面目标
- **主要目标**：展示用户形象与 AI 学习进度。
- **视觉目标**：利用 **Concave Header** 和 **Dashboard Stats** 打造高端仪表盘感。

---

## 设计方向 (v1.1)

**核心视觉特征：**
- **Concave Header**: 顶部紫色极光背景，底部反向圆角。
- **Floating Dashboard**: 统计数据以悬浮卡片形式展示（2x2 网格）。
- **Settings Entry**: 入口统一整合。

---

## 布局结构

```
┌─────────────────────────────────┐
│  [Header - Mesh Gradient]        │ 180px
│  [Nav: Settings Icon]            │
│  [Avatar & Name]                 │
│  (Concave Radius Bottom 32px)    │
│─────────────────────────────────│
│                                 │
│  [Dashboard Stats Grid]          │
│  ┌─────┐ ┌─────┐               │
│  │ Lv3 │ │ 85% │               │
│  └─────┘ └─────┘               │
│                                 │
│  [Menu List (Floating)]          │
│  ┌─────────────────────────┐   │
│  │ My Sizes                │   │
│  ├─────────────────────────┤   │
│  │ Preferences             │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## 组件清单

### 1. 头部 (Profile Header)
- **背景**: Mesh Gradient
- **内容**: 
  - 头像 (带发光光环)
  - 用户名 & ID
  - 设置按钮 (右上角)

### 2. 统计仪表盘 (Stats Dashboard)
- **布局**: Grid 2x1 or 2x2
- **卡片**: 
  - 风格等级 (Level)
  - 风格报告 (Chart)

### 3. 设置入口
- 点击右上角设置图标 -> 跳转 [Settings Page](settings-page.html)

---

## 原型文件
- [profile-page.html](profile-page.html)
