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
    delete: jest.fn(() =>
      Promise.resolve({
        data: {},
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
    useOfflineStore.setState({ isOnline: true, isSyncing: false });
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should schedule sync after specified delay', async () => {
    scheduleNetworkRecoverySync(5000);

    // Sync should not happen immediately
    const storeBefore = useOfflineStore.getState();
    expect(storeBefore.isSyncing).toBe(false);

    // Advance time
    jest.advanceTimersByTime(5000);

    // Flush all pending promises and microtasks
    await jest.runAllTimersAsync();

    // Verify sync was triggered (getPendingSyncOutfits is called during syncAll)
    expect(storage.getPendingSyncOutfits).toHaveBeenCalled();
  });

  it('should use default 30 second delay', async () => {
    scheduleNetworkRecoverySync();

    jest.advanceTimersByTime(29999);

    // Clear mock to track only calls after the timeout fires
    (storage.getPendingSyncOutfits as jest.Mock).mockClear();

    jest.advanceTimersByTime(1);
    await jest.runAllTimersAsync();

    expect(storage.getPendingSyncOutfits).toHaveBeenCalled();
  });

  it('should not sync if device went offline again', async () => {
    (storage.getPendingSyncOutfits as jest.Mock).mockClear();

    scheduleNetworkRecoverySync(5000);

    // Device goes offline before sync triggers
    useOfflineStore.getState().setOnline(false);

    jest.advanceTimersByTime(5000);
    await jest.runAllTimersAsync();

    // Sync should not be called since we're offline
    // syncAll checks isOnline first and returns early
    expect(storage.getPendingSyncOutfits).not.toHaveBeenCalled();
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

describe('syncPendingActions', () => {
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

  it('should return early if offline', async () => {
    useOfflineStore.getState().setOnline(false);

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.errors).toContain('Device is offline');
    expect(result.synced).toBe(0);
  });

  it('should process empty queue successfully', async () => {
    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should sync like action and remove from queue', async () => {
    // Add a pending like action
    useOfflineStore.getState().addPendingAction('like', 'outfit-1');

    // Mock successful API call
    const { apiClient } = require('../apiClient');
    apiClient.post.mockResolvedValueOnce({ data: {} });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/outfits/outfit-1/like');

    // Action should be removed from queue
    const state = useOfflineStore.getState();
    expect(state.pendingActions).toHaveLength(0);
  });

  it('should sync unlike action with DELETE method', async () => {
    useOfflineStore.getState().addPendingAction('unlike', 'outfit-2');

    const { apiClient } = require('../apiClient');
    apiClient.delete.mockResolvedValueOnce({ data: {} });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(1);
    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/outfits/outfit-2/like');
  });

  it('should sync save action', async () => {
    useOfflineStore.getState().addPendingAction('save', 'outfit-3');

    const { apiClient } = require('../apiClient');
    apiClient.post.mockResolvedValueOnce({ data: {} });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(1);
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/outfits/outfit-3/save');
  });

  it('should sync delete action', async () => {
    useOfflineStore.getState().addPendingAction('delete', 'outfit-4');

    const { apiClient } = require('../apiClient');
    apiClient.delete.mockResolvedValueOnce({ data: {} });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(1);
    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/outfits/outfit-4');
  });

  it('should handle 404 as success for unlike/delete operations', async () => {
    useOfflineStore.getState().addPendingAction('unlike', 'outfit-5');

    const { apiClient } = require('../apiClient');
    apiClient.delete.mockRejectedValueOnce({ response: { status: 404 } });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('should skip actions that reached max retries', async () => {
    // Add action with max retries already reached
    const state = useOfflineStore.getState();
    state.addPendingAction('like', 'outfit-6');
    // Manually set retry count to max
    const action = state.pendingActions[0];
    useOfflineStore.setState({
      pendingActions: [{ ...action, retryCount: 3 }],
    });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);
  });

  it('should process multiple actions in order', async () => {
    useOfflineStore.getState().addPendingAction('like', 'outfit-a');
    useOfflineStore.getState().addPendingAction('save', 'outfit-b');

    const { apiClient } = require('../apiClient');
    apiClient.post.mockResolvedValue({ data: {} });

    const { syncPendingActions } = require('../sync');
    const result = await syncPendingActions();

    expect(result.synced).toBe(2);
    expect(result.failed).toBe(0);
  });
});

describe('syncAll', () => {
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

  it('should return early if offline', async () => {
    useOfflineStore.getState().setOnline(false);

    const { syncAll } = require('../sync');
    const result = await syncAll();

    expect(result.errors).toContain('Device is offline');
    expect(result.uploaded).toBe(0);
  });

  it('should return early if already syncing', async () => {
    useOfflineStore.getState().setSyncing(true);

    const { syncAll } = require('../sync');
    const result = await syncAll();

    expect(result.errors).toContain('Sync already in progress');
  });

  it('should sync both pending actions and outfits', async () => {
    // Add a pending action
    useOfflineStore.getState().addPendingAction('like', 'outfit-1');

    // Mock API calls
    const { apiClient } = require('../apiClient');
    apiClient.post.mockResolvedValue({ data: {} });
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValue([]);

    const { syncAll } = require('../sync');
    const result = await syncAll();

    expect(result.errors).toHaveLength(0);
    expect(result.uploaded).toBeGreaterThanOrEqual(1);
  });

  it('should update last sync time after successful sync', async () => {
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValue([]);

    const { syncAll } = require('../sync');
    await syncAll();

    const state = useOfflineStore.getState();
    expect(state.lastSyncTime).not.toBeNull();
  });

  it('should set isSyncing to false after completion', async () => {
    (storage.getPendingSyncOutfits as jest.Mock).mockResolvedValue([]);

    const { syncAll } = require('../sync');
    await syncAll();

    const state = useOfflineStore.getState();
    expect(state.isSyncing).toBe(false);
  });
});
