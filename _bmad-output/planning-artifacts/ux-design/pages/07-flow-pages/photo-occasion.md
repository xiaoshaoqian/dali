# 拍照/场合选择页

**页面标识:** `PhotoOccasionScreen`
**导航路径:** 首页 → 拍照/选择照片 → 拍照+场合选择页
**设计版本:** v1.0 - 全屏表单页
**最后更新:** 2025-12-31

---

## 页面概述

### 页面目标
- **主要目标**: 让用户确认已选衣物并选择今天的穿搭场合
- **次要目标**: 允许用户选择可选的风格偏好，提升个性化
- **情感目标**: 传递"简单几步即可完成"的轻松感

### 用户任务
1. **主任务**: 查看已选衣物照片预览
2. **次任务**: 选择今天的穿搭场合（必选）
3. **支持任务**: 选择风格偏好标签（可选，多选）
4. **操作任务**: 点击"生成搭配方案"进入 AI 生成流程

### 成功标准
- 用户在 10 秒内完成场合和风格选择
- 风格偏好选择率 > 40%
- 点击"生成搭配方案"按钮转化率 > 95%

---

## 设计方向

**全屏表单页设计**

**核心视觉特征:**
- 白色背景 `#FFFFFF`
- 紫色品牌色用于选中状态（`#6C63FF`）
- 清晰的视觉层次和分组
- 底部固定操作栏（毛玻璃效果）

---

## 布局结构

### 页面区域划分

```
┌─────────────────────────────────┐
│  [状态栏 + 灵动岛]               │ 59px
│─────────────────────────────────│
│  [导航栏]                        │ 59px
│  ← 返回  |  选择场合              │
│─────────────────────────────────│
│  [可滚动内容区域]                 │
│  ┌───────────────────────────┐  │
│  │ 已选衣物                  │  │
│  │ ┌─────────────────────┐  │  │
│  │ │ [衣物照片预览]       │  │  │ ~240px
│  │ │ 白色T恤             │  │  │
│  │ │ [重新选择按钮]       │  │  │
│  │ └─────────────────────┘  │  │
│  │                           │  │
│  │ 今天的场合是？            │  │
│  │ ┌─────┬─────┬─────┐      │  │
│  │ │ 💼  │ 💕  │ ☕  │      │  │
│  │ │通勤 │约会 │休闲 │      │  │ ~220px
│  │ ├─────┼─────┼─────┤      │  │
│  │ │ 🎉  │ 🏃  │ 🏠  │      │  │
│  │ └─────┴─────┴─────┘      │  │
│  │                           │  │
│  │ 风格偏好        (可选)     │  │
│  │ [简约] [时尚] [甜美]      │  │ ~120px
│  │ [知性] [休闲] [优雅]      │  │
│  └───────────────────────────┘  │
│─────────────────────────────────│
│  [底部操作栏 - 毛玻璃]           │ 92px
│  [生成搭配方案按钮]              │
└─────────────────────────────────┘
│  [Home Indicator]               │ 34px
```

---

## 组件清单

### 1. 导航栏 (Navigation Bar)

**组件:** `NavigationBar`

**内容:**
- **返回按钮**: 左侧箭头图标
  - 尺寸：40×40px
  - 图标颜色：黑色 `#1C1C1E`
  - 点击返回首页

- **标题**: "选择场合"
  - 字号：17pt Semibold
  - 颜色：黑色 `#1C1C1E`
  - 居中显示

**交互:**
- 返回按钮点击 → 返回首页
- Haptic Feedback: Light

---

### 2. 照片预览区域 (Photo Section)

**组件:** `PhotoPreview`

**标签:**
- 文字："已选衣物"
- 字号：15pt Semibold
- 颜色：黑色 `#1C1C1E`

**照片预览卡片:**
- 宽高比：4:3
- 背景：紫色渐变 `linear-gradient(135deg, #E8E6FF 0%, #F0EFFF 100%)`
- 圆角：16px
- 居中显示衣物图片/占位符

**衣物占位符:**
- 尺寸：160×200px
- 背景：紫色渐变 `linear-gradient(180deg, #6C63FF 0%, #8B7FFF 100%)`
- 圆角：12px
- 阴影：`0 8px 24px rgba(108, 99, 255, 0.3)`
- 内容：
  - 衣服图标（48×48px，白色）
  - 文字："白色T恤"（14pt Medium，白色 90%）

**重新选择按钮:**
- 位置：右下角
- 背景：`rgba(0, 0, 0, 0.6)` + 毛玻璃效果
- 圆角：20px
- 内边距：8px 14px
- 文字："重新选择"（13pt Medium，白色）
- 图标：相机图标

**交互:**
- 点击重新选择按钮 → 返回相机/相册选择
- Active 状态：缩放 0.95

---

### 3. 场合选择区域 (Occasion Section)

**组件:** `OccasionSelector`

**标签:**
- 文字："今天的场合是？"
- 字号：15pt Semibold
- 颜色：黑色 `#1C1C1E`

**场合网格:**
- 3列网格布局
- Gap: 12px
- 每个卡片宽高比 1:1

**场合卡片 (Occasion Item):**

**内容:**
- **图标**: SVG 图标（28×28px）
  - 💼 通勤 (briefcase)
  - 💕 约会 (heart)
  - ☕ 休闲 (coffee)
  - 🎉 聚会 (star)
  - 🏃 运动 (sport)
  - 🏠 居家 (home)

- **标签**: 场合名称
  - 字号：14pt Medium
  - 颜色：黑色 `#1C1C1E`

**状态:**
- **默认状态**:
  - 背景：`#F2F2F7` 浅灰
  - 边框：2px transparent

- **选中状态**:
  - 背景：紫色渐变 `linear-gradient(135deg, #F0EFFF 0%, #E8E6FF 100%)`
  - 边框：2px solid `#6C63FF`
  - 图标颜色：紫色 `#6C63FF`
  - 标签颜色：紫色 `#6C63FF`
  - 阴影：`0 4px 12px rgba(108, 99, 255, 0.2)`

**交互:**
- 单选模式
- 点击时切换选中状态
- Active 状态：缩放 0.95
- Haptic Feedback: Medium

---

### 4. 风格偏好区域 (Style Section)

**组件:** `StyleSelector`

**标题栏:**
- **标题**: "风格偏好"
  - 字号：15pt Semibold
  - 颜色：黑色 `#1C1C1E`

- **可选标识**: "(可选)"
  - 字号：13pt Regular
  - 颜色：灰色 `#8E8E93`
  - 右侧对齐

**风格标签:**
- 横向流式布局（flex-wrap）
- Gap: 8px

**标签样式 (Style Tag):**

**内容:**
- 文字：简约 / 时尚 / 甜美 / 知性 / 休闲 / 优雅
- 字号：14pt Medium
- 内边距：10px 16px
- 圆角：20px

**状态:**
- **默认状态**:
  - 背景：`#F2F2F7` 浅灰
  - 文字颜色：灰色 `#3A3A3C`
  - 边框：2px transparent

- **选中状态**:
  - 背景：紫色渐变 `linear-gradient(135deg, #F0EFFF 0%, #E8E6FF 100%)`
  - 边框：2px solid `#6C63FF`
  - 文字颜色：紫色 `#6C63FF`
  - 字重：Semibold

**交互:**
- 多选模式（可选 0-3 个）
- 点击时切换选中状态
- Active 状态：缩放 0.95
- Haptic Feedback: Light

---

### 5. 底部操作栏 (Bottom Bar)

**组件:** `BottomBar`

**样式:**
- 位置：固定在底部
- 背景：`rgba(255, 255, 255, 0.95)` + 毛玻璃效果
- 上边框：0.5px solid `rgba(0, 0, 0, 0.1)`
- 内边距：16px 20px + 底部 40px（Home Indicator）

**生成搭配方案按钮:**
- 宽度：100%
- 高度：52px
- 背景：紫色渐变 `linear-gradient(135deg, #6C63FF 0%, #7B72FF 100%)`
- 圆角：14px
- 阴影：`0 4px 16px rgba(108, 99, 255, 0.3)`

**文字:**
- 内容："生成搭配方案"
- 字号：17pt Semibold
- 颜色：白色
- 图标：方块图标

**交互:**
- Active 状态：缩放 0.98
- 点击后跳转到 AI 加载页
- Haptic Feedback: Medium

**状态:**
- 默认可用（场合必选）
- 未选择场合时禁用：
  - 背景：`#C7C7CC` 灰色
  - 阴影：无
  - 光标：not-allowed

---

## 交互规范

### 核心交互流程

```mermaid
flowchart TD
    A[进入页面] --> B[显示已选衣物照片]
    B --> C[默认选中"通勤"场合]

    C --> D{用户操作}

    D -->|点击其他场合| E[切换场合选中状态]
    D -->|点击风格标签| F[多选风格偏好]
    D -->|点击重新选择| G[返回相机/相册]
    D -->|点击返回| H[返回首页]
    D -->|点击生成搭配| I[跳转 AI 加载页]

    E --> D
    F --> D

    I --> J[传递参数: 照片 + 场合 + 风格]
    J --> K[开始 AI 生成流程]
```

### 手势交互

| 手势 | 触发区域 | 响应 |
|------|---------|------|
| 点击 | 场合卡片 | 选中该场合 + Haptic (Medium) |
| 点击 | 风格标签 | 切换选中状态 + Haptic (Light) |
| 点击 | 重新选择按钮 | 返回相机/相册 + Haptic (Medium) |
| 点击 | 生成搭配按钮 | 跳转加载页 + Haptic (Medium) |
| 点击 | 返回按钮 | 返回首页 + Haptic (Light) |
| 滚动 | 内容区域 | 垂直滚动查看更多内容 |

---

## 滚动行为

### 内容区域滚动

**实现方式:**
```css
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 120px; /* 为底部操作栏留空间 */
}
```

**滚动规则:**
- 内容超出屏幕时自动显示滚动
- 使用 iOS 原生滚动指示器
- 支持橡皮筋效果（bounce）
- 底部操作栏始终固定在底部

---

## 动画规范

### 页面进入动画
- 从右侧滑入
- 持续时间：300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### 页面退出动画
- 滑出到右侧
- 持续时间：250ms
- Easing: `cubic-bezier(0.4, 0, 1, 1)`

### 卡片选中动画
- 背景颜色过渡：200ms
- 边框颜色过渡：200ms
- Active 缩放：100ms `ease-out`

### 按钮交互动画
- Active 状态：缩放 0.98，100ms
- 禁用状态：渐变到灰色，200ms

---

## 数据需求

### 需要从后端/本地获取的数据

**1. 已选照片**
```typescript
{
  photoUri: string;                // 本地照片 URI
  photoName?: string;              // 识别的衣物名称（如有）
  photoType?: 'camera' | 'gallery'; // 照片来源
}
```

**2. 场合列表**
```typescript
{
  id: string;
  name: string;                    // "通勤"
  icon: string;                    // SVG 图标名称
  keywords: string[];              // ["正式", "商务"]
}[]
```

**3. 风格偏好列表**
```typescript
{
  id: string;
  name: string;                    // "简约"
}[]
```

### 提交数据结构

**生成搭配请求:**
```typescript
{
  photo: {
    uri: string;
    base64?: string;               // 如需上传
  };
  occasion: {
    id: string;
    name: string;
  };
  stylePreferences: {              // 可选
    ids: string[];
    names: string[];
  };
  timestamp: string;               // ISO 时间戳
}
```

---

## 状态定义

### 1. 默认状态
- 显示已选照片预览
- 默认选中第一个场合（通勤）
- 风格偏好无选中
- 生成按钮可用

### 2. 禁用状态
- 未选择场合时
- 生成按钮变灰且不可点击

### 3. 加载状态
- 页面初始化时显示骨架屏
- 照片预览优先加载

---

## 无障碍支持

### VoiceOver 标签

| 元素 | accessibilityLabel | accessibilityHint |
|------|-------------------|-------------------|
| 返回按钮 | "返回" | "返回到首页" |
| 照片预览 | "已选衣物照片" | "查看选中的衣物照片" |
| 重新选择按钮 | "重新选择照片" | "返回相机或相册重新选择" |
| 场合卡片 | "{场合名称}，场合选项" | "选择此场合进行搭配推荐" |
| 风格标签 | "{风格名称}，风格偏好" | "选择风格偏好，可多选" |
| 生成按钮 | "生成搭配方案" | "确认选择并生成搭配方案" |

### 触摸目标尺寸
- 场合卡片：最小 80×80px
- 风格标签：最小高度 44px
- 生成搭配按钮：52px 高度
- 所有按钮 ≥ 44×44pt

---

## 技术实现注意事项

### React Native 组件结构

```typescript
<SafeAreaView edges={['top', 'bottom']}>
  <View style={styles.screen}>
    <NavigationBar onBackPress={handleBack} />

    <ScrollView style={styles.scrollableContent}>
      <PhotoPreview
        photoUri={selectedPhoto.uri}
        photoName={selectedPhoto.name}
        onReselect={handleReselect}
      />

      <OccasionSelector
        occasions={occasions}
        selectedId={selectedOccasionId}
        onSelect={handleOccasionSelect}
      />

      <StyleSelector
        styles={styleOptions}
        selectedIds={selectedStyleIds}
        onSelect={handleStyleSelect}
      />
    </ScrollView>

    <BottomBar>
      <GenerateButton
        disabled={!selectedOccasionId}
        onPress={handleGenerate}
      />
    </BottomBar>

    <HomeIndicator />
  </View>
</SafeAreaView>
```

### 照片处理
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

// 压缩照片以提升上传速度
const compressPhoto = async (uri: string) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }], // 最大宽度 1024px
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};
```

---

## 原型文件

**可交互原型:** `photo-occasion.html`

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v1.0 | 2025-12-31 | 初版：全屏表单页设计 + 照片预览 + 场合/风格选择 |
