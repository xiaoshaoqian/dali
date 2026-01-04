# 设置中心 (Settings Pages)

**页面标识：** `SettingsPage` & Sub-pages
**导航路径：** 个人页 (Profile) → 设置图标 (⚙️) → 设置中心
**设计版本：** v1.0
**最后更新：** 2026-01-04

---

## 页面概述

### 页面目标
- 提供用户账号管理、隐私偏好设置、帮助与反馈的集中入口。
- 保持与 Profile 页面一致的视觉风格（浮层卡片、Header 体系）。

### 包含页面
1.  **设置首页 (`settings-page.html`)**: 聚合入口列表。
2.  **账号安全 (`settings-security.html`)**: 密码、手机号绑定。
3.  **隐私设置 (`settings-privacy.html`)**: 谁可以看到我、个性化推荐开关。
4.  **帮助反馈 (`settings-help.html`)**: FAQ、在线客服。
5.  **关于我们 (`settings-about.html`)**: 版本号、隐私协议、服务条款。

---

## 设计方向

**核心视觉特征：**
- **iOS Settings 风格**: 经典的 Grouped List 布局。
- **Concave Header**: 继承全局紫色头图体系，保持沉浸感。
- **Floating Cells (悬浮列表)**: 列表项被包裹在圆角卡片中，而非简单的通栏分割线。

---

## 布局结构 (通用模板)

```
┌─────────────────────────────────┐
│  [Header - Purple Gradient]     │ 120px
│  [Nav Bar: ← Back   Title]      │
│  (Concave Radius Bottom 32px)   │
│─────────────────────────────────│
│  [Content Area - Gray BG]       │
│                                 │
│  [Group Card 1]                 │
│  ┌───────────────────────────┐  │
│  │ Icon  Label          >    │  │ Cell
│  ├───────────────────────────┤  │
│  │ Icon  Label          >    │  │ Cell
│  └───────────────────────────┘  │
│                                 │
│  [Group Card 2]                 │
│  ┌───────────────────────────┐  │
│  │ Icon  Label    Value >    │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## 组件清单

### 1. 导航栏 (Header)
- **背景**: Mesh Gradient (Purple)
- **返回按钮**: 白色箭头
- **标题**: 白色，居中，Semibold

### 2. 设置列表组 (Settings Group)
- **容器**: `div.settings-group`
- **样式**:
  - `background: #fff`
  - `border-radius: 16px`
  - `margin: 0 20px 20px` (左右 20px，下距 20px)
  - `overflow: hidden`

### 3. 设置项 (Settings Item)
- **容器**: `div.settings-item`
- **布局**: Flex Row (Icon - Text - Spacer - Value - Arrow)
- **图标**: 左侧 28x28px，带彩色背景容器 (圆角 6px)
- **分割线**: Item 之间有 `border-bottom`，最后一个 Item 无边框。

### 4. 退出登录按钮 (Log Out)
- **样式**: 全宽按钮，白色背景，红色文字，居中。
- **位置**: 设置首页最底部。

---

## 页面详情

### 设置首页 (`settings-page.html`)
- **Group 1 (Account)**: 个人资料、账号安全
- **Group 2 (Preferences)**: 消息通知、通用设置、隐私设置
- **Group 3 (Support)**: 帮助与反馈、关于我们
- **Action**: 退出登录

### 账号安全 (`settings-security.html`)
- 修改密码
- 绑定手机/邮箱
- 注销账号 (Danger Zone)

### 隐私设置 (`settings-privacy.html`)
- 开关项 (Toggle Switch):
  - "允许通过手机号搜索到我"
  - "个性化广告推荐"
  - "展示我的在线状态"

### 关于我们 (`settings-about.html`)
- Logo 展示 (Dali Icon)
- 版本号 text (v1.0.0)
- 链接列表 (服务协议、隐私政策)

---

## 状态定义

- **Switch On/Off**: iOS 风格 Toggle。
  - On: 绿色背景 (`#34C759`)
  - Off: 灰色背景 (`#E9E9EA`)
- **Hover/Active**: 点击列表项时，背景变深灰色 (`#F2F2F7`) 以提供反馈。

---

## 原型文件
- [settings-page.html](../05-profile/settings-page.html)
- [Sub-pages](../05-profile/)
