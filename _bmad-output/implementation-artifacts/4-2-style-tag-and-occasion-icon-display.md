# Story 4.2: Style Tag and Occasion Icon Display

Status: done

## Story

As a **用户**（查看搭配方案的用户），
I want 看到清晰的风格标签和场合图标，
So that 我能快速识别这套搭配的风格定位和适用场合。

## Acceptance Criteria

1. **Given** 我在搭配方案卡片或详情页
   **When** 页面渲染搭配信息
   **Then** 我看到 **StyleTagChip** 组件显示在搭配名称下方
   **And** 我看到场合图标显示在风格标签旁边

2. **Given** StyleTagChip 组件已渲染
   **When** 我查看风格标签
   **Then** 风格标签以 Chip 形式展示（圆角胶囊状，HTML: `outfit-results-page.html` 中的设计）
   **And** 每个 Chip 包含：
   - 背景色：风格标签 `linear-gradient(135deg, #F0EFFF 0%, #E8E6FF 100%)`，场合标签 `#F2F2F7`
   - 文字颜色：风格标签 `#6C63FF`（Primary Purple），场合标签 `#3A3A3C`
   - 内边距 `4px 12px`
   - 圆角 `12px`
   - 字体 SF Pro Text, 12-13pt, font-weight: 600
   **And** 显示 1-3 个风格标签（如"简约"、"通勤"、"知性"）

3. **Given** 风格标签数据来自后端
   **When** API 返回 outfit 数据
   **Then** 数据包含 `theory.styleTags` 数组：
   ```json
   {
     "theory": {
       "styleTags": ["简约", "通勤", "知性"]
     }
   }
   ```
   **And** 标签顺序按相关性排序（主要风格在前）

4. **Given** 场合图标需要显示
   **When** 搭配数据包含 `occasion` 字段
   **Then** 根据场合类型显示对应 SF Symbols 图标：
   - 浪漫约会 → `heart.fill` 💕
   - 商务会议 → `briefcase.fill` 💼
   - 职场通勤 → `building.2.fill` 🏢
   - 朋友聚会 → `person.3.fill` 🎉
   - 日常出行 → `cup.and.saucer.fill` ☕
   - 居家休闲 → `house.fill` 🏠
   **And** 图标大小：20pt × 20pt
   **And** 图标颜色：`#6C63FF` (Primary Purple)

5. **Given** 场合图标在方案详情页
   **When** 我查看详情页（HTML: `outfit-detail-page.html`）
   **Then** 场合图标显示在"场合适配"区域
   **And** 图标旁边显示场合文字标签（如"职场通勤"）
   **And** 使用 iOS 系统字体 SF Pro, 15pt, Semibold (600)

6. **Given** 用户点击风格标签
   **When** 点击事件触发
   **Then** 标签轻微缩放（scale 0.95, 150ms ease-out）
   **And** 可选：显示该风格的简短说明 Tooltip（如"简约：线条简洁，色彩克制"）

7. **Given** StyleTagChip 组件需要在多处复用
   **When** 组件开发完成
   **Then** 组件位于 `src/components/outfit/StyleTagChip.tsx`
   **And** 接受 props: `tags: string[]`, `variant: 'style' | 'occasion'`, `size: 'default' | 'compact'`
   **And** 遵循 Architecture naming conventions（PascalCase 组件名）

8. **Given** 所有标签和图标已实现
   **When** 产品/设计审阅
   **Then** 精确复刻 HTML 原型中的视觉效果
   **And** 支持 Dynamic Type（iOS 辅助功能，字体大小自适应）
   **And** VoiceOver 可正确朗读风格和场合信息（NFR-U11 要求）

## Tasks / Subtasks

- [x] Task 1: 创建 StyleTagChip 组件 (AC: #2, #7)
  - [x] 创建 `src/components/outfit/StyleTagChip.tsx`
  - [x] 实现 style 和 occasion 两种 variant
  - [x] 支持 default 和 compact 两种尺寸
  - [x] 添加点击缩放动画（scale 0.95, 150ms ease-out）
  - [x] 添加 accessibilityLabel 支持 VoiceOver

- [x] Task 2: 创建 OccasionIcon 组件 (AC: #4, #5)
  - [x] 创建 `src/components/outfit/OccasionIcon.tsx`
  - [x] 实现 6 种场合图标映射（使用 SVG）
  - [x] 支持可配置颜色和尺寸
  - [x] 添加场合文字标签选项

- [x] Task 3: 集成到 OutfitCard 组件 (AC: #1, #3)
  - [x] 更新 `src/components/outfit/OutfitCard.tsx`
  - [x] 在卡片标题下方添加 StyleTagChip
  - [x] 确保与 HTML 原型 `outfit-results-page.html` 布局一致

- [x] Task 4: 集成到 Outfit 详情页 (AC: #5)
  - [x] 更新 `app/outfit/[id].tsx`
  - [x] 在标题卡片中添加 tag-row 区域
  - [x] 添加场合图标和文字标签
  - [x] 确保与 HTML 原型 `outfit-detail-page.html` 布局一致

- [x] Task 5: 更新导出和类型定义
  - [x] 更新 `src/components/outfit/index.ts` 导出新组件
  - [x] 添加 OccasionType 类型定义

- [x] Task 6: 编写单元测试
  - [x] StyleTagChip 组件渲染测试
  - [x] OccasionIcon 组件渲染测试
  - [x] 点击交互测试
  - [x] 不同 variant/size 组合测试

## Dev Notes

### 从 Story 4-1 学到的经验教训

**Code Review 发现的问题（必须避免）：**
1. **测试不能是占位符** - 必须写真实的渲染和交互测试
2. **颜色尺寸必须严格匹配 AC** - 参考 HTML 原型的精确 CSS 值
3. **动画必须使用 `withTiming` + `Easing.out`** - 不要用 `withSpring`，AC 规定 ease-out
4. **hex 颜色需要严格校验** - 使用正则 `/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/`

**Story 4-1 建立的模式（必须遵循）：**
- 组件结构：`src/components/{domain}/{ComponentName}.tsx`
- 测试文件：`src/components/{domain}/{ComponentName}.test.tsx`
- 使用 `StyleSheet.create()` - 禁止内联样式
- 使用 `react-native-reanimated` 的 `withTiming` + `Easing.out(Easing.ease)` 实现动画
- Mock react-native-reanimated 使用 `require('react-native-reanimated/mock')`

### HTML 原型精确样式提取

**outfit-results-page.html 中的 .tag 样式：**
```css
.tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tag.style {
  background: linear-gradient(135deg, #F0EFFF 0%, #E8E6FF 100%);
  color: #6C63FF;
}

.tag.occasion {
  background: #F2F2F7;
  color: #3A3A3C;
}
```

**outfit-detail-page.html 中的 .tag 样式：**
```css
.tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.tag.style {
  background: #F0EFFF;
  color: #6C63FF;
}

.tag.occasion {
  background: #F2F2F7;
  color: #3A3A3C;
}
```

**差异说明：**
- 结果页使用 `font-size: 12px`
- 详情页使用 `font-size: 13px`
- 支持两种 size prop：`default` (13pt) 和 `compact` (12pt)

### 场合图标 SVG 实现

由于无法使用 SF Symbols（iOS 原生图标），需要用 SVG 实现相似图标：

```typescript
// 场合类型映射
const OCCASION_ICONS: Record<OccasionType, React.FC<SvgProps>> = {
  '浪漫约会': HeartIcon,      // heart.fill
  '商务会议': BriefcaseIcon,  // briefcase.fill
  '职场通勤': BuildingIcon,   // building.2.fill
  '朋友聚会': PeopleIcon,     // person.3.fill
  '日常出行': CoffeeIcon,     // cup.and.saucer.fill
  '居家休闲': HouseIcon,      // house.fill
};
```

### Props 接口设计

```typescript
// StyleTagChip Props
export interface StyleTagChipProps {
  tags: string[];
  variant?: 'style' | 'occasion';
  size?: 'default' | 'compact';
  onTagPress?: (tag: string) => void;
}

// OccasionIcon Props
export type OccasionType =
  | '浪漫约会'
  | '商务会议'
  | '职场通勤'
  | '朋友聚会'
  | '日常出行'
  | '居家休闲';

export interface OccasionIconProps {
  occasion: OccasionType;
  size?: number;           // 默认 20
  color?: string;          // 默认 #6C63FF
  showLabel?: boolean;     // 是否显示文字标签
  labelStyle?: TextStyle;  // 文字样式
}
```

### 项目结构

```
dali-mobile/src/components/outfit/
├── OutfitCard.tsx           # 已存在，需更新
├── OutfitCard.test.tsx      # 已存在
├── StyleTagChip.tsx         # 新建
├── StyleTagChip.test.tsx    # 新建
├── OccasionIcon.tsx         # 新建
├── OccasionIcon.test.tsx    # 新建
├── icons/                   # 场合图标 SVG
│   ├── HeartIcon.tsx
│   ├── BriefcaseIcon.tsx
│   ├── BuildingIcon.tsx
│   ├── PeopleIcon.tsx
│   ├── CoffeeIcon.tsx
│   └── HouseIcon.tsx
└── index.ts                 # 导出更新
```

### 动画实现模式（从 Story 4-1）

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// 点击缩放动画
const scale = useSharedValue(1);

const handlePressIn = () => {
  scale.value = withTiming(0.95, { duration: 150, easing: Easing.out(Easing.ease) });
};

const handlePressOut = () => {
  scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
};

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### 前序依赖

- **Story 3.4**: 基础 OutfitCard 已完成 ✅
- **Story 4.1**: TheoryVisualization 组件已完成 ✅
- **组件**: `react-native-svg`、`react-native-reanimated` 已安装 ✅
- **类型**: OutfitTheory 类型需要扩展 styleTags 字段

### 测试标准

- 测试文件与组件同级放置
- 使用 `describe` 结构组织测试
- 测试渲染：不同 variant、不同 size
- 测试交互：点击动画触发
- 测试无障碍：accessibilityLabel 存在

### References

- [Source: _bmad-output/planning-artifacts/ux-design/pages/02-outfit-results/outfit-results-page.html]
- [Source: _bmad-output/planning-artifacts/ux-design/pages/03-outfit-detail/outfit-detail-page.html]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]
- [Source: _bmad-output/project-context.md#UX Design Source of Truth]
- [Existing: dali-mobile/src/components/outfit/OutfitCard.tsx]
- [Learning: 4-1-color-theory-visualization-component.md#Senior Developer Review]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- ✅ Created StyleTagChip component with style/occasion variants and default/compact sizes
- ✅ Implemented press animation with withTiming(0.95, 150ms, Easing.out)
- ✅ Added LegacyStyleTagChip for backward compatibility with existing OutfitCard usage
- ✅ Created OccasionIcon component with 6 occasion type mappings to SVG icons
- ✅ Created 6 SVG icon components: HeartIcon, BriefcaseIcon, BuildingIcon, PeopleIcon, CoffeeIcon, HouseIcon
- ✅ Added accessibility labels for VoiceOver support (风格标签列表, 场合标签列表)
- ✅ Integrated StyleTagChip into OutfitCard (using LegacyStyleTagChip for backward compatibility)
- ✅ Integrated StyleTagChip and OccasionIcon into outfit detail page [id].tsx
- ✅ Updated index.ts exports with all new components and types
- ✅ Created comprehensive tests: 40 tests passing (StyleTagChip: 22 tests, OccasionIcon: 18 tests)
- ✅ Test coverage: OccasionIcon 100%, StyleTagChip 91.66%

### File List

- dali-mobile/src/components/outfit/StyleTagChip.tsx (modified)
- dali-mobile/src/components/outfit/StyleTagChip.test.tsx (created)
- dali-mobile/src/components/outfit/OccasionIcon.tsx (created)
- dali-mobile/src/components/outfit/OccasionIcon.test.tsx (created)
- dali-mobile/src/components/outfit/icons/HeartIcon.tsx (created)
- dali-mobile/src/components/outfit/icons/BriefcaseIcon.tsx (created)
- dali-mobile/src/components/outfit/icons/BuildingIcon.tsx (created)
- dali-mobile/src/components/outfit/icons/PeopleIcon.tsx (created)
- dali-mobile/src/components/outfit/icons/CoffeeIcon.tsx (created)
- dali-mobile/src/components/outfit/icons/HouseIcon.tsx (created)
- dali-mobile/src/components/outfit/icons/index.ts (created)
- dali-mobile/src/components/outfit/index.ts (modified)
- dali-mobile/src/components/outfit/OutfitCard.tsx (modified)
- dali-mobile/src/components/outfit/OutfitCard.test.tsx (modified - fixed import path)
- dali-mobile/app/outfit/[id].tsx (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

## Change Log

- 2026-01-06: Story created by create-story workflow, ready for development
- 2026-01-06: All tasks completed by Dev Agent, status changed to review
- 2026-01-06: Code Review completed by Xiaoshaoqian
  - **Issues Found:** 0 High, 4 Medium, 2 Low
  - **Issues Fixed:**
    - MEDIUM-1: StyleTagChip tests now verify actual fontSize values (12pt compact, 13pt default)
    - MEDIUM-2: OccasionIcon tests now verify actual size and color props passed to SVG
    - MEDIUM-4: OutfitCard updated to use new StyleTagChip with tags array interface (AC #7)
    - OutfitCard.test.tsx updated with QueryClientProvider wrapper and comprehensive mocks
  - **LOW Issues (Deferred):**
    - LOW-1: LegacyStyleTagChip import in detail page - intentional for single "AI 推荐" tag
    - LOW-2: PeopleIcon SVG path complexity - cosmetic, no functional impact
  - Status changed to done
