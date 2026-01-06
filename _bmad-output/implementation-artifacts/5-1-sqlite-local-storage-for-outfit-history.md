# Story 5.1: SQLite Local Storage for Outfit History

Status: done

## Story

As a **用户**（生成搭配方案的用户），
I want 我的搭配方案自动保存到手机本地，
So that 我可以在离线状态下查看历史，不依赖网络。

## Acceptance Criteria

1. **Given** 应用初次启动
   **When** 应用加载完成
   **Then** SQLite 数据库已初始化（使用 `expo-sqlite`）
   **And** `outfits` 表已创建，包含以下完整 schema：
   ```sql
   CREATE TABLE IF NOT EXISTS outfits (
     id TEXT PRIMARY KEY,              -- UUID
     user_id TEXT NOT NULL,            -- 用户 ID
     name TEXT NOT NULL,               -- 搭配名称
     occasion TEXT NOT NULL,           -- 场合类型
     garment_image_url TEXT,           -- 原始服装照片 URL
     items_json TEXT NOT NULL,         -- 服装单品 JSON
     theory_json TEXT NOT NULL,        -- 理论解析 JSON
     style_tags_json TEXT NOT NULL,    -- 风格标签 JSON
     created_at INTEGER NOT NULL,      -- Unix timestamp (毫秒)
     updated_at INTEGER NOT NULL,      -- Unix timestamp (毫秒)
     is_liked INTEGER DEFAULT 0,       -- 0 or 1
     is_favorited INTEGER DEFAULT 0,   -- 0 or 1
     is_deleted INTEGER DEFAULT 0,     -- 软删除标记
     sync_status TEXT DEFAULT 'pending' -- 'pending', 'synced', 'conflict'
   );
   ```

2. **Given** 需要高性能查询
   **When** 数据库初始化完成
   **Then** 以下索引已创建（NFR-P7 < 200ms）：
   ```sql
   CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
   CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
   CREATE INDEX IF NOT EXISTS idx_outfits_is_liked ON outfits(is_liked);
   CREATE INDEX IF NOT EXISTS idx_outfits_is_favorited ON outfits(is_favorited);
   CREATE INDEX IF NOT EXISTS idx_outfits_sync_status ON outfits(sync_status);
   ```

3. **Given** 现有 storage.ts 需要迁移增强
   **When** 开发者更新 storage.ts
   **Then** 添加数据库版本管理系统：
   ```typescript
   const DB_VERSION = 2; // 从 Story 3.5 的 v1 升级
   ```
   **And** 实现迁移逻辑处理 v1 → v2 schema 变更
   **And** 新增 `user_id`, `garment_image_url`, `is_deleted` 字段
   **And** 时间戳从 TEXT 改为 INTEGER (Unix timestamp 毫秒)

4. **Given** 需要 CRUD 操作函数
   **When** storage.ts 更新完成
   **Then** 导出以下函数：
   - `saveOutfit(outfit: Outfit, userId: string): Promise<void>` - 保存新搭配
   - `getOutfits(filters?: OutfitFilters): Promise<Outfit[]>` - 查询搭配列表（带筛选和分页）
   - `getOutfitById(id: string): Promise<Outfit | null>` - 按 ID 查询
   - `updateOutfit(id: string, updates: Partial<OutfitUpdate>): Promise<void>` - 更新搭配
   - `deleteOutfit(id: string): Promise<void>` - 软删除（设置 is_deleted = 1）
   **And** 所有函数使用 async/await，遵循 Architecture TypeScript 规范

5. **Given** getOutfits 需要支持筛选
   **When** 调用 getOutfits(filters)
   **Then** OutfitFilters 类型定义如下：
   ```typescript
   interface OutfitFilters {
     userId?: string;
     occasion?: string;
     isLiked?: boolean;
     isFavorited?: boolean;
     startDate?: number;    // Unix timestamp
     endDate?: number;      // Unix timestamp
     limit?: number;        // 默认 50
     offset?: number;       // 分页偏移
     includeDeleted?: boolean; // 默认 false
   }
   ```
   **And** 查询自动排除 `is_deleted = 1` 的记录（除非 includeDeleted = true）
   **And** 默认按 `created_at DESC` 排序

6. **Given** 查询性能需要验证
   **When** 执行任意查询操作
   **Then** 查询响应时间 < 200ms（NFR-P7）
   **And** 使用索引优化查询计划
   **And** 默认 limit = 50 防止大数据量查询

7. **Given** 用户离线时操作搭配
   **When** 用户点赞、收藏或删除
   **Then** 操作立即在 SQLite 中生效
   **And** `sync_status` 更新为 `'pending'`
   **And** `updated_at` 更新为当前时间戳
   **And** UI 立即反馈操作结果（无需等待网络）

8. **Given** 需要单元测试覆盖
   **When** 测试运行
   **Then** 测试文件 `storage.test.ts` 覆盖：
   - 数据库初始化测试
   - CRUD 操作测试（saveOutfit, getOutfits, updateOutfit, deleteOutfit）
   - 筛选查询测试（按 occasion, time range, liked/favorited）
   - 软删除测试
   - 数据库迁移测试

## Tasks / Subtasks

- [x] Task 1: 更新数据库 schema 和迁移系统 (AC: #1, #2, #3)
  - [x] 添加 DB_VERSION 常量和版本检查逻辑
  - [x] 实现 v1 → v2 迁移：添加 user_id, garment_image_url, is_deleted 字段
  - [x] 更新 created_at, updated_at 为 INTEGER 类型
  - [x] 添加缺失的索引 (idx_outfits_user_id, idx_outfits_created_at, idx_outfits_occasion)

- [x] Task 2: 增强 CRUD 函数 (AC: #4, #5)
  - [x] 更新 saveOutfit 函数支持 userId 参数
  - [x] 实现 getOutfits(filters) 函数支持完整筛选
  - [x] 实现 updateOutfit(id, updates) 通用更新函数
  - [x] 实现 deleteOutfit(id) 软删除函数
  - [x] 添加 OutfitFilters 和相关类型定义

- [x] Task 3: 更新现有函数以使用新 schema (AC: #7)
  - [x] 更新 updateOutfitLikeStatus 使用 INTEGER 时间戳
  - [x] 更新 updateOutfitSaveStatus 使用 INTEGER 时间戳
  - [x] 更新 getOutfitById 返回新字段
  - [x] 更新 saveOutfitToLocal 使用新 schema (legacy compatibility)

- [x] Task 4: 添加类型定义和导出 (AC: #4)
  - [x] 更新 LocalOutfitRecord 类型
  - [x] 添加 OutfitFilters 类型
  - [x] 添加 OutfitUpdate 类型
  - [x] 添加 OutfitInput 类型

- [x] Task 5: 编写单元测试 (AC: #8)
  - [x] 创建 storage.test.ts 测试文件
  - [x] 测试数据库初始化
  - [x] 测试 saveOutfit 函数
  - [x] 测试 getOutfits 带各种筛选条件
  - [x] 测试 updateOutfit 函数
  - [x] 测试 deleteOutfit 软删除
  - [x] 测试数据库迁移逻辑

- [x] Task 6: 性能验证 (AC: #6)
  - [x] 验证查询使用索引优化
  - [x] 默认 limit=50 防止大数据量查询

## Dev Notes

### 现有实现分析

**已实现（Story 3.5 创建的 `dali-mobile/src/utils/storage.ts`）：**
- 数据库初始化 `initDatabase()`
- 基础 `outfits` 表（缺少 user_id, garment_image_url, is_deleted 字段）
- 部分索引（is_liked, is_favorited, sync_status）
- 函数：updateOutfitLikeStatus, updateOutfitSaveStatus, getOutfitById, getPendingSyncOutfits, markOutfitAsSynced, saveOutfitToLocal

**需要增强：**
1. Schema 升级：添加 user_id, garment_image_url, is_deleted 字段
2. 时间戳格式：从 TEXT ISO 字符串改为 INTEGER Unix 毫秒
3. 新增索引：idx_outfits_user_id, idx_outfits_created_at, idx_outfits_occasion
4. 新函数：getOutfits(filters), updateOutfit, deleteOutfit
5. 迁移系统：DB_VERSION 和迁移逻辑

### 数据库迁移策略

```typescript
const DB_VERSION = 2;

async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  // 获取当前版本
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 2) {
    // v1 → v2 迁移
    await db.execAsync(`
      ALTER TABLE outfits ADD COLUMN user_id TEXT DEFAULT '';
      ALTER TABLE outfits ADD COLUMN garment_image_url TEXT DEFAULT '';
      ALTER TABLE outfits ADD COLUMN is_deleted INTEGER DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
      CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
    `);
  }

  // 更新版本号
  await db.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}
```

### getOutfits 实现参考

```typescript
export async function getOutfits(
  filters: OutfitFilters = {}
): Promise<LocalOutfitRecord[]> {
  const database = await getDb();
  const {
    userId,
    occasion,
    isLiked,
    isFavorited,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
    includeDeleted = false,
  } = filters;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!includeDeleted) {
    conditions.push('is_deleted = 0');
  }
  if (userId) {
    conditions.push('user_id = ?');
    params.push(userId);
  }
  if (occasion) {
    conditions.push('occasion = ?');
    params.push(occasion);
  }
  if (isLiked !== undefined) {
    conditions.push('is_liked = ?');
    params.push(isLiked ? 1 : 0);
  }
  if (isFavorited !== undefined) {
    conditions.push('is_favorited = ?');
    params.push(isFavorited ? 1 : 0);
  }
  if (startDate) {
    conditions.push('created_at >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('created_at <= ?');
    params.push(endDate);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const query = `
    SELECT * FROM outfits
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const results = await database.getAllAsync<RawOutfitRow>(query, params);
  return results.map(mapRowToOutfitRecord);
}
```

### 测试模式

```typescript
// 测试时使用内存数据库
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(() => []),
  })),
}));
```

### 项目结构

```
dali-mobile/src/
├── utils/
│   ├── storage.ts           # 更新：增强 CRUD 和迁移
│   └── storage.test.ts      # 新建：单元测试
├── services/
│   └── index.ts             # 更新：导出类型
```

### 前序依赖

- **Story 3.5**: 基础 storage.ts 已完成 ✅
- **expo-sqlite ~16.0.10**: 已安装 ✅

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Layer]
- [Existing: dali-mobile/src/utils/storage.ts]
- [NFR: NFR-P7 查询响应 < 200ms]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- ✅ Upgraded database schema from v1 to v2 with migration support
- ✅ Added DB_VERSION constant (v2) and PRAGMA user_version migration check
- ✅ Added new fields: user_id, garment_image_url, is_deleted
- ✅ Changed timestamps from TEXT (ISO string) to INTEGER (Unix ms)
- ✅ Created 7 indexes for performance optimization (NFR-P7)
- ✅ Implemented full CRUD: saveOutfit, getOutfits, getOutfitById, updateOutfit, deleteOutfit
- ✅ getOutfits supports filters: userId, occasion, isLiked, isFavorited, startDate, endDate, limit, offset, includeDeleted
- ✅ Soft delete pattern with is_deleted flag
- ✅ Auto sync_status='pending' on updates for offline sync
- ✅ Legacy compatibility: saveOutfitToLocal still works
- ✅ Added helper functions: hardDeleteOutfit, markOutfitAsConflict, getOutfitCount, closeDatabase
- ✅ Comprehensive unit tests: 51 tests passing (increased from 40 after code review)

**Code Review Fixes Applied:**
- ✅ M1: Added 7 migration tests (v1→v2 ALTER TABLE, column additions, index creation)
- ✅ M2: Changed saveOutfit from INSERT OR REPLACE to INSERT ... ON CONFLICT to preserve created_at
- ✅ M3: Optimized getPendingSyncOutfits to use direct SQL WHERE clause instead of JS filter
- ✅ L1: Added input validation for outfit.id and outfit.name (throws error if empty)

### File List

- dali-mobile/src/utils/storage.ts (modified - enhanced with v2 schema, CRUD, migration)
- dali-mobile/src/utils/storage.test.ts (created - 40 unit tests)

## Change Log

- 2026-01-06: Story created by create-story workflow, ready for development
- 2026-01-06: All tasks completed by Dev Agent, status changed to review
- 2026-01-06: Code Review completed by Xiaoshaoqian
  - **Issues Found:** 0 High, 3 Medium, 2 Low
  - **Issues Fixed:**
    - M1: Added 7 migration tests for v1→v2 database upgrade path
    - M2: Fixed saveOutfit to use INSERT...ON CONFLICT preserving created_at
    - M3: Optimized getPendingSyncOutfits with direct SQL query
    - L1: Added input validation for outfit.id and outfit.name
  - Tests increased from 40 to 51
  - Status changed to done
