# Story 5.2: Outfit History Grid View

Status: done

## Story

As a **用户**（查看历史搭配的用户），
I want 看到所有历史搭配以网格形式展示，
So that 我可以快速浏览和选择搭配。

## Acceptance Criteria

1. **Given** 用户打开"搭配"Tab
   **When** 页面加载
   **Then** 我看到紫色渐变头部（与首页一致）
   **And** 头部显示"搭配"标题（32pt, Bold, 白色）
   **And** 头部右上角显示筛选图标（圆形按钮，`rgba(255,255,255,0.2)` 背景）
   **And** 头部包含搜索框（48px 高度，`rgba(255,255,255,0.25)` 背景）

2. **Given** 历史搭配列表需要展示
   **When** 从 SQLite 查询到搭配数据
   **Then** 搭配以 **2 列网格布局**显示（精确匹配 HTML 原型 `outfit-page.html`）
   **And** 左右各 20px padding，中间 12px gap
   **And** 卡片纵向间距：12px
   **And** 内容头部显示"共 X 套搭配方案"（14pt, `#8E8E93`）

3. **Given** 单个搭配卡片需要渲染
   **When** 卡片显示在网格中
   **Then** 卡片包含以下元素（精确复刻 HTML `outfit-card` 样式）：
   - 卡片容器：白色背景，16px 圆角，`box-shadow: 0 2px 8px rgba(0,0,0,0.04)`
   - 搭配预览图：宽高比 3:4，渐变背景占位（style1-4 四种颜色）
   - 收藏角标：右上角 8px，24px 圆形白色半透明背景，显示书签图标（已收藏 `#FF6B9D`）
   - 搭配信息栏：12px padding
   - 标题：14pt, Semibold, `#1C1C1E`
   - 日期标签：11pt, Regular, `#8E8E93`（右上角）
   - 风格标签：8px 圆角，11pt, Medium, `#3A3A3C`，`#F2F2F7` 背景

4. **Given** 搭配预览图需要优化加载
   **When** 列表滚动
   **Then** 使用懒加载（React Query 的 `useInfiniteQuery`）
   **And** 首屏加载 20 条记录
   **And** 滚动到底部时自动加载下 20 条
   **And** 图片使用 Expo Image 缓存

5. **Given** 用户点击搭配卡片
   **When** 点击事件触发
   **Then** 导航到搭配详情页（`/outfit/[id]`）
   **And** 使用 Expo Router 的 `push` 导航
   **And** 卡片有 press 动画（scale 0.96, 200ms）

6. **Given** 历史列表为空（新用户）
   **When** 查询结果为空
   **Then** 显示空状态（精确复刻 HTML `.empty-state` 样式）：
   - 容器：白色背景，16px 圆角，2px dashed `#E5E5EA` 边框
   - 图标：64px 圆形，紫色渐变背景，衣服图标居中
   - 主标题："还没有搭配记录"（16pt, Semibold, `#1C1C1E`）
   - 副标题："去首页拍照生成你的第一套搭配吧"（14pt, `#8E8E93`）
   - 按钮："开始搭配"（紫色渐变，20px 圆角，跳转首页）

7. **Given** 列表需要下拉刷新
   **When** 用户下拉列表
   **Then** 触发 `RefreshControl` 刷新动画（tintColor: `#6C63FF`）
   **And** 从 SQLite 重新查询最新数据
   **And** 刷新完成后隐藏加载指示器

8. **Given** 数据从 SQLite 查询
   **When** `useOutfits` hook 调用
   **Then** hook 定义在 `src/hooks/useOutfits.ts`
   **And** 使用 React Query 的 `useQuery` 或 `useInfiniteQuery`
   **And** queryKey: `['outfits', 'local', filters]`
   **And** staleTime: 30 * 1000（30 秒）
   **And** 遵循 Architecture 的 React Query 模式

9. **Given** 网格布局需要响应式适配
   **When** 屏幕尺寸变化
   **Then** 始终保持 2 列布局
   **And** 卡片宽度自动计算：`(screenWidth - 48px) / 2`
   **And** 使用 `useWindowDimensions` 获取屏幕宽度

10. **Given** 所有组件已实现
    **When** 运行测试
    **Then** useOutfits hook 测试覆盖：查询成功、查询失败、刷新、无限加载
    **And** OutfitHistoryCard 测试覆盖：渲染、点击导航、收藏状态显示
    **And** OutfitHistoryGrid 测试覆盖：空状态、列表渲染、分页加载
    **And** 遵循 VoiceOver 无障碍要求（NFR-U11）

## Tasks / Subtasks

- [x] Task 1: 创建 useOutfits hook (AC: #8)
  - [x] 创建 `src/hooks/useOutfits.ts`
  - [x] 实现 `useOutfits(filters)` 基础查询 hook（使用 useQuery）
  - [x] 实现 `useOutfitsInfinite(filters)` 无限加载 hook（使用 useInfiniteQuery）
  - [x] 添加 queryKey、staleTime 配置
  - [x] 更新 `src/hooks/index.ts` 导出

- [x] Task 2: 创建 OutfitHistoryCard 组件 (AC: #3, #5)
  - [x] 创建 `src/components/outfit/OutfitHistoryCard.tsx`
  - [x] 实现卡片布局（预览图 3:4 比例 + 信息栏）
  - [x] 实现 4 种渐变背景样式
  - [x] 实现收藏角标显示
  - [x] 实现风格标签和日期显示
  - [x] 实现点击动画（scale 0.96）
  - [x] 添加 accessibilityLabel 支持

- [x] Task 3: 创建 EmptyState 组件 (AC: #6)
  - [x] 创建 `src/components/outfit/OutfitEmptyState.tsx`
  - [x] 实现空状态 UI（图标、标题、副标题、按钮）
  - [x] 实现"开始搭配"按钮跳转首页

- [x] Task 4: 创建 OutfitHistoryGrid 组件 (AC: #2, #4, #7, #9)
  - [x] 创建 `src/components/outfit/OutfitHistoryGrid.tsx`
  - [x] 使用 FlatList 实现 2 列网格（numColumns=2）
  - [x] 实现下拉刷新（RefreshControl）
  - [x] 实现滚动到底部加载更多（onEndReached）
  - [x] 实现响应式卡片宽度计算
  - [x] 集成 useOutfitsInfinite hook

- [x] Task 5: 更新搭配 Tab 页面 (AC: #1, #2)
  - [x] 更新 `app/(tabs)/history.tsx`
  - [x] 实现紫色渐变头部（与首页一致）
  - [x] 添加筛选按钮和搜索框
  - [x] 集成 OutfitHistoryGrid 组件
  - [x] 显示搭配数量统计

- [x] Task 6: 更新导出和类型定义
  - [x] 更新 `src/components/outfit/index.ts` 导出新组件
  - [x] 添加 OutfitHistoryCardProps 类型

- [x] Task 7: 编写单元测试 (AC: #10)
  - [x] 创建 `src/hooks/__tests__/useOutfits.test.tsx`
  - [x] 创建 `src/components/outfit/OutfitHistoryCard.test.tsx`
  - [x] 创建 `src/components/outfit/OutfitHistoryGrid.test.tsx`
  - [x] 创建 `src/components/outfit/OutfitEmptyState.test.tsx`

## Dev Notes

### 从 Story 5-1 学到的经验

**Code Review 发现的问题（必须避免）：**
1. **测试必须真实执行** - 不能只是占位符
2. **SQL 查询优化** - 使用直接 SQL WHERE 而非 JS filter
3. **INSERT 保留 created_at** - 使用 ON CONFLICT 而非 INSERT OR REPLACE
4. **输入验证** - 必要字段需要验证

### HTML 原型精确样式提取

**outfit-page.html 中的关键样式：**

```css
/* 卡片网格 */
.outfits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* 卡片容器 */
.outfit-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s;
}

.outfit-card:active {
  transform: scale(0.96);
}

/* 缩略图 */
.outfit-thumbnail {
  width: 100%;
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%);
  position: relative;
}

/* 渐变背景样式 */
.outfit-thumbnail.style1 { background: linear-gradient(135deg, #FFE5E5 0%, #FFD6D6 100%); }
.outfit-thumbnail.style2 { background: linear-gradient(135deg, #E5F0FF 0%, #D6E7FF 100%); }
.outfit-thumbnail.style3 { background: linear-gradient(135deg, #FFF5E5 0%, #FFE5CC 100%); }
.outfit-thumbnail.style4 { background: linear-gradient(135deg, #F0EFFF 0%, #E8E6FF 100%); }

/* 收藏角标 */
.saved-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50%;
}

/* 信息区域 */
.outfit-info {
  padding: 12px;
}

.outfit-title {
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
}

.outfit-date {
  font-size: 11px;
  color: #8E8E93;
}

/* 迷你标签 */
.mini-tag {
  padding: 3px 8px;
  background: #F2F2F7;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: #3A3A3C;
}

/* 空状态 */
.empty-state {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  border: 2px dashed #E5E5EA;
  margin-top: 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #F0EFFF 0%, #E8E6FF 100%);
  border-radius: 50%;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #1C1C1E;
}

.empty-desc {
  font-size: 14px;
  color: #8E8E93;
}

.empty-btn {
  background: linear-gradient(135deg, #6C63FF 0%, #7B72FF 100%);
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
```

### useOutfits Hook 实现参考

```typescript
// src/hooks/useOutfits.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getOutfits, getOutfitCount } from '@/utils/storage';
import type { OutfitFilters, LocalOutfitRecord } from '@/utils/storage';

const PAGE_SIZE = 20;

export function useOutfits(filters?: OutfitFilters) {
  return useQuery({
    queryKey: ['outfits', 'local', filters],
    queryFn: () => getOutfits(filters),
    staleTime: 30 * 1000,
  });
}

export function useOutfitsInfinite(filters?: Omit<OutfitFilters, 'limit' | 'offset'>) {
  return useInfiniteQuery({
    queryKey: ['outfits', 'local', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) =>
      getOutfits({ ...filters, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    staleTime: 30 * 1000,
  });
}

export function useOutfitCount(filters?: Omit<OutfitFilters, 'limit' | 'offset'>) {
  return useQuery({
    queryKey: ['outfits', 'count', filters],
    queryFn: () => getOutfitCount(filters),
    staleTime: 30 * 1000,
  });
}
```

### OutfitHistoryCard Props 设计

```typescript
export interface OutfitHistoryCardProps {
  outfit: LocalOutfitRecord;
  width: number;           // 卡片宽度（响应式计算）
  styleIndex?: number;     // 0-3，决定渐变背景
  onPress?: () => void;
}
```

### 日期格式化工具

```typescript
// 格式化为相对时间
function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const day = 24 * 60 * 60 * 1000;

  if (diff < day) return '今天';
  if (diff < 2 * day) return '昨天';
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
```

### 项目结构

```
dali-mobile/src/
├── hooks/
│   ├── useOutfits.ts            # 新建
│   ├── __tests__/
│   │   └── useOutfits.test.ts   # 新建
│   └── index.ts                 # 更新
├── components/outfit/
│   ├── OutfitHistoryCard.tsx    # 新建
│   ├── OutfitHistoryCard.test.tsx # 新建
│   ├── OutfitHistoryGrid.tsx    # 新建
│   ├── OutfitHistoryGrid.test.tsx # 新建
│   ├── OutfitEmptyState.tsx     # 新建
│   ├── OutfitEmptyState.test.tsx # 新建
│   └── index.ts                 # 更新
└── app/(tabs)/
    └── wardrobe.tsx             # 更新
```

### 前序依赖

- **Story 5.1**: SQLite storage 已完成 ✅（getOutfits, getOutfitCount）
- **Story 3.4**: OutfitCard 组件可参考 ✅
- **Story 4.2**: StyleTagChip 组件可复用 ✅
- **@tanstack/react-query**: 已安装 ✅
- **expo-image**: 已安装 ✅

### 测试标准

- 测试文件与组件同级放置或在 `__tests__` 目录
- 使用 `describe` 结构组织测试
- Mock React Query hooks
- Mock expo-router navigation
- 测试渲染、交互、空状态
- 测试无障碍：accessibilityLabel 存在

### References

- [Source: _bmad-output/planning-artifacts/ux-design/pages/04-wardrobe/outfit-page.html]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Existing: dali-mobile/src/utils/storage.ts - getOutfits, getOutfitCount]
- [Existing: dali-mobile/src/components/outfit/OutfitCard.tsx]
- [Existing: dali-mobile/src/components/outfit/StyleTagChip.tsx]
- [NFR: NFR-P7 查询响应 < 200ms]
- [NFR: NFR-U11 VoiceOver 无障碍支持]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- Created useOutfits hook with useQuery, useInfiniteQuery, useOutfitCount, useOutfit
- Added outfitKeys for query key management
- Added formatRelativeDate and flattenOutfitPages utility functions
- Created OutfitHistoryCard with 4 gradient styles, 3:4 aspect ratio thumbnail
- Created OutfitEmptyState with dashed border and call-to-action button
- Created OutfitHistoryGrid with FlatList, 2-column layout, infinite scroll
- Updated history.tsx to use new components with SQLite data
- Added accessibility labels for VoiceOver support
- 61 unit tests passing across 4 test files

### File List

- dali-mobile/src/hooks/useOutfits.ts (created)
- dali-mobile/src/hooks/__tests__/useOutfits.test.tsx (created)
- dali-mobile/src/hooks/index.ts (modified)
- dali-mobile/src/components/outfit/OutfitHistoryCard.tsx (created)
- dali-mobile/src/components/outfit/OutfitHistoryCard.test.tsx (created)
- dali-mobile/src/components/outfit/OutfitEmptyState.tsx (created)
- dali-mobile/src/components/outfit/OutfitEmptyState.test.tsx (created)
- dali-mobile/src/components/outfit/OutfitHistoryGrid.tsx (created)
- dali-mobile/src/components/outfit/OutfitHistoryGrid.test.tsx (created)
- dali-mobile/src/components/outfit/index.ts (modified)
- dali-mobile/app/(tabs)/history.tsx (modified)

## Change Log

- 2026-01-06: Story created by create-story workflow, ready for development
- 2026-01-06: Implementation completed, all tasks done
- 2026-01-06: Code review completed, 5 issues fixed:
  - Issue 1: Added error state handling with retry button (OutfitHistoryGrid)
  - Issue 2: Removed inaccurate getItemLayout optimization
  - Issue 3: Added 4 error state tests (65 tests total)
  - Issue 4: Added returnKeyType="search" to TextInput
  - Issue 5: Fixed ListHeaderComponent type (unknown → object)
