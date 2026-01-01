# 分享模板页

**页面标识:** `ShareTemplatesModal`
**导航路径:** 搭配详情页 → 分享按钮 → 分享模板弹窗
**设计版本:** v1.0 - Modal 弹窗形式
**最后更新:** 2025-12-31

---

## 页面概述

### 页面目标
- **主要目标**: 让用户选择精美的分享模板，生成分享图片
- **次要目标**: 提供多平台分享入口，提升分享转化率
- **情感目标**: 传递"精致分享"的品质感，增强用户成就感

### 用户任务
1. **主任务**: 选择分享模板（单选）
2. **次任务**: 预览分享效果
3. **支持任务**: 选择分享平台（微信、朋友圈、小红书、抖音）
4. **操作任务**: 保存图片或立即分享

### 成功标准
- 分享模板选择率 > 80%
- 分享按钮点击率 > 60%
- 分享完成率 > 40%

---

## 设计方向

**Modal 弹窗设计**

**核心视觉特征:**
- 半屏弹窗从底部弹出（Bottom Sheet）
- 白色背景卡片 + 圆角 24px
- 紫色品牌色用于选中状态（`#6C63FF`）
- 毛玻璃背景遮罩（`rgba(0,0,0,0.4)`）
- 可滚动内容区域

---

## 布局结构

### 页面区域划分

```
┌─────────────────────────────────┐
│  [背景遮罩 - 半透明黑]            │
│                                 │
│  ┌─────────────────────────────┐│
│  │ [拖动条]                    ││ 5px
│  │─────────────────────────────││
│  │ [Modal 标题]                ││
│  │ "分享搭配"                  ││ 60px
│  │ "选择一个模板，生成精美..."  ││
│  │─────────────────────────────││
│  │ [可滚动内容]                ││
│  │ ┌───────────────────────┐  ││
│  │ │ 选择分享模板          │  ││
│  │ │ ┌─────┬─────┬─────┐  │  ││ ~140px
│  │ │ │简约 │时尚 │文艺 │  │  ││
│  │ │ └─────┴─────┴─────┘  │  ││
│  │ └───────────────────────┘  ││
│  │                           ││
│  │ ┌───────────────────────┐  ││
│  │ │ 分享预览              │  ││
│  │ │ ┌─────────────────┐  │  ││
│  │ │ │ 职场优雅风      │  │  ││ ~400px
│  │ │ │ [简约][通勤]    │  │  ││
│  │ │ │ [衣物预览]      │  │  ││
│  │ │ │ AI 穿搭顾问     │  │  ││
│  │ │ │ 搭理            │  │  ││
│  │ │ └─────────────────┘  │  ││
│  │ └───────────────────────┘  ││
│  │                           ││
│  │ ┌───────────────────────┐  ││
│  │ │ 分享到                │  ││
│  │ │ [微信] [朋友圈]       │  ││ ~120px
│  │ │ [小红书] [抖音]       │  ││
│  │ └───────────────────────┘  ││
│  │                           ││
│  │ [保存图片] [立即分享]     ││ 52px
│  └─────────────────────────────┘│
│  [Home Indicator]               │ 34px
└─────────────────────────────────┘
```

---

## 组件清单

### 1. 背景遮罩 (Backdrop)

**组件:** `ModalBackdrop`

**样式:**
- 背景：`rgba(0, 0, 0, 0.4)` 半透明黑
- 点击关闭 Modal
- 支持手势下滑关闭

---

### 2. 拖动条 (Drag Indicator)

**组件:** `DragIndicator`

**样式:**
- 尺寸：36×5px
- 颜色：`#D1D1D6` 浅灰
- 圆角：3px
- 居中显示

---

### 3. Modal 标题区域 (Header)

**组件:** `ModalHeader`

**内容:**
- **主标题**: "分享搭配"
  - 字号：24pt Bold
  - 颜色：黑色 `#1C1C1E`
  - Letter-spacing: -0.5px

- **副标题**: "选择一个模板，生成精美的分享图片"
  - 字号：15pt Regular
  - 颜色：灰色 `#8E8E93`
  - 行高：1.4

---

### 4. 模板选择区域 (Templates Section)

**组件:** `TemplatesGrid`

**标签:**
- 文字："选择分享模板"
- 字号：16pt Semibold
- 颜色：黑色 `#1C1C1E`

**模板网格:**
- 3列网格布局
- Gap: 12px
- 每个模板宽高比 9:16（竖版海报）

**模板卡片 (Template Card):**

**尺寸:**
- 宽高比：9:16
- 圆角：12px
- 边框：3px solid transparent

**模板样式:**
1. **简约模板** (Minimal):
   - 背景：白色 `#FFFFFF`
   - 文字颜色：黑色 `#1C1C1E`

2. **时尚模板** (Fashion):
   - 背景：紫色渐变 `linear-gradient(135deg, #6C63FF 0%, #8B7FFF 100%)`
   - 文字颜色：白色 `#FFFFFF`

3. **文艺模板** (Artistic):
   - 背景：米色渐变 `linear-gradient(135deg, #FFF5E5 0%, #FFE5CC 100%)`
   - 文字颜色：深灰 `#3A3A3C`

**模板内容:**
- **模板预览内容**:
  - 上方：模板风格文字（11pt Medium）
  - 下方：水印"搭理"（9pt Regular，透明度 70%）

- **模板名称**: 显示在卡片下方
  - 字号：13pt Medium
  - 颜色：黑色 `#1C1C1E`

**状态:**
- **默认状态**:
  - 边框：3px transparent

- **选中状态**:
  - 边框：3px solid `#6C63FF`
  - 阴影：`0 4px 12px rgba(108, 99, 255, 0.3)`
  - 右上角显示勾选徽章（24×24px 紫色圆形 + 白色勾选图标）

**交互:**
- 单选模式
- 点击时切换选中状态
- Active 状态：缩放 0.95
- Haptic Feedback: Medium

---

### 5. 分享预览区域 (Preview Section)

**组件:** `PreviewCard`

**标签:**
- 文字："分享预览"
- 字号：16pt Semibold
- 颜色：黑色 `#1C1C1E`

**预览卡片:**
- 宽高比：9:16（竖版海报）
- 最大宽度：280px
- 圆角：16px
- 居中显示
- 阴影：`0 8px 24px rgba(0, 0, 0, 0.12)`

**预览内容 (基于简约模板):**

**顶部区域:**
- **搭配名称**: "职场优雅风"
  - 字号：20pt Bold
  - 颜色：黑色 `#1C1C1E`
  - 居中显示

- **标签组**:
  - 标签：[简约] [通勤]
  - 字号：11pt Semibold
  - 颜色：紫色 `#6C63FF`
  - 背景：紫色 10% `rgba(108, 99, 255, 0.1)`
  - 圆角：12px
  - 内边距：4px 12px

**中部区域:**
- **衣物展示区**:
  - 3 个并排占位块
  - 尺寸：60×80px
  - 背景：渐变灰 `linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)`
  - 圆角：8px
  - 间距：8px
  - 文字："上衣"/"下装"/"配饰"（10pt Regular，灰色）

**底部区域:**
- **水印文字**: "AI 穿搭顾问"
  - 字号：11pt Regular
  - 颜色：透明度 70%
  - 居中显示

- **品牌标识**: "搭理"
  - 字号：16pt Bold
  - 颜色：紫色 `#6C63FF`
  - 居中显示

**动态更新:**
- 选择不同模板时，预览卡片样式实时更新
- 切换动画：200ms 淡入淡出

---

### 6. 分享平台区域 (Platforms Section)

**组件:** `PlatformsGrid`

**标签:**
- 文字："分享到"
- 字号：16pt Semibold
- 颜色：黑色 `#1C1C1E`

**平台网格:**
- 4列网格布局
- Gap: 16px

**平台项 (Platform Item):**

**布局:**
- 垂直布局（图标 + 文字）
- 间距：8px
- 居中对齐

**平台图标:**
- 尺寸：56×56px
- 圆角：16px
- 渐变背景

**平台列表:**
1. **微信** (WeChat):
   - 背景：绿色渐变 `linear-gradient(135deg, #09BB07 0%, #00C800 100%)`
   - 图标：微信 SVG（28×28px，白色）

2. **朋友圈** (Moments):
   - 背景：蓝色渐变 `linear-gradient(135deg, #0A8CFF 0%, #0080FF 100%)`
   - 图标：圆圈 SVG（28×28px，白色）

3. **小红书** (Xiaohongshu):
   - 背景：红色渐变 `linear-gradient(135deg, #FF2442 0%, #FF0044 100%)`
   - 图标：笔记 SVG（28×28px，白色）

4. **抖音** (Douyin):
   - 背景：黑色渐变 `linear-gradient(135deg, #000 0%, #2C2C2E 100%)`
   - 图标：音符 SVG（28×28px，白色）

**平台标签:**
- 字号：12pt Medium
- 颜色：灰色 `#3A3A3C`

**交互:**
- 点击平台图标 → 调用对应平台分享 API
- Active 状态：图标缩放 0.9
- Haptic Feedback: Medium

---

### 7. 操作按钮区域 (Action Buttons)

**组件:** `ActionButtons`

**布局:**
- 横向并排 2 个按钮
- Gap: 12px
- Flex: 1（等分）

**保存图片按钮 (Save Button):**
- 高度：52px
- 背景：`#F2F2F7` 浅灰
- 圆角：12px
- 文字："保存图片"
  - 字号：16pt Semibold
  - 颜色：黑色 `#1C1C1E`
- 图标：保存图标（20×20px）

**立即分享按钮 (Generate Button):**
- 高度：52px
- 背景：紫色渐变 `linear-gradient(135deg, #6C63FF 0%, #7B72FF 100%)`
- 圆角：12px
- 阴影：`0 4px 12px rgba(108, 99, 255, 0.3)`
- 文字："立即分享"
  - 字号：16pt Semibold
  - 颜色：白色
- 图标：分享图标（20×20px）

**交互:**
- Active 状态：缩放 0.96
- Haptic Feedback: Medium
- 保存图片 → 生成图片并保存到相册
- 立即分享 → 打开分享平台选择器

---

## 交互规范

### 核心交互流程

```mermaid
flowchart TD
    A[弹窗从底部弹出] --> B[默认选中"简约"模板]
    B --> C[显示预览效果]

    C --> D{用户操作}

    D -->|选择其他模板| E[切换预览样式]
    D -->|点击平台图标| F[调用平台分享 API]
    D -->|点击保存图片| G[生成分享图片]
    D -->|点击立即分享| H[打开分享面板]

    E --> D

    G --> I[保存到相册]
    I --> J[显示成功提示]

    H --> K[用户选择分享平台]
    K --> L[调用平台分享]

    F --> L
    L --> M[分享完成/取消]

    N[点击背景遮罩] --> O[Modal 关闭]
    P[下滑拖动条] --> O
```

### 手势交互

| 手势 | 触发区域 | 响应 |
|------|---------|------|
| 点击 | 模板卡片 | 选中模板 + 更新预览 + Haptic (Medium) |
| 点击 | 平台图标 | 调用分享 API + Haptic (Medium) |
| 点击 | 保存图片按钮 | 生成并保存图片 + Haptic (Medium) |
| 点击 | 立即分享按钮 | 打开分享面板 + Haptic (Medium) |
| 点击 | 背景遮罩 | 关闭 Modal |
| 下滑 | 拖动条或 Modal 顶部 | 关闭 Modal |

---

## 滚动行为

### Modal 内容滚动

**实现方式:**
```css
.modal-content {
  max-height: 85vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

**滚动规则:**
- 内容超出屏幕时自动显示滚动
- 使用 iOS 原生滚动指示器
- 支持橡皮筋效果（bounce）

---

## 动画规范

### 弹窗进入动画
- 从底部滑入
- 持续时间：300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- 背景遮罩渐显：200ms

### 弹窗退出动画
- 滑出到底部
- 持续时间：250ms
- Easing: `cubic-bezier(0.4, 0, 1, 1)`
- 背景遮罩渐隐：200ms

### 模板切换动画
- 预览卡片淡入淡出：200ms
- 选中徽章缩放进入：100ms `ease-out`

### 按钮交互动画
- Active 状态：缩放 0.96，100ms

---

## 数据需求

### 需要从上一页传入的数据

**搭配信息:**
```typescript
{
  outfitId: string;
  outfitName: string;              // "职场优雅风"
  occasion: string;                // "通勤"
  tags: string[];                  // ["简约", "通勤"]
  items: {
    id: string;
    name: string;                  // "上衣"
    imageUrl: string;
  }[];
  colorTheory: {
    primaryColor: string;
    secondaryColor: string;
  };
}
```

### 模板数据

**模板列表:**
```typescript
{
  id: string;
  name: string;                    // "简约"
  style: 'minimal' | 'fashion' | 'artistic';
  backgroundColor: string;
  textColor: string;
  previewConfig: {
    layout: string;
    fontFamily: string;
  };
}[]
```

### 生成分享图片

**图片生成参数:**
```typescript
{
  template: string;                // 模板 ID
  outfit: {
    name: string;
    tags: string[];
    items: string[];               // 图片 URLs
  };
  watermark: {
    text: string;                  // "搭理"
    logo: string;                  // Logo URL
  };
  size: {
    width: 1080;                   // 9:16 竖版
    height: 1920;
  };
}
```

**生成方法:**
- 使用 Canvas API 或 React Native 的 `react-native-view-shot`
- 合成图片并返回本地 URI

---

## 平台分享 API

### 微信分享
```typescript
import { shareToWechat } from '@react-native-oh-tpl/wechat';

await shareToWechat({
  type: 'image',
  imageUrl: shareImageUri,
  scene: 'session', // 'session' or 'timeline'
});
```

### 小红书分享
```typescript
import Share from 'react-native-share';

await Share.open({
  url: shareImageUri,
  type: 'image/jpeg',
  social: Share.Social.XIAOHONGSHU,
});
```

### 通用分享面板
```typescript
import Share from 'react-native-share';

await Share.open({
  url: shareImageUri,
  message: '我的搭配方案 - 来自搭理 AI',
});
```

---

## 无障碍支持

### VoiceOver 标签

| 元素 | accessibilityLabel | accessibilityHint |
|------|-------------------|-------------------|
| 模板卡片 | "{模板名称}分享模板" | "选择此模板生成分享图片" |
| 平台图标 | "分享到{平台名称}" | "在{平台}分享搭配方案" |
| 保存图片按钮 | "保存图片" | "将分享图片保存到相册" |
| 立即分享按钮 | "立即分享" | "打开分享面板选择平台" |

### 触摸目标尺寸
- 模板卡片：最小宽度 80px
- 平台图标：56×56px
- 操作按钮：52px 高度

---

## 技术实现注意事项

### React Native 组件结构

```typescript
<Modal
  visible={isVisible}
  transparent
  animationType="slide"
>
  <Pressable style={styles.backdrop} onPress={onClose}>
    <View style={styles.modalContent}>
      <DragIndicator />

      <ModalHeader
        title="分享搭配"
        subtitle="选择一个模板，生成精美的分享图片"
      />

      <ScrollView>
        <TemplatesGrid
          templates={templates}
          selectedId={selectedTemplateId}
          onSelect={handleTemplateSelect}
        />

        <PreviewCard
          template={selectedTemplate}
          outfit={outfitData}
        />

        <PlatformsGrid
          platforms={platforms}
          onPress={handlePlatformShare}
        />
      </ScrollView>

      <ActionButtons
        onSave={handleSaveImage}
        onShare={handleShare}
      />
    </View>
  </Pressable>
</Modal>
```

### 图片生成实现
```typescript
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

// 生成分享图片
const generateShareImage = async () => {
  const uri = await viewShotRef.current.capture();
  return uri;
};

// 保存到相册
const saveToAlbum = async (uri: string) => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status === 'granted') {
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('保存成功', '图片已保存到相册');
  }
};
```

---

## 原型文件

**可交互原型:** `share-templates.html`

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v1.0 | 2025-12-31 | 初版：Bottom Sheet 弹窗设计 + 3 种分享模板 + 多平台分享 |
