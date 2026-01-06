/**
 * SQLite Storage Helpers
 * Local storage for outfit history with offline support
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */
import * as SQLite from 'expo-sqlite';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Sync status enum
export type SyncStatus = 'synced' | 'pending' | 'failed';

// Outfit record in local database
export interface LocalOutfitRecord {
  id: string;
  name: string;
  itemsJson: string;
  theoryJson: string;
  styleTagsJson: string;
  occasion: string;
  isLiked: boolean;
  isFavorited: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<void> {
  if (db) return;

  db = await SQLite.openDatabaseAsync('dali_outfits.db');

  // Create outfits table if not exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      items_json TEXT NOT NULL,
      theory_json TEXT NOT NULL,
      style_tags_json TEXT NOT NULL,
      occasion TEXT NOT NULL,
      is_liked INTEGER DEFAULT 0,
      is_favorited INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outfits_is_liked ON outfits(is_liked);
    CREATE INDEX IF NOT EXISTS idx_outfits_is_favorited ON outfits(is_favorited);
    CREATE INDEX IF NOT EXISTS idx_outfits_sync_status ON outfits(sync_status);
  `);
}

/**
 * Get database instance (initializes if needed)
 */
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

/**
 * Update outfit like status in local database
 * @param outfitId - The outfit ID
 * @param isLiked - Whether the outfit is liked
 */
export async function updateOutfitLikeStatus(
  outfitId: string,
  isLiked: boolean
): Promise<void> {
  const database = await getDb();
  const now = new Date().toISOString();

  await database.runAsync(
    `UPDATE outfits
     SET is_liked = ?, sync_status = 'pending', updated_at = ?
     WHERE id = ?`,
    [isLiked ? 1 : 0, now, outfitId]
  );
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
  const database = await getDb();
  const now = new Date().toISOString();

  await database.runAsync(
    `UPDATE outfits
     SET is_favorited = ?, sync_status = 'pending', updated_at = ?
     WHERE id = ?`,
    [isFavorited ? 1 : 0, now, outfitId]
  );
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

  const result = await database.getFirstAsync<{
    id: string;
    name: string;
    items_json: string;
    theory_json: string;
    style_tags_json: string;
    occasion: string;
    is_liked: number;
    is_favorited: number;
    sync_status: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM outfits WHERE id = ?', [outfitId]);

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    itemsJson: result.items_json,
    theoryJson: result.theory_json,
    styleTagsJson: result.style_tags_json,
    occasion: result.occasion,
    isLiked: result.is_liked === 1,
    isFavorited: result.is_favorited === 1,
    syncStatus: result.sync_status as SyncStatus,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * Get all pending sync records
 * @returns Array of outfit records with pending sync status
 */
export async function getPendingSyncOutfits(): Promise<LocalOutfitRecord[]> {
  const database = await getDb();

  const results = await database.getAllAsync<{
    id: string;
    name: string;
    items_json: string;
    theory_json: string;
    style_tags_json: string;
    occasion: string;
    is_liked: number;
    is_favorited: number;
    sync_status: string;
    created_at: string;
    updated_at: string;
  }>(`SELECT * FROM outfits WHERE sync_status = 'pending'`);

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    itemsJson: r.items_json,
    theoryJson: r.theory_json,
    styleTagsJson: r.style_tags_json,
    occasion: r.occasion,
    isLiked: r.is_liked === 1,
    isFavorited: r.is_favorited === 1,
    syncStatus: r.sync_status as SyncStatus,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Mark outfit as synced
 * @param outfitId - The outfit ID
 */
export async function markOutfitAsSynced(outfitId: string): Promise<void> {
  const database = await getDb();
  const now = new Date().toISOString();

  await database.runAsync(
    `UPDATE outfits SET sync_status = 'synced', updated_at = ? WHERE id = ?`,
    [now, outfitId]
  );
}

/**
 * Save outfit to local database
 * @param outfit - The outfit data to save
 * @param isLiked - Whether the outfit is liked
 * @param isFavorited - Whether the outfit is favorited
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
  const database = await getDb();
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT OR REPLACE INTO outfits
     (id, name, items_json, theory_json, style_tags_json, occasion, is_liked, is_favorited, sync_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      outfit.id,
      outfit.name,
      JSON.stringify(outfit.items),
      JSON.stringify(outfit.theory),
      JSON.stringify(outfit.styleTags),
      outfit.occasion || '',
      isLiked ? 1 : 0,
      isFavorited ? 1 : 0,
      now,
      now,
    ]
  );
}
