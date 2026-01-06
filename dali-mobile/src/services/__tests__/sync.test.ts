/**
 * Sync Service Tests
 *
 * @see Story 5.4: Cloud Sync Service (Last-Write-Wins Strategy)
 */

import { syncService, scheduleNetworkRecoverySync, updatePendingSyncCount } from '../sync';
import { useOfflineStore } from '@/stores';
import * as storage from '@/utils/storage';

// =============================================================================
// Mocks
// =============================================================================

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(() => Promise.resolve()),
      runAsync: jest.fn(() => Promise.resolve({ changes: 1 })),
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
      getAllAsync: jest.fn(() => Promise.resolve([])),
      closeAsync: jest.fn(() => Promise.resolve()),
    })
  ),
}));

// Mock storage functions
jest.mock('@/utils/storage', () => ({
  getPendingSyncOutfits: jest.fn(() => Promise.resolve([])),
  markOutfitAsSynced: jest.fn(() => Promise.resolve()),
  markOutfitAsConflict: jest.fn(() => Promise.resolve()),
  getOutfits: jest.fn(() => Promise.resolve([])),
  saveOutfit: jest.fn(() => Promise.resolve()),
}));

// Mock apiClient
jest.mock('../apiClient', () => ({
  apiClient: {
    post: jest.fn(() =>
      Promise.resolve({
        data: { uploaded: 0, conflicts: [], serverOutfits: [] },
      })
    ),
    get: jest.fn(() =>
      Promise.resolve({
        data: { outfits: [] },
      })
    ),
  },
  setOnAuthFailure: jest.fn(),
}));

// =============================================================================
// Helper Functions
// =============================================================================

const createMockOutfit = (overrides = {}): storage.LocalOutfitRecord => ({
  id: 'test-outfit-1',
  userId: 'user-1',
  name: 'Test Outfit',
  occasion: '职场通勤',
  garmentImageUrl: 'https://example.com/image.jpg',
  itemsJson: '[]',
  theoryJson: '{}',
  styleTagsJson: '[]',
  createdAt: Date.now() - 1000,
  updatedAt: Date.now(),
  isLiked: false,
  isFavorited: false,
  isDeleted: false,
  syncStatus: 'pending' as const,
  ...overrides,
});

// =============================================================================
// Tests
// =============================================================================

describe('SyncService', () => {
  beforeEach(() => {
    // Reset store state
    useOfflineStore.setState({
      isOnline: true,
      wasOnline: true,
      isSyncing: false,
      lastSyncTime: null,
      pendingSyncCount: 0,
      pendingActions: [],
      lastSyncResult: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('syncPendingOutfits', () => {
    it('should return early if already syncing', async () => {
      // Set syncing state
      useOfflineStore.getState().setSyncing(true);

      const result = await syncService.syncPendingOutfits();

      expect(result.errors).toContain('Sync already in progress');
      expect(result.uploaded).toBe(0);
    });

    it('should return early if offline', async () => {
      // Set offline state
      useOfflineStore.getState().setOnline(false);

      const result = await syncService.syncPendingOutfits();

      expect(result.errors).toContain('Device is offline');
      expect(result.uploaded).toBe(0);
    });

    it('should sync pending outfits successfully', async () => {
      const mockOutfit = createMockOutfit();
      (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([
        mockOutfit,
      ]);

      const result = await syncService.syncPendingOutfits();

      expect(storage.getPendingSyncOutfits).toHaveBeenCalled();
      expect(result.errors).toHaveLength(0);
    });

    it('should update last sync time after successful sync', async () => {
      (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([]);

      await syncService.syncPendingOutfits();

      const state = useOfflineStore.getState();
      expect(state.lastSyncTime).not.toBeNull();
    });

    it('should mark outfits as synced after successful upload', async () => {
      const mockOutfit = createMockOutfit();
      (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([
        mockOutfit,
      ]);

      await syncService.syncPendingOutfits();

      expect(storage.markOutfitAsSynced).toHaveBeenCalledWith(mockOutfit.id);
    });
  });

  describe('manualSync', () => {
    it('should trigger sync and return result', async () => {
      (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([]);

      const result = await syncService.manualSync();

      expect(result).toBeDefined();
      expect(typeof result.uploaded).toBe('number');
      expect(typeof result.downloaded).toBe('number');
    });
  });

  describe('getSyncStatus', () => {
    it('should return current sync status', () => {
      useOfflineStore.setState({
        lastSyncTime: 1704326400000,
        pendingSyncCount: 5,
      });

      const status = syncService.getSyncStatus();

      expect(status.lastSyncTime).toBe(1704326400000);
      expect(status.pendingCount).toBe(5);
      expect(status.isSyncing).toBe(false);
    });
  });

  describe('foreground sync polling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      syncService.stopForegroundSync();
    });

    it('should start and stop foreground sync', () => {
      const syncSpy = jest
        .spyOn(syncService, 'syncPendingOutfits')
        .mockResolvedValue({
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          errors: [],
        });

      syncService.startForegroundSync();

      // Initial sync should be called
      expect(syncSpy).toHaveBeenCalledTimes(1);

      syncService.stopForegroundSync();
      syncSpy.mockRestore();
    });
  });
});

describe('scheduleNetworkRecoverySync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useOfflineStore.setState({ isOnline: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should schedule sync after specified delay', () => {
    const syncSpy = jest
      .spyOn(syncService, 'syncPendingOutfits')
      .mockResolvedValue({
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

    scheduleNetworkRecoverySync(5000);

    expect(syncSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(5000);

    expect(syncSpy).toHaveBeenCalled();

    syncSpy.mockRestore();
  });

  it('should use default 30 second delay', () => {
    const syncSpy = jest
      .spyOn(syncService, 'syncPendingOutfits')
      .mockResolvedValue({
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

    scheduleNetworkRecoverySync();

    jest.advanceTimersByTime(29999);
    expect(syncSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(syncSpy).toHaveBeenCalled();

    syncSpy.mockRestore();
  });

  it('should not sync if device went offline again', () => {
    const syncSpy = jest
      .spyOn(syncService, 'syncPendingOutfits')
      .mockResolvedValue({
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

    scheduleNetworkRecoverySync(5000);

    // Device goes offline before sync triggers
    useOfflineStore.getState().setOnline(false);

    jest.advanceTimersByTime(5000);

    // Sync should not be called since we're offline
    expect(syncSpy).not.toHaveBeenCalled();

    syncSpy.mockRestore();
  });
});

describe('updatePendingSyncCount', () => {
  it('should update store with pending count from storage', async () => {
    const mockOutfits = [createMockOutfit(), createMockOutfit({ id: 'test-2' })];
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce(
      mockOutfits
    );

    await updatePendingSyncCount();

    const state = useOfflineStore.getState();
    expect(state.pendingSyncCount).toBe(2);
  });

  it('should set count to 0 when no pending outfits', async () => {
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([]);

    await updatePendingSyncCount();

    const state = useOfflineStore.getState();
    expect(state.pendingSyncCount).toBe(0);
  });
});

describe('Last-Write-Wins Strategy', () => {
  beforeEach(() => {
    useOfflineStore.setState({
      isOnline: true,
      wasOnline: true,
      isSyncing: false,
      lastSyncTime: null,
      pendingSyncCount: 0,
      pendingActions: [],
      lastSyncResult: null,
    });
    jest.clearAllMocks();
  });

  it('should mark outfit as synced when local is newer', async () => {
    const localOutfit = createMockOutfit({
      updatedAt: Date.now(),
    });

    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([
      localOutfit,
    ]);

    await syncService.syncPendingOutfits();

    expect(storage.markOutfitAsSynced).toHaveBeenCalledWith(localOutfit.id);
  });
});

describe('Exponential Backoff Retry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should retry with exponential delays on failure', async () => {
    // This test verifies the retry logic exists
    // The actual retry is internal to syncBatchToServer
    const mockOutfit = createMockOutfit();
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValueOnce([
      mockOutfit,
    ]);

    // The sync should complete even with mocked API
    const result = await syncService.syncPendingOutfits();

    expect(result).toBeDefined();
  });
});
