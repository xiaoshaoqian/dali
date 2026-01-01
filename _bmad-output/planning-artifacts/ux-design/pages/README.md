# 搭理 App - UX 设计页面索引

**设计版本:** v1.0
**最后更新:** 2025-12-31

---

## 📱 页面结构总览

本目录包含搭理 App 的所有 UX 设计页面，每个页面包含：
- **MD 文档**: 详细的设计规范（布局、组件、交互、动画）
- **HTML 原型**: 可交互的高保真原型（iPhone 15 Pro 尺寸：393×852px）

---

## 🗂️ 页面清单

### 主要页面 (Main Pages)

| 页面 | 标识 | 文档 | 原型 | 说明 |
|------|------|------|------|------|
| **欢迎页** | WelcomeScreen | [📄](06-welcome-onboarding/welcome-onboarding-page.md) | [🔗](06-welcome-onboarding/welcome-onboarding-page.html) | 首次启动引导页 |
| **首页** | HomeScreen | [📄](01-home/home-page.md) | [🔗](01-home/home-page.html) | 核心入口：拍照/相册 + 历史记录 |
| **首页空状态** | HomeEmptyState | 见首页文档 | [🔗](01-home/home-page-empty.html) | 无历史记录的空状态 |
| **搭配方案结果** | OutfitResultsScreen | [📄](02-outfit-results/outfit-results-page.md) | [🔗](02-outfit-results/outfit-results-page.html) | 显示 3 个 AI 生成的搭配方案 |
| **方案详情** | OutfitDetailScreen | [📄](03-outfit-detail/outfit-detail-page.md) | [🔗](03-outfit-detail/outfit-detail-page.html) | 搭配详情 + 色彩理论可视化 |
| **衣橱** | WardrobeScreen | [📄](04-wardrobe/wardrobe-page.md) | [🔗](04-wardrobe/wardrobe-page.html) | 历史搭配记录 + 搜索/筛选 |
| **个人页** | ProfileScreen | [📄](05-profile/profile-page.md) | [🔗](05-profile/profile-page.html) | 用户资料 + AI 学习进度 |

### 流程页面 (Flow Pages)

| 页面 | 标识 | 文档 | 原型 | 说明 |
|------|------|------|------|------|
| **场合选择弹窗** | OccasionSelectorModal | [📄](07-flow-pages/occasion-selector.md) | [🔗](07-flow-pages/occasion-selector.html) | Bottom Sheet：选择穿搭场合 + AI 推荐 |
| **拍照+场合选择** | PhotoOccasionScreen | [📄](07-flow-pages/photo-occasion.md) | [🔗](07-flow-pages/photo-occasion.html) | 照片预览 + 场合/风格选择 |
| **AI 生成中** | AILoadingScreen | [📄](07-flow-pages/ai-loading.md) | [🔗](07-flow-pages/ai-loading.html) | 加载状态 + 进度条 + 骨架屏 |

### 分享功能 (Share Feature)

| 页面 | 标识 | 文档 | 原型 | 说明 |
|------|------|------|------|------|
| **分享模板** | ShareTemplatesModal | [📄](08-share/share-templates.md) | [🔗](08-share/share-templates.html) | 选择分享模板 + 多平台分享 |

---

## 🔄 核心用户流程

### 完整搭配生成流程

```mermaid
flowchart TD
    A[启动 App] --> B{首次使用?}

    B -->|是| C[欢迎页<br/>WelcomeScreen]
    B -->|否| D[首页<br/>HomeScreen]

    C --> D

    D --> E{用户操作}

    E -->|点击拍照| F[系统相机]
    E -->|点击相册| G[系统相册]
    E -->|点击历史记录| H[方案详情<br/>OutfitDetailScreen]

    F --> I[拍摄照片]
    G --> J[选择照片]

    I --> K[拍照+场合选择<br/>PhotoOccasionScreen]
    J --> K

    K --> L[选择场合 + 风格偏好]
    L --> M[点击"生成搭配方案"]

    M --> N[AI 生成中<br/>AILoadingScreen]
    N --> O[搭配方案结果<br/>OutfitResultsScreen]

    O --> P{用户操作}

    P -->|点击方案卡片| Q[方案详情<br/>OutfitDetailScreen]
    P -->|左右滑动| O

    Q --> R{用户操作}

    R -->|点击分享| S[分享模板<br/>ShareTemplatesModal]
    R -->|返回| O

    S --> T[选择模板 + 平台]
    T --> U[分享完成]
```

### 快捷流程：查看历史

```mermaid
flowchart TD
    A[首页<br/>HomeScreen] --> B{用户操作}

    B -->|点击"最近搭配"| C[方案详情<br/>OutfitDetailScreen]
    B -->|点击"查看全部"| D[衣橱<br/>WardrobeScreen]

    D --> E[筛选/搜索历史记录]
    E --> F[点击历史记录]
    F --> C
```

---

## 📐 设计规范

### 设备规格
- **目标设备**: iPhone 15 Pro
- **屏幕尺寸**: 393×852px
- **设计系统**: iOS Design System
- **字体**: SF Pro Display / PingFang SC

### 设计 Token
- **主色调**: 紫色 `#6C63FF`
- **渐变**: `linear-gradient(135deg, #6C63FF 0%, #7B72FF 100%)`
- **背景色**:
  - 白色 `#FFFFFF`
  - 浅灰 `#F2F2F7`
  - 深灰 `#1C1C1E`
- **文字颜色**:
  - 主文字 `#1C1C1E`
  - 次文字 `#8E8E93`
  - 占位符 `#C7C7CC`

### 核心组件
- **Dynamic Island**: iPhone 15 Pro 灵动岛（126×37.5px）
- **Tab Bar**: iOS 风格标签栏（毛玻璃效果）
- **Home Indicator**: iOS 底部指示器（134×5px）
- **Status Bar**: 状态栏（时间、信号、电池）

---

## 🖥️ 查看原型

### 方式 1: 交互式导航页面
打开 [index.html](index.html) 可以在统一界面查看所有页面：
- 顶部导航栏快速切换页面
- 支持键盘快捷键（← → 切换）
- 完整的 iPhone 15 Pro 设备框架展示

### 方式 2: 单独查看
直接打开各个页面文件夹下的 HTML 文件，例如：
```
01-home/home-page.html
02-outfit-results/outfit-results-page.html
...
```

---

## 📋 文档结构说明

每个页面的 MD 文档都包含以下章节：

1. **页面概述**: 目标、任务、成功标准
2. **设计方向**: 核心视觉特征
3. **布局结构**: ASCII 布局图示
4. **组件清单**: 详细的组件规范（样式、状态、交互）
5. **交互规范**: 手势、流程图
6. **动画规范**: 进入/退出/交互动画
7. **滚动行为**: 滚动区域和规则（如适用）
8. **状态定义**: 默认/加载/错误/空状态
9. **数据需求**: 接口数据结构
10. **无障碍支持**: VoiceOver、触摸目标、对比度
11. **技术实现注意事项**: React Native 代码示例

---

## 🎨 设计文件

- **Figma 源文件**: (待补充)
- **设计系统**: 参考 `ux-design-specification.md`
- **图标库**: SF Symbols (`@expo/vector-icons`)

---

## 📊 页面统计

- **总页面数**: 11 个（含变体）
- **主要页面**: 6 个
- **流程页面**: 3 个
- **弹窗页面**: 2 个
- **总文档数**: 10 个 MD + 12 个 HTML

---

## 🔧 技术栈

- **框架**: React Native (Expo)
- **导航**: React Navigation
- **状态管理**: React Context / Zustand
- **本地存储**: SQLite (expo-sqlite)
- **相机/相册**: expo-camera / expo-image-picker
- **动画**: React Native Animated / Reanimated
- **分享**: react-native-share / expo-sharing

---

## 📝 更新日志

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v1.0 | 2025-12-31 | 初版：完整的 11 个页面设计 + 交互原型 |

---

## 🤝 贡献指南

修改设计时请遵循以下步骤：
1. 更新对应的 MD 文档
2. 同步修改 HTML 原型
3. 在 index.html 中验证效果
4. 更新本 README.md（如有结构变化）

---

**设计师**: Claude
**项目**: 搭理 - AI 穿搭顾问
**版本**: v1.0
