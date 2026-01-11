# Story 8.3: Network Reconnection and Auto-Sync within 30s

Status: ready-for-dev

## Story

As a **用户**（网络恢复的用户），
I want 网络恢复后自动同步数据，
so that 我不需要手动操作数据自动保持最新。

## Acceptance Criteria

### AC#1: Network Recovery Detection
**Given** 用户从离线恢复到在线
**When** NetInfo 检测到网络状态变为 `isConnected: true`
**Then** 30 秒内自动触发同步（NFR-U8）
**And** 同步服务在后台执行不阻塞 UI
**And** 离线横幅自动隐藏（淡出动画）

### AC#2: Auto-Sync Trigger on Network Recovery
**Given** 自动同步服务触发
**When** 网络恢复
**Then** 调用 `syncService.syncPendingOutfits()` 同步待处理数据
**And** 逐个处理离线队列中的操作（pendingActions）
**And** 同步 SQLite 中 `sync_status = 'pending'` 的记录

### AC#3: Sync Like/Save Operations
**Given** 同步点赞/收藏操作
**When** 处理 `type: 'like'` 或 `'save'` 操作
**Then** 调用相应的 API 端点
**And** 成功后更新 SQLite 的 `sync_status = 'synced'`
**And** 从离线队列移除该操作

### AC#4: Sync Delete Operations
**Given** 同步删除操作
**When** 处理 `type: 'delete'` 操作
**Then** 调用 DELETE API
**And** 后端标记为软删除（`is_deleted = true`）
**And** 从离线队列移除

### AC#5: Sync Outfit Data
**Given** 同步新生成的搭配数据
**When** SQLite 中有 `sync_status = 'pending'` 的 outfit
**Then** 调用 `/api/v1/outfits/sync` 批量上传
**And** 使用 Last-Write-Wins 策略解决冲突
**And** 更新 `sync_status = 'synced'`

### AC#6: Sync User Preferences
**Given** 同步用户偏好设置
**When** 用户在离线时修改了偏好
**Then** 调用 `/api/v1/users/me/preferences` PUT 更新云端数据
**And** 同步成功后更新本地状态

### AC#7: Sync Progress Feedback
**Given** 同步进度需要反馈
**When** 同步开始
**Then** 底部显示小型 Toast："正在同步数据..."
**And** Toast 包含进度指示器（转圈动画）
**When** 同步完成
**Then** Toast 更新为："已同步 N 条数据 ✓"
**And** 2 秒后自动消失

### AC#8: Sync Failure Handling with Exponential Backoff
**Given** 同步失败处理
**When** 某个操作同步失败（API 错误、超时）
**Then** 保留在离线队列中
**And** 使用指数退避重试（1s → 2s → 4s，最多 3 次，NFR-R10）
**And** 3 次失败后停止重试，等待下次网络变化或 app 重启

### AC#9: Conflict Resolution with Last-Write-Wins
**Given** 同步冲突解决
**When** 服务器数据比本地新（`updated_at` 更晚）
**Then** 使用 Last-Write-Wins 策略，服务器数据覆盖本地
**And** 更新 SQLite 为服务器版本
**And** 可选：记录冲突日志

### AC#10: Foreground Sync Polling
**Given** 后台同步定时任务
**When** 用户在线且 app 在前台
**Then** 每 5 分钟自动检查并同步一次
**And** 使用轮询机制

### AC#11: Background Sync Support
**Given** 后台同步（app 在后台时）
**When** 用户切换到后台
**Then** 使用 Expo Background Fetch 定期同步（iOS 限制）
**And** 最小间隔 15 分钟（iOS 系统限制）

### AC#12: Settings Page Sync Status Display
**Given** 用户可以查看同步状态
**When** 用户进入设置页
**Then** 显示"上次同步时间"（相对时间，如"2 分钟前"）
**And** 显示"待同步数量"
**And** 提供"立即同步"按钮手动触发同步
**And** 同步中时按钮显示加载指示器

### AC#13: Network Recovery Experience
**Given** 网络恢复体验需要流畅
**When** 从离线到在线转换
**Then** 遵循以下原则：
- ✅ 30 秒内自动同步（NFR-U8）
- ✅ 后台静默同步不打断用户
- ✅ 同步进度简洁提示（Toast）
- ✅ 失败自动重试不骚扰用户
- ✅ 冲突自动解决（Last-Write-Wins）
- ✅ 支持手动同步（设置页）

## Tasks / Subtasks

- [ ] Task 1: Create SyncToast Component (AC: #7)
  - [ ] Create `src/components/ui/SyncToast.tsx`
  - [ ] Implement spinning progress indicator during sync
  - [ ] Show "正在同步数据..." message during sync
  - [ ] Show "已同步 N 条数据 ✓" on completion
  - [ ] Auto-dismiss after 2 seconds
  - [ ] Listen to `offlineStore.isSyncing` and `lastSyncResult`
  - [ ] Create unit tests `SyncToast.test.tsx`

- [ ] Task 2: Implement syncPendingActions Function (AC: #2, #3, #4)
  - [ ] Create `syncPendingActions()` in `src/services/sync.ts`
  - [ ] Process pendingActions queue from offlineStore
  - [ ] Call appropriate API for each action type (like/unlike/save/unsave/delete)
  - [ ] Remove from queue on success
  - [ ] Handle failures with exponential backoff
  - [ ] Create unit tests

- [ ] Task 3: Enhance useNetworkSync Hook (AC: #1, #2)
  - [ ] Verify network recovery detection triggers sync within 30s
  - [ ] Integrate syncPendingActions with outfit sync
  - [ ] Handle transition from offline → online properly
  - [ ] Ensure OfflineBanner hides on recovery
  - [ ] Add unit tests for network recovery scenarios

- [ ] Task 4: Add Preferences Sync Support (AC: #6)
  - [ ] Update `useUpdatePreferences` hook to queue offline changes
  - [ ] Add preference sync to syncPendingActions
  - [ ] Create `PreferencesPendingAction` type
  - [ ] Handle preference conflicts with Last-Write-Wins
  - [ ] Create unit tests

- [ ] Task 5: Implement Background Fetch (AC: #11)
  - [ ] Configure expo-background-fetch in app.json
  - [ ] Create `src/services/backgroundSync.ts`
  - [ ] Define BACKGROUND_SYNC task with TaskManager
  - [ ] Register task with BackgroundFetch (15min interval)
  - [ ] Handle task execution and cleanup
  - [ ] Create unit tests

- [ ] Task 6: Create SyncStatusSection Component (AC: #12)
  - [ ] Create `src/components/profile/SyncStatusSection.tsx`
  - [ ] Display "上次同步时间" with relative formatting
  - [ ] Display "待同步数量" from offlineStore
  - [ ] Add "立即同步" button with loading state
  - [ ] Integrate into Settings page
  - [ ] Create unit tests `SyncStatusSection.test.tsx`

- [ ] Task 7: Enhance Conflict Resolution (AC: #9)
  - [ ] Verify Last-Write-Wins implementation in sync.ts
  - [ ] Add conflict logging to local storage
  - [ ] Show Toast on conflict resolution (optional)
  - [ ] Create unit tests for conflict scenarios

- [ ] Task 8: Update Settings Page Integration (AC: #12)
  - [ ] Add SyncStatusSection to settings page
  - [ ] Wire up manual sync button to syncService
  - [ ] Display sync error messages when failures occur
  - [ ] Test manual sync functionality

- [ ] Task 9: Add Sync Logging and Debug Support
  - [ ] Add structured logging for sync events
  - [ ] Create sync event types for analytics
  - [ ] Add debug panel for development (optional)
  - [ ] Log sync metrics to backend analytics

- [ ] Task 10: End-to-End Testing (AC: #1-#13)
  - [ ] Test network recovery → auto-sync flow (manual)
  - [ ] Test offline → online transition (manual)
  - [ ] Test pendingActions queue processing (unit tests)
  - [ ] Test conflict resolution scenarios (unit tests)
  - [ ] Test background sync registration (manual)
  - [ ] Test settings page sync status display (unit tests)
  - [ ] Test SyncToast appearance and dismissal (unit tests)

## Dev Notes

### Existing Implementation Analysis

**Already Implemented (from Epic 5 Story 5.4 and Story 8.2):**
- ✅ `syncService` - Singleton sync service with `syncPendingOutfits()`
- ✅ `offlineStore.ts` - Zustand store with `pendingActions`, `isOnline`, `isSyncing`
- ✅ `useNetworkSync.ts` - Network monitoring hook with NetInfo integration
- ✅ `scheduleNetworkRecoverySync()` - 30s delayed sync trigger
- ✅ `useOfflineStore.setOnline()` - Tracks `isOnline` and `wasOnline` for transitions
- ✅ `retryWithBackoff()` - Exponential backoff utility in sync.ts
- ✅ `OfflineBanner.tsx` - Offline indication banner
- ✅ `useOfflineMode.ts` - Unified offline state hook
- ✅ AsyncStorage persistence for pendingActions

**Needs to be Created/Enhanced:**
- ❌ `SyncToast.tsx` - Toast showing sync progress and completion
- ❌ `syncPendingActions()` - Process offlineStore.pendingActions queue
- ❌ `SyncStatusSection.tsx` - Settings page sync status display
- ❌ Background Fetch integration (expo-background-fetch)
- ❌ Preferences sync integration

### Architecture Compliance

**Technology Stack:**
- @react-native-community/netinfo (bundled version 11.4.1)
- expo-background-fetch for background sync
- expo-task-manager for background task management
- Zustand 4.x for state management
- AsyncStorage for queue persistence

**Network Recovery Flow:**
```typescript
// NetInfo detects network recovery
NetInfo.addEventListener(state => {
  const newOnline = state.isConnected ?? false;
  const wasOffline = !offlineStore.isOnline;

  if (newOnline && wasOffline) {
    // Transition: offline → online
    // 1. Update store
    offlineStore.setOnline(true);
    // 2. Hide OfflineBanner (automatic via store subscription)
    // 3. Schedule sync within 30s
    scheduleNetworkRecoverySync(30000);
  }
});
```

**Sync Flow:**
```typescript
async function syncAll() {
  // 1. Sync pending actions (like/unlike/save/unsave/delete)
  await syncPendingActions();

  // 2. Sync pending outfits (SQLite sync_status='pending')
  await syncService.syncPendingOutfits();

  // 3. Sync pending preferences (if any)
  await syncPendingPreferences();
}
```

**Background Fetch Setup:**
```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SYNC_TASK = 'DALI_BACKGROUND_SYNC';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const { isOnline } = useOfflineStore.getState();
  if (!isOnline) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  try {
    await syncService.syncPendingOutfits();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Registration
await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
  minimumInterval: 15 * 60, // 15 minutes (iOS minimum)
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### UI Patterns

**SyncToast Design:**
- Position: Bottom center, above tab bar
- Height: 44pt
- Background: White with shadow
- During sync: Spinner + "正在同步数据..."
- On completion: Checkmark + "已同步 N 条数据 ✓"
- Auto-dismiss: 2 seconds after completion
- Animation: Slide up/down with spring (300ms)

**SyncStatusSection Design (Settings Page):**
```
┌─────────────────────────────────────┐
│  数据同步                      [>]  │
├─────────────────────────────────────┤
│  上次同步        2 分钟前           │
│  待同步数据      3 条               │
│                                     │
│  [      立即同步      ]             │
└─────────────────────────────────────┘
```

### Project Structure Notes

**Files to Create:**
```
dali-mobile/src/components/ui/SyncToast.tsx
dali-mobile/src/components/ui/SyncToast.test.tsx
dali-mobile/src/components/profile/SyncStatusSection.tsx
dali-mobile/src/components/profile/SyncStatusSection.test.tsx
dali-mobile/src/services/backgroundSync.ts
dali-mobile/src/services/__tests__/backgroundSync.test.ts
```

**Files to Modify:**
```
dali-mobile/src/services/sync.ts - Add syncPendingActions
dali-mobile/src/hooks/useNetworkSync.ts - Integrate pendingActions sync
dali-mobile/src/hooks/usePreferences.ts - Add offline queue support
dali-mobile/src/stores/offlineStore.ts - Add preference action types
dali-mobile/src/components/ui/index.ts - Export SyncToast
dali-mobile/src/components/profile/index.ts - Export SyncStatusSection
dali-mobile/app.json - Add background fetch plugin
dali-mobile/app/(tabs)/profile.tsx - Add SyncStatusSection
```

**Naming Conventions (per architecture.md):**
- Components: PascalCase (`SyncToast.tsx`)
- Hooks: camelCase with `use` prefix (`useBackgroundSync.ts`)
- Tests: Co-located with `.test.tsx` suffix
- Services: camelCase (`backgroundSync.ts`)

### Performance Requirements

- Network recovery sync: Within 30 seconds (NFR-U8)
- Sync should not block UI (background execution)
- Foreground polling: Every 5 minutes
- Background fetch: Minimum 15 minutes (iOS limit)
- Toast animation: 300ms spring

### Testing Requirements

**Test file patterns:**
```
src/components/ui/SyncToast.test.tsx
src/components/profile/SyncStatusSection.test.tsx
src/services/__tests__/backgroundSync.test.ts
src/services/__tests__/sync.test.ts (extend existing)
src/hooks/__tests__/useNetworkSync.test.ts (extend existing)
```

**Test scenarios:**
1. Network recovery triggers sync within 30s
2. pendingActions queue processed correctly
3. Like/unlike actions synced to API
4. Save/unsave actions synced to API
5. Delete actions synced to API
6. Exponential backoff on failures (1s → 2s → 4s)
7. Max 3 retries then stop
8. Conflict resolution with Last-Write-Wins
9. SyncToast shows during and after sync
10. Settings page displays correct sync status
11. Manual sync button works correctly
12. Background fetch task executes properly

### Previous Story Intelligence (8-2)

From Story 8-2 (Offline Mode Handler):
- OfflineBanner component with auto-collapse
- offlineStore with AsyncStorage persistence
- useOfflineMode hook with canPerformAction
- NetInfo integration in useNetworkSync
- Axios offline error detection interceptor
- Home screen offline button disabled state

**Learnings to apply:**
- Reuse animation patterns from OfflineBanner (spring 300ms)
- Follow same toast styling (white background, shadow)
- Use existing offlineStore structure
- Leverage useNetworkSync for network detection
- Mock NetInfo in tests same way

### References

- [Source: epics.md#Epic 8: Story 8.3]
- [Source: architecture.md#Cross-Cutting Concerns - Data Synchronization Strategy]
- [Source: architecture.md#Reliability Requirements - NFR-R10]
- [Source: project-context.md#NFR-U8 - 30s Auto-Sync]
- [Source: existing sync.ts implementation]
- [Source: existing useNetworkSync.ts implementation]
- [Source: existing offlineStore.ts implementation]
- [Source: Expo Background Fetch Documentation](https://docs.expo.dev/versions/latest/sdk/background-fetch/)
- [Source: Expo Task Manager Documentation](https://docs.expo.dev/versions/latest/sdk/task-manager/)

## Dev Agent Record

### Agent Model Used

(To be filled after implementation)

### Debug Log References

N/A

### Completion Notes List

(To be filled after implementation)

### File List

(To be filled after implementation)
