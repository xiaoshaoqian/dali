/**
 * SQLite Storage Helpers
 * Local storage for outfit history with offline support
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 * @see Story 5.1: SQLite Local Storage for Outfit History
 */
import * as SQLite from 'expo-sqlite';

// =============================================================================
// Constants
// =============================================================================

/** Database version for migration management */
const DB_VERSION = 2;

/** Database file name */
const DB_NAME = 'dali_outfits.db';

// =============================================================================
// Types
// =============================================================================

/** Sync status enum */
export type SyncStatus = 'synced' | 'pending' | 'conflict';

/** Raw database row type (snake_case) */
interface RawOutfitRow {
  id: string;
  user_id: string;
  name: string;
  occasion: string;
  garment_image_url: string | null;
  items_json: string;
  theory_json: string;
  style_tags_json: string;
  created_at: number;
  updated_at: number;
  is_liked: number;
  is_favorited: number;
  is_deleted: number;
  sync_status: string;
}

/** Outfit record in local database (camelCase for app usage) */
export interface LocalOutfitRecord {
  id: string;
  userId: string;
  name: string;
  occasion: string;
  garmentImageUrl: string | null;
  itemsJson: string;
  theoryJson: string;
  styleTagsJson: string;
  createdAt: number;
  updatedAt: number;
  isLiked: boolean;
  isFavorited: boolean;
  isDeleted: boolean;
  syncStatus: SyncStatus;
}

/** Filters for querying outfits */
export interface OutfitFilters {
  userId?: string;
  occasion?: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

/** Partial update for outfit */
export interface OutfitUpdate {
  name?: string;
  occasion?: string;
  garmentImageUrl?: string;
  itemsJson?: string;
  theoryJson?: string;
  styleTagsJson?: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  isDeleted?: boolean;
  syncStatus?: SyncStatus;
}

/** Input for saving new outfit */
export interface OutfitInput {
  id: string;
  name: string;
  items: unknown[];
  theory: unknown;
  styleTags: string[];
  occasion?: string;
  garmentImageUrl?: string;
}

// =============================================================================
// Database Instance
// =============================================================================

let db: SQLite.SQLiteDatabase | null = null;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map raw database row to LocalOutfitRecord
 */
function mapRowToOutfitRecord(row: RawOutfitRow): LocalOutfitRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    occasion: row.occasion,
    garmentImageUrl: row.garment_image_url,
    itemsJson: row.items_json,
    theoryJson: row.theory_json,
    styleTagsJson: row.style_tags_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isLiked: row.is_liked === 1,
    isFavorited: row.is_favorited === 1,
    isDeleted: row.is_deleted === 1,
    syncStatus: row.sync_status as SyncStatus,
  };
}

/**
 * Get current Unix timestamp in milliseconds
 */
function now(): number {
  return Date.now();
}

// =============================================================================
// Database Initialization & Migration
// =============================================================================

/**
 * Run database migrations
 */
async function migrateDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Get current database version
  const versionResult = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = versionResult?.user_version ?? 0;

  // Migration from v0/v1 to v2
  if (currentVersion < 2) {
    // Check if table exists
    const tableExists = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='outfits'"
    );

    if (tableExists) {
      // Migrate existing table: add new columns
      // Note: SQLite doesn't support adding multiple columns in one ALTER TABLE
      try {
        await database.execAsync(`
          ALTER TABLE outfits ADD COLUMN user_id TEXT DEFAULT '';
        `);
      } catch {
        // Column may already exist
      }

      try {
        await database.execAsync(`
          ALTER TABLE outfits ADD COLUMN garment_image_url TEXT DEFAULT NULL;
        `);
      } catch {
        // Column may already exist
      }

      try {
        await database.execAsync(`
          ALTER TABLE outfits ADD COLUMN is_deleted INTEGER DEFAULT 0;
        `);
      } catch {
        // Column may already exist
      }

      // Create new indexes
      await database.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
        CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
      `);
    }
  }

  // Update database version
  await database.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<void> {
  if (db) return;

  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Create outfits table if not exists (v2 schema)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      occasion TEXT NOT NULL,
      garment_image_url TEXT DEFAULT NULL,
      items_json TEXT NOT NULL,
      theory_json TEXT NOT NULL,
      style_tags_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_liked INTEGER DEFAULT 0,
      is_favorited INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
    CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
    CREATE INDEX IF NOT EXISTS idx_outfits_is_liked ON outfits(is_liked);
    CREATE INDEX IF NOT EXISTS idx_outfits_is_favorited ON outfits(is_favorited);
    CREATE INDEX IF NOT EXISTS idx_outfits_is_deleted ON outfits(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_outfits_sync_status ON outfits(sync_status);
  `);

  // Run migrations for existing databases
  await migrateDatabase(db);
}

/**
 * Get database instance (initializes if needed)
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

/**
 * Close database connection (for testing)
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Save outfit to local database
 * Uses INSERT ... ON CONFLICT to preserve created_at on re-save
 * @param outfit - The outfit data to save
 * @param userId - The user ID
 * @param isLiked - Whether the outfit is liked
 * @param isFavorited - Whether the outfit is favorited
 */
export async function saveOutfit(
  outfit: OutfitInput,
  userId: string = '',
  isLiked: boolean = false,
  isFavorited: boolean = false
): Promise<void> {
  if (!outfit.id || !outfit.name) {
    throw new Error('Outfit id and name are required');
  }

  const database = await getDb();
  const timestamp = now();

  // Use INSERT ... ON CONFLICT to preserve created_at on re-save
  await database.runAsync(
    `INSERT INTO outfits
     (id, user_id, name, occasion, garment_image_url, items_json, theory_json, style_tags_json,
      is_liked, is_favorited, is_deleted, sync_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      name = excluded.name,
      occasion = excluded.occasion,
      garment_image_url = excluded.garment_image_url,
      items_json = excluded.items_json,
      theory_json = excluded.theory_json,
      style_tags_json = excluded.style_tags_json,
      is_liked = excluded.is_liked,
      is_favorited = excluded.is_favorited,
      sync_status = 'pending',
      updated_at = excluded.updated_at`,
    [
      outfit.id,
      userId,
      outfit.name,
      outfit.occasion || '',
      outfit.garmentImageUrl || null,
      JSON.stringify(outfit.items),
      JSON.stringify(outfit.theory),
      JSON.stringify(outfit.styleTags),
      isLiked ? 1 : 0,
      isFavorited ? 1 : 0,
      timestamp,
      timestamp,
    ]
  );
}

/**
 * Get outfits with optional filters
 * @param filters - Query filters
 * @returns Array of outfit records
 */
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

  // Exclude deleted by default
  if (!includeDeleted) {
    conditions.push('is_deleted = 0');
  }

  if (userId !== undefined) {
    conditions.push('user_id = ?');
    params.push(userId);
  }

  if (occasion !== undefined) {
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

  if (startDate !== undefined) {
    conditions.push('created_at >= ?');
    params.push(startDate);
  }

  if (endDate !== undefined) {
    conditions.push('created_at <= ?');
    params.push(endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

/**
 * Get outfit by ID from local database
 * @param outfitId - The outfit ID
 * @returns The outfit record or null
 */
export async function getOutfitById(
  outfitId: string
): Promise<LocalOutfitRecord | null> {
  const database = await getDb();

  const result = await database.getFirstAsync<RawOutfitRow>(
    'SELECT * FROM outfits WHERE id = ?',
    [outfitId]
  );

  if (!result) return null;

  return mapRowToOutfitRecord(result);
}

/**
 * Update outfit in local database
 * @param outfitId - The outfit ID
 * @param updates - Partial updates to apply
 */
export async function updateOutfit(
  outfitId: string,
  updates: OutfitUpdate
): Promise<void> {
  const database = await getDb();
  const timestamp = now();

  const setClauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    params.push(updates.name);
  }

  if (updates.occasion !== undefined) {
    setClauses.push('occasion = ?');
    params.push(updates.occasion);
  }

  if (updates.garmentImageUrl !== undefined) {
    setClauses.push('garment_image_url = ?');
    params.push(updates.garmentImageUrl);
  }

  if (updates.itemsJson !== undefined) {
    setClauses.push('items_json = ?');
    params.push(updates.itemsJson);
  }

  if (updates.theoryJson !== undefined) {
    setClauses.push('theory_json = ?');
    params.push(updates.theoryJson);
  }

  if (updates.styleTagsJson !== undefined) {
    setClauses.push('style_tags_json = ?');
    params.push(updates.styleTagsJson);
  }

  if (updates.isLiked !== undefined) {
    setClauses.push('is_liked = ?');
    params.push(updates.isLiked ? 1 : 0);
  }

  if (updates.isFavorited !== undefined) {
    setClauses.push('is_favorited = ?');
    params.push(updates.isFavorited ? 1 : 0);
  }

  if (updates.isDeleted !== undefined) {
    setClauses.push('is_deleted = ?');
    params.push(updates.isDeleted ? 1 : 0);
  }

  if (updates.syncStatus !== undefined) {
    setClauses.push('sync_status = ?');
    params.push(updates.syncStatus);
  }

  // Always update timestamp and set sync_status to pending (unless explicitly set)
  setClauses.push('updated_at = ?');
  params.push(timestamp);

  if (updates.syncStatus === undefined) {
    setClauses.push('sync_status = ?');
    params.push('pending');
  }

  if (setClauses.length === 0) return;

  params.push(outfitId);

  await database.runAsync(
    `UPDATE outfits SET ${setClauses.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Soft delete outfit (sets is_deleted = 1)
 * @param outfitId - The outfit ID
 */
export async function deleteOutfit(outfitId: string): Promise<void> {
  await updateOutfit(outfitId, { isDeleted: true });
}

/**
 * Hard delete outfit (permanent removal)
 * @param outfitId - The outfit ID
 */
export async function hardDeleteOutfit(outfitId: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM outfits WHERE id = ?', [outfitId]);
}

// =============================================================================
// Convenience Functions (Like & Save)
// =============================================================================

/**
 * Update outfit like status in local database
 * @param outfitId - The outfit ID
 * @param isLiked - Whether the outfit is liked
 */
export async function updateOutfitLikeStatus(
  outfitId: string,
  isLiked: boolean
): Promise<void> {
  await updateOutfit(outfitId, { isLiked });
}

/**
 * Update outfit save/favorite status in local database
 * @param outfitId - The outfit ID
 * @param isFavorited - Whether the outfit is favorited
 */
export async function updateOutfitSaveStatus(
  outfitId: string,
  isFavorited: boolean
): Promise<void> {
  await updateOutfit(outfitId, { isFavorited });
}

// =============================================================================
// Sync Operations
// =============================================================================

/**
 * Get all pending sync records
 * Uses direct SQL query for better performance
 * @returns Array of outfit records with pending sync status
 */
export async function getPendingSyncOutfits(): Promise<LocalOutfitRecord[]> {
  const database = await getDb();

  const results = await database.getAllAsync<RawOutfitRow>(
    `SELECT * FROM outfits
     WHERE sync_status = 'pending'
     ORDER BY updated_at DESC
     LIMIT 1000`
  );

  return results.map(mapRowToOutfitRecord);
}

/**
 * Mark outfit as synced
 * @param outfitId - The outfit ID
 */
export async function markOutfitAsSynced(outfitId: string): Promise<void> {
  await updateOutfit(outfitId, { syncStatus: 'synced' });
}

/**
 * Mark outfit as having sync conflict
 * @param outfitId - The outfit ID
 */
export async function markOutfitAsConflict(outfitId: string): Promise<void> {
  await updateOutfit(outfitId, { syncStatus: 'conflict' });
}

// =============================================================================
// Legacy Compatibility (for Story 3.5 code)
// =============================================================================

/**
 * Save outfit to local database (legacy interface)
 * @deprecated Use saveOutfit instead
 */
export async function saveOutfitToLocal(
  outfit: {
    id: string;
    name: string;
    items: unknown[];
    theory: unknown;
    styleTags: string[];
    occasion?: string;
  },
  isLiked: boolean = false,
  isFavorited: boolean = false
): Promise<void> {
  await saveOutfit(outfit, '', isLiked, isFavorited);
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get outfit count by filters
 * @param filters - Query filters
 * @returns Count of matching outfits
 */
export async function getOutfitCount(
  filters: Omit<OutfitFilters, 'limit' | 'offset'> = {}
): Promise<number> {
  const database = await getDb();
  const {
    userId,
    occasion,
    isLiked,
    isFavorited,
    startDate,
    endDate,
    includeDeleted = false,
  } = filters;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!includeDeleted) {
    conditions.push('is_deleted = 0');
  }

  if (userId !== undefined) {
    conditions.push('user_id = ?');
    params.push(userId);
  }

  if (occasion !== undefined) {
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

  if (startDate !== undefined) {
    conditions.push('created_at >= ?');
    params.push(startDate);
  }

  if (endDate !== undefined) {
    conditions.push('created_at <= ?');
    params.push(endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM outfits ${whereClause}`,
    params
  );

  return result?.count ?? 0;
}
