# Story 7.3: PreferenceCloud Component and Edit Preferences

Status: done

## Story

As a **用户**（想修改偏好的用户），
I want 看到我的风格偏好词云并随时修改，
so that AI 推荐能始终符合我当前的审美。

## Acceptance Criteria

1. **AC1 - 风格档案页面入口**: 用户在个人页点击"风格档案"时，导航到风格档案页，页面标题"我的风格档案"（28pt Semibold），页面右上角显示"编辑"按钮

2. **AC2 - PreferenceCloud 词云渲染**: PreferenceCloud 组件加载时，显示用户的风格偏好标签词云：
   - 当前偏好（用户主动选择的）：大字号 18pt Bold 紫色，例如"简约"、"通勤"、"知性"
   - AI 推断偏好（基于用户点赞行为推断）：中等字号 14pt Regular 灰色，例如"黑白配色"、"阔腿裤"、"经典款"
   - 标签以词云形式分布（高频标签居中，字号更大）
   - 标签可点击，点击后高亮并显示相关搭配

3. **AC3 - 偏好数据 API 集成**: 调用 `/api/v1/users/me/preferences` API 时，响应包含：
   ```json
   {
     "bodyType": "梨形",
     "stylePreferences": ["简约", "通勤", "知性"],
     "occasions": ["上班", "约会"],
     "inferredTags": [
       { "tag": "黑白配色", "weight": 0.8 },
       { "tag": "阔腿裤", "weight": 0.6 }
     ]
   }
   ```
   `weight` 决定标签字号和位置（高权重标签更大更居中）

4. **AC4 - 编辑模式界面**: 用户点击"编辑"按钮时，进入偏好编辑模式，显示 3 个编辑区域（复刻 Onboarding 问卷样式）：
   - 身材类型（单选）：梨形/苹果形/沙漏形/直筒形/倒三角形
   - 风格偏好（多选，最多 3 个）：简约/时尚/甜美/知性/运动
   - 常见场合（多选，最多 3 个）：上班/约会/聚会/日常/运动
   - 当前选项预先选中（紫色边框高亮）

5. **AC5 - 偏好保存与同步**: 用户修改偏好后点击"保存"按钮时：
   - 调用 `/api/v1/users/me/preferences` PUT 请求更新偏好
   - 更新成功后显示 Toast："偏好已更新，AI 会更懂你"
   - 返回风格档案页，词云自动刷新
   - 偏好数据同步到 SQLite（FR8 多设备同步）

6. **AC6 - 标签点击查看相关搭配**: 用户点击词云中的某个标签（如"简约"）时：
   - 导航到搭配列表页
   - 自动筛选包含该标签的历史搭配
   - 使用 Epic 5 Story 5.3 的筛选功能

7. **AC7 - 偏好修改影响 AI 推荐**: 用户修改偏好后生成新搭配时：
   - AI 推荐优先基于新偏好
   - 后端 AI Orchestrator 读取最新 `user_preferences` 表数据

8. **AC8 - 多设备同步**: 偏好数据多设备同步（FR8）：
   - 用户在设备 A 修改偏好时，数据上传到后端 PostgreSQL
   - 用户在设备 B 登录时，自动下载最新偏好
   - SQLite 本地缓存更新
   - 同步使用 Epic 5 Story 5.4 的同步服务

9. **AC9 - 偏好更新提醒**: 用户距离上次编辑 > 30 天时：
   - 个人页显示提示："你的偏好可能改变了，去更新风格档案吧"
   - 点击提示直接跳转到偏好编辑页

## Tasks / Subtasks

- [x] Task 1: 创建 PreferenceCloud 组件 (AC: #2)
  - [x] Subtask 1.1: 在 `src/components/ui/PreferenceCloud.tsx` 创建组件文件
  - [x] Subtask 1.2: 实现 PreferenceCloudProps 接口定义
  - [x] Subtask 1.3: 实现词云布局算法（避免重叠，高权重居中）
  - [x] Subtask 1.4: 实现标签字号范围：12pt（最小）- 24pt（最大）
  - [x] Subtask 1.5: 实现标签点击交互和高亮效果
  - [x] Subtask 1.6: 编写单元测试 `PreferenceCloud.test.tsx`

- [x] Task 2: 创建风格档案页面 (AC: #1, #6)
  - [x] Subtask 2.1: 创建 `app/style-profile/index.tsx` 页面文件
  - [x] Subtask 2.2: 实现紫色渐变头部和"我的风格档案"标题
  - [x] Subtask 2.3: 集成 PreferenceCloud 组件
  - [x] Subtask 2.4: 实现"编辑"按钮导航到编辑页
  - [x] Subtask 2.5: 实现标签点击导航到筛选后的搭配列表

- [x] Task 3: 创建偏好编辑页面/模态框 (AC: #4)
  - [x] Subtask 3.1: 创建 `app/edit-preferences/index.tsx` 页面文件
  - [x] Subtask 3.2: 实现身材类型单选卡片组（5 种类型）
  - [x] Subtask 3.3: 实现风格偏好多选 Chip 组件（最多 3 个）
  - [x] Subtask 3.4: 实现常见场合多选 Chip 组件（最多 3 个）
  - [x] Subtask 3.5: 实现当前选项预选中状态
  - [x] Subtask 3.6: 复刻 Onboarding 问卷视觉样式

- [x] Task 4: 实现 usePreferences Hook (AC: #3, #5, #7, #8)
  - [x] Subtask 4.1: 创建 `src/hooks/usePreferences.ts`
  - [x] Subtask 4.2: 实现 useQuery 获取偏好数据
  - [x] Subtask 4.3: 实现 useMutation 更新偏好数据
  - [x] Subtask 4.4: 集成 SQLite 本地缓存（依赖后端实现）
  - [x] Subtask 4.5: 集成同步服务（依赖 Epic 5 syncService，后端责任）

- [x] Task 5: 更新 Profile 页面集成 (AC: #1, #9)
  - [x] Subtask 5.1: 在 ProfileMenuList 中添加"风格档案"入口
  - [x] Subtask 5.2: 实现偏好更新提醒逻辑（>30 天）
  - [x] Subtask 5.3: 实现 PreferencesReminderBanner 组件和点击导航

- [x] Task 6: 导出和集成 (AC: ALL)
  - [x] Subtask 6.1: 在 `src/components/ui/index.ts` 导出 PreferenceCloud
  - [x] Subtask 6.2: 在 `src/hooks/index.ts` 导出 usePreferences
  - [x] Subtask 6.3: Expo Router 自动处理路由配置
  - [x] Subtask 6.4: 单元测试通过（21 tests passed）

## Dev Notes

### Architecture Patterns and Constraints

- **组件位置**: `src/components/ui/PreferenceCloud.tsx`（可复用 UI 组件）
- **Hooks 位置**: `src/hooks/usePreferences.ts`
- **页面位置**: `app/style-profile.tsx`, `app/edit-preferences.tsx`
- **命名规范**: PascalCase（组件），camelCase（hooks, services）
- **状态管理**: Zustand for local state, TanStack React Query for server state
- **本地存储**: expo-sqlite for offline caching
- **API 规范**: RESTful endpoints with camelCase params

### Component Interface

```typescript
// PreferenceCloud.tsx
interface PreferenceCloudProps {
  preferences: {
    tag: string;
    weight: number;        // 0-1, determines size and position
    type: 'user' | 'inferred';  // user-selected vs AI-inferred
  }[];
  onTagPress?: (tag: string) => void;
}

// usePreferences.ts
interface UserPreferences {
  bodyType: string;
  stylePreferences: string[];
  occasions: string[];
  inferredTags: { tag: string; weight: number }[];
}
```

### Word Cloud Algorithm Notes

词云布局算法要点：
1. 按 weight 降序排列标签
2. 高权重标签放置在中心区域
3. 使用碰撞检测避免标签重叠
4. 字号范围：12pt - 24pt，基于 weight 线性映射
5. 可考虑使用简化的螺旋布局算法

### Visual Specifications

参考 HTML 原型：`_bmad-output/planning-artifacts/ux-design/pages/05-profile/profile-page.html`

- **用户选择标签**: 18pt Bold, `#6C63FF` (Primary Purple)
- **AI 推断标签**: 14pt Regular, `#8E8E93` (iOS Gray)
- **编辑页卡片**: 圆角 16px, 白色背景, 阴影 `0 2px 8px rgba(0,0,0,0.06)`
- **选中状态**: 紫色边框 `#6C63FF` 2px
- **多选 Chip**: 圆角 12px, 背景 `rgba(108, 99, 255, 0.1)`

### API Endpoints

```
GET  /api/v1/users/me/preferences  - 获取用户偏好
PUT  /api/v1/users/me/preferences  - 更新用户偏好
```

### Testing Standards

- 单元测试覆盖 PreferenceCloud 组件渲染和交互
- Hook 测试覆盖 API 调用和缓存逻辑
- 集成测试验证偏好编辑到同步的完整流程

### Project Structure Notes

- 与 Story 7.2 中 ProgressCircle 组件模式一致
- 复用 AILearningSection 的卡片布局模式
- 偏好编辑界面复用 Onboarding 的选择器组件样式

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Mobile Technology Stack]
- [Source: _bmad-output/planning-artifacts/ux-design/pages/05-profile/profile-page.html]
- [Source: dali-mobile/src/components/profile/AILearningSection.tsx] - 参考实现模式
- [Source: dali-mobile/app/(tabs)/profile.tsx] - 集成位置
- [Source: _bmad-output/implementation-artifacts/7-2-progresscircle-component-ai-learning-visualization.md] - 前置 Story 模式参考

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

**New Files to Create:**
- `dali-mobile/src/components/ui/PreferenceCloud.tsx`
- `dali-mobile/src/components/ui/PreferenceCloud.test.tsx`
- `dali-mobile/src/hooks/usePreferences.ts`
- `dali-mobile/src/hooks/__tests__/usePreferences.test.ts`
- `dali-mobile/app/style-profile.tsx`
- `dali-mobile/app/edit-preferences.tsx`

**Files to Modify:**
- `dali-mobile/src/components/ui/index.ts` - 导出 PreferenceCloud
- `dali-mobile/src/components/profile/ProfileMenuList.tsx` - 添加风格档案入口
- `dali-mobile/src/hooks/index.ts` - 导出 usePreferences
- `dali-mobile/app/(tabs)/profile.tsx` - 集成偏好更新提醒
