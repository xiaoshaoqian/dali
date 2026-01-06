/**
 * SQLite Storage Tests
 * @see Story 5.1: SQLite Local Storage for Outfit History
 */

import {
  initDatabase,
  closeDatabase,
  saveOutfit,
  getOutfits,
  getOutfitById,
  updateOutfit,
  deleteOutfit,
  hardDeleteOutfit,
  updateOutfitLikeStatus,
  updateOutfitSaveStatus,
  getPendingSyncOutfits,
  markOutfitAsSynced,
  getOutfitCount,
  saveOutfitToLocal,
} from './storage';
import type {
  OutfitInput,
  OutfitFilters,
  LocalOutfitRecord,
} from './storage';

// Mock expo-sqlite
const mockExecAsync = jest.fn();
const mockRunAsync = jest.fn();
const mockGetFirstAsync = jest.fn();
const mockGetAllAsync = jest.fn();
const mockCloseAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: mockExecAsync,
      runAsync: mockRunAsync,
      getFirstAsync: mockGetFirstAsync,
      getAllAsync: mockGetAllAsync,
      closeAsync: mockCloseAsync,
    })
  ),
}));

// Test data
const mockOutfitInput: OutfitInput = {
  id: 'test-outfit-1',
  name: '职场优雅风',
  items: [
    { itemType: '上装', name: '白色衬衫', color: '白色', colorHex: '#FFFFFF' },
    { itemType: '下装', name: '黑色西裤', color: '黑色', colorHex: '#000000' },
  ],
  theory: {
    colorPrinciple: '黑白配',
    styleAnalysis: '简约通勤',
  },
  styleTags: ['简约', '通勤'],
  occasion: '职场通勤',
  garmentImageUrl: 'https://example.com/garment.jpg',
};

const mockRawRow = {
  id: 'test-outfit-1',
  user_id: 'user-123',
  name: '职场优雅风',
  occasion: '职场通勤',
  garment_image_url: 'https://example.com/garment.jpg',
  items_json: JSON.stringify(mockOutfitInput.items),
  theory_json: JSON.stringify(mockOutfitInput.theory),
  style_tags_json: JSON.stringify(mockOutfitInput.styleTags),
  created_at: 1704326400000,
  updated_at: 1704326400000,
  is_liked: 0,
  is_favorited: 0,
  is_deleted: 0,
  sync_status: 'pending',
};

describe('Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset database version check
    mockGetFirstAsync.mockResolvedValue({ user_version: 2 });
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('initDatabase', () => {
    it('should initialize database and create table with v2 schema', async () => {
      await initDatabase();

      expect(mockExecAsync).toHaveBeenCalled();
      const createTableCall = mockExecAsync.mock.calls[0][0];

      // Verify v2 schema fields
      expect(createTableCall).toContain('CREATE TABLE IF NOT EXISTS outfits');
      expect(createTableCall).toContain('user_id TEXT NOT NULL');
      expect(createTableCall).toContain('garment_image_url TEXT');
      expect(createTableCall).toContain('is_deleted INTEGER');
      expect(createTableCall).toContain('created_at INTEGER');
      expect(createTableCall).toContain('updated_at INTEGER');
    });

    it('should create all required indexes', async () => {
      await initDatabase();

      const createTableCall = mockExecAsync.mock.calls[0][0];

      expect(createTableCall).toContain('idx_outfits_user_id');
      expect(createTableCall).toContain('idx_outfits_created_at');
      expect(createTableCall).toContain('idx_outfits_occasion');
      expect(createTableCall).toContain('idx_outfits_is_liked');
      expect(createTableCall).toContain('idx_outfits_is_favorited');
      expect(createTableCall).toContain('idx_outfits_is_deleted');
      expect(createTableCall).toContain('idx_outfits_sync_status');
    });

    it('should only initialize once', async () => {
      await initDatabase();
      await initDatabase();

      // openDatabaseAsync should only be called once
      const SQLite = require('expo-sqlite');
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    });

    it('should run migration when database version is less than 2', async () => {
      // Simulate v1 database (version 0)
      mockGetFirstAsync
        .mockResolvedValueOnce({ user_version: 0 }) // PRAGMA user_version
        .mockResolvedValueOnce({ name: 'outfits' }); // table exists check

      await initDatabase();

      // Should have called PRAGMA user_version check
      expect(mockGetFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');

      // Should have called ALTER TABLE for new columns
      const execCalls = mockExecAsync.mock.calls.map((call) => call[0]);
      const alterTableCalls = execCalls.filter((sql: string) =>
        sql.includes('ALTER TABLE')
      );

      // At least one ALTER TABLE call for migration
      expect(alterTableCalls.length).toBeGreaterThanOrEqual(1);

      // Should update version to 2
      const versionUpdateCall = execCalls.find((sql: string) =>
        sql.includes('PRAGMA user_version = 2')
      );
      expect(versionUpdateCall).toBeDefined();
    });

    it('should add user_id column during migration', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ user_version: 0 })
        .mockResolvedValueOnce({ name: 'outfits' });

      await initDatabase();

      const execCalls = mockExecAsync.mock.calls.map((call) => call[0]);
      const addUserIdCall = execCalls.find(
        (sql: string) =>
          sql.includes('ALTER TABLE') && sql.includes('user_id')
      );
      expect(addUserIdCall).toBeDefined();
    });

    it('should add garment_image_url column during migration', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ user_version: 0 })
        .mockResolvedValueOnce({ name: 'outfits' });

      await initDatabase();

      const execCalls = mockExecAsync.mock.calls.map((call) => call[0]);
      const addImageUrlCall = execCalls.find(
        (sql: string) =>
          sql.includes('ALTER TABLE') && sql.includes('garment_image_url')
      );
      expect(addImageUrlCall).toBeDefined();
    });

    it('should add is_deleted column during migration', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ user_version: 0 })
        .mockResolvedValueOnce({ name: 'outfits' });

      await initDatabase();

      const execCalls = mockExecAsync.mock.calls.map((call) => call[0]);
      const addIsDeletedCall = execCalls.find(
        (sql: string) =>
          sql.includes('ALTER TABLE') && sql.includes('is_deleted')
      );
      expect(addIsDeletedCall).toBeDefined();
    });

    it('should create new indexes during migration', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ user_version: 0 })
        .mockResolvedValueOnce({ name: 'outfits' });

      await initDatabase();

      const execCalls = mockExecAsync.mock.calls.map((call) => call[0]);
      const createIndexCall = execCalls.find(
        (sql: string) =>
          sql.includes('CREATE INDEX IF NOT EXISTS idx_outfits_user_id')
      );
      expect(createIndexCall).toBeDefined();
    });

    it('should skip migration if database version is already 2', async () => {
      mockGetFirstAsync.mockResolvedValue({ user_version: 2 });

      await initDatabase();

      // Should not have ALTER TABLE calls (only CREATE TABLE)
      const execCalls = mockExecAsync.mock.calls.map((call) => call[0]);
      const alterTableCalls = execCalls.filter(
        (sql: string) => sql.includes('ALTER TABLE') && !sql.includes('CREATE')
      );

      // No ALTER TABLE calls when already at v2
      expect(alterTableCalls).toHaveLength(0);
    });
  });

  describe('saveOutfit', () => {
    it('should save outfit with all fields', async () => {
      await initDatabase();
      await saveOutfit(mockOutfitInput, 'user-123', false, false);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO outfits'),
        expect.arrayContaining([
          'test-outfit-1',
          'user-123',
          '职场优雅风',
          '职场通勤',
          'https://example.com/garment.jpg',
        ])
      );
    });

    it('should use ON CONFLICT to preserve created_at on re-save', async () => {
      await initDatabase();
      await saveOutfit(mockOutfitInput, 'user-123');

      const [query] = mockRunAsync.mock.calls[0];
      expect(query).toContain('ON CONFLICT(id) DO UPDATE SET');
      // Should NOT update created_at in ON CONFLICT clause
      expect(query).not.toMatch(/ON CONFLICT.*created_at/s);
    });

    it('should set sync_status to pending on save', async () => {
      await initDatabase();
      await saveOutfit(mockOutfitInput, 'user-123');

      const [query] = mockRunAsync.mock.calls[0];
      expect(query).toContain("'pending'");
    });

    it('should handle missing optional fields', async () => {
      await initDatabase();
      const minimalOutfit: OutfitInput = {
        id: 'minimal-1',
        name: 'Test',
        items: [],
        theory: {},
        styleTags: [],
      };

      await saveOutfit(minimalOutfit, 'user-123');

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['minimal-1', 'user-123', 'Test', ''])
      );
    });

    it('should throw error if outfit.id is empty', async () => {
      await initDatabase();
      const invalidOutfit: OutfitInput = {
        id: '',
        name: 'Test',
        items: [],
        theory: {},
        styleTags: [],
      };

      await expect(saveOutfit(invalidOutfit, 'user-123')).rejects.toThrow(
        'Outfit id and name are required'
      );
    });

    it('should throw error if outfit.name is empty', async () => {
      await initDatabase();
      const invalidOutfit: OutfitInput = {
        id: 'test-1',
        name: '',
        items: [],
        theory: {},
        styleTags: [],
      };

      await expect(saveOutfit(invalidOutfit, 'user-123')).rejects.toThrow(
        'Outfit id and name are required'
      );
    });
  });

  describe('getOutfits', () => {
    it('should return mapped outfit records', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([mockRawRow]);

      const results = await getOutfits();

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        id: 'test-outfit-1',
        userId: 'user-123',
        name: '职场优雅风',
        occasion: '职场通勤',
        garmentImageUrl: 'https://example.com/garment.jpg',
        itemsJson: mockRawRow.items_json,
        theoryJson: mockRawRow.theory_json,
        styleTagsJson: mockRawRow.style_tags_json,
        createdAt: 1704326400000,
        updatedAt: 1704326400000,
        isLiked: false,
        isFavorited: false,
        isDeleted: false,
        syncStatus: 'pending',
      });
    });

    it('should exclude deleted records by default', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits();

      const [query] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('is_deleted = 0');
    });

    it('should include deleted records when includeDeleted is true', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({ includeDeleted: true });

      const [query] = mockGetAllAsync.mock.calls[0];
      expect(query).not.toContain('is_deleted = 0');
    });

    it('should filter by userId', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({ userId: 'user-123' });

      const [query, params] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('user_id = ?');
      expect(params).toContain('user-123');
    });

    it('should filter by occasion', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({ occasion: '职场通勤' });

      const [query, params] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('occasion = ?');
      expect(params).toContain('职场通勤');
    });

    it('should filter by isLiked', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({ isLiked: true });

      const [query, params] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('is_liked = ?');
      expect(params).toContain(1);
    });

    it('should filter by isFavorited', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({ isFavorited: true });

      const [query, params] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('is_favorited = ?');
      expect(params).toContain(1);
    });

    it('should filter by date range', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      const startDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const endDate = Date.now();

      await getOutfits({ startDate, endDate });

      const [query, params] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('created_at >= ?');
      expect(query).toContain('created_at <= ?');
      expect(params).toContain(startDate);
      expect(params).toContain(endDate);
    });

    it('should use default limit of 50', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits();

      const [query, params] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('LIMIT ? OFFSET ?');
      expect(params).toContain(50);
      expect(params).toContain(0);
    });

    it('should support custom limit and offset', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({ limit: 20, offset: 40 });

      const [, params] = mockGetAllAsync.mock.calls[0];
      expect(params).toContain(20);
      expect(params).toContain(40);
    });

    it('should order by created_at DESC', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits();

      const [query] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('ORDER BY created_at DESC');
    });

    it('should combine multiple filters', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getOutfits({
        userId: 'user-123',
        occasion: '职场通勤',
        isLiked: true,
        isFavorited: true,
      });

      const [query] = mockGetAllAsync.mock.calls[0];
      expect(query).toContain('user_id = ?');
      expect(query).toContain('occasion = ?');
      expect(query).toContain('is_liked = ?');
      expect(query).toContain('is_favorited = ?');
    });
  });

  describe('getOutfitById', () => {
    it('should return outfit by ID', async () => {
      await initDatabase();
      mockGetFirstAsync.mockResolvedValue(mockRawRow);

      const result = await getOutfitById('test-outfit-1');

      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM outfits WHERE id = ?',
        ['test-outfit-1']
      );
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-outfit-1');
    });

    it('should return null if outfit not found', async () => {
      await initDatabase();
      mockGetFirstAsync.mockResolvedValue(null);

      const result = await getOutfitById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateOutfit', () => {
    it('should update outfit fields', async () => {
      await initDatabase();

      await updateOutfit('test-outfit-1', {
        name: '更新的名称',
        isLiked: true,
      });

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('UPDATE outfits SET');
      expect(query).toContain('name = ?');
      expect(query).toContain('is_liked = ?');
      expect(params).toContain('更新的名称');
      expect(params).toContain(1);
    });

    it('should set sync_status to pending on update', async () => {
      await initDatabase();

      await updateOutfit('test-outfit-1', { name: '新名称' });

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('sync_status = ?');
      expect(params).toContain('pending');
    });

    it('should update timestamp on every update', async () => {
      await initDatabase();

      await updateOutfit('test-outfit-1', { name: '新名称' });

      const [query] = mockRunAsync.mock.calls[0];
      expect(query).toContain('updated_at = ?');
    });

    it('should allow explicit sync_status update', async () => {
      await initDatabase();

      await updateOutfit('test-outfit-1', { syncStatus: 'synced' });

      const [, params] = mockRunAsync.mock.calls[0];
      expect(params).toContain('synced');
    });
  });

  describe('deleteOutfit (soft delete)', () => {
    it('should set is_deleted to 1', async () => {
      await initDatabase();

      await deleteOutfit('test-outfit-1');

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('is_deleted = ?');
      expect(params).toContain(1);
    });

    it('should set sync_status to pending', async () => {
      await initDatabase();

      await deleteOutfit('test-outfit-1');

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('sync_status = ?');
      expect(params).toContain('pending');
    });
  });

  describe('hardDeleteOutfit', () => {
    it('should permanently delete outfit', async () => {
      await initDatabase();

      await hardDeleteOutfit('test-outfit-1');

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM outfits WHERE id = ?',
        ['test-outfit-1']
      );
    });
  });

  describe('updateOutfitLikeStatus', () => {
    it('should update is_liked field', async () => {
      await initDatabase();

      await updateOutfitLikeStatus('test-outfit-1', true);

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('is_liked = ?');
      expect(params).toContain(1);
    });
  });

  describe('updateOutfitSaveStatus', () => {
    it('should update is_favorited field', async () => {
      await initDatabase();

      await updateOutfitSaveStatus('test-outfit-1', true);

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('is_favorited = ?');
      expect(params).toContain(1);
    });
  });

  describe('getPendingSyncOutfits', () => {
    it('should return only pending sync outfits using direct SQL query', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([
        { ...mockRawRow, sync_status: 'pending' },
      ]);

      const results = await getPendingSyncOutfits();

      // Verify direct SQL query is used (not filtering in JS)
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("sync_status = 'pending'"),
      );
      expect(results).toHaveLength(1);
      expect(results[0].syncStatus).toBe('pending');
    });

    it('should include deleted outfits with pending status', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([
        { ...mockRawRow, is_deleted: 1, sync_status: 'pending' },
      ]);

      const results = await getPendingSyncOutfits();

      expect(results).toHaveLength(1);
      expect(results[0].isDeleted).toBe(true);
    });

    it('should order by updated_at DESC', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getPendingSyncOutfits();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY updated_at DESC'),
      );
    });

    it('should limit results to 1000', async () => {
      await initDatabase();
      mockGetAllAsync.mockResolvedValue([]);

      await getPendingSyncOutfits();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 1000'),
      );
    });
  });

  describe('markOutfitAsSynced', () => {
    it('should set sync_status to synced', async () => {
      await initDatabase();

      await markOutfitAsSynced('test-outfit-1');

      const [query, params] = mockRunAsync.mock.calls[0];
      expect(query).toContain('sync_status = ?');
      expect(params).toContain('synced');
    });
  });

  describe('getOutfitCount', () => {
    it('should return count of outfits', async () => {
      await initDatabase();
      mockGetFirstAsync.mockResolvedValue({ count: 42 });

      const count = await getOutfitCount();

      expect(count).toBe(42);
    });

    it('should apply filters to count query', async () => {
      await initDatabase();
      mockGetFirstAsync.mockResolvedValue({ count: 10 });

      await getOutfitCount({ occasion: '职场通勤', isLiked: true });

      // Find the COUNT query call (skip PRAGMA calls)
      const countCall = mockGetFirstAsync.mock.calls.find(
        (call) => call[0].includes('COUNT')
      );
      expect(countCall).toBeDefined();
      const [query, params] = countCall!;
      expect(query).toContain('COUNT(*)');
      expect(query).toContain('occasion = ?');
      expect(query).toContain('is_liked = ?');
      expect(params).toContain('职场通勤');
    });

    it('should return 0 when no results', async () => {
      await initDatabase();
      mockGetFirstAsync.mockResolvedValue(null);

      const count = await getOutfitCount();

      expect(count).toBe(0);
    });
  });

  describe('saveOutfitToLocal (legacy)', () => {
    it('should call saveOutfit with empty userId', async () => {
      await initDatabase();

      await saveOutfitToLocal(mockOutfitInput, true, false);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO outfits'),
        expect.arrayContaining(['test-outfit-1', ''])
      );
    });
  });

  describe('closeDatabase', () => {
    it('should close database connection', async () => {
      await initDatabase();
      await closeDatabase();

      expect(mockCloseAsync).toHaveBeenCalled();
    });

    it('should handle multiple close calls gracefully', async () => {
      await initDatabase();
      await closeDatabase();
      await closeDatabase();

      expect(mockCloseAsync).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Type exports', () => {
  it('should export OutfitFilters type', () => {
    const filters: OutfitFilters = {
      userId: 'test',
      occasion: '职场通勤',
      isLiked: true,
      isFavorited: false,
      startDate: Date.now(),
      endDate: Date.now(),
      limit: 20,
      offset: 0,
      includeDeleted: false,
    };
    expect(filters).toBeDefined();
  });

  it('should export LocalOutfitRecord type', () => {
    const record: LocalOutfitRecord = {
      id: 'test',
      userId: 'user',
      name: 'Test',
      occasion: 'test',
      garmentImageUrl: null,
      itemsJson: '[]',
      theoryJson: '{}',
      styleTagsJson: '[]',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isLiked: false,
      isFavorited: false,
      isDeleted: false,
      syncStatus: 'pending',
    };
    expect(record).toBeDefined();
  });
});
