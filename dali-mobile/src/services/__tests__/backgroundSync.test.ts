/**
 * Background Sync Service Tests
 *
 * @see Story 8.3: AC#11 - Background sync when app is suspended
 */

import {
  registerBackgroundSync,
  unregisterBackgroundSync,
  isBackgroundSyncRegistered,
  getBackgroundFetchStatus,
  isBackgroundFetchAvailable,
  BACKGROUND_SYNC_TASK,
} from '../backgroundSync';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(() => Promise.resolve()),
  unregisterTaskAsync: jest.fn(() => Promise.resolve()),
  getStatusAsync: jest.fn(() => Promise.resolve(1)), // Available
  BackgroundFetchResult: {
    NoData: 1,
    NewData: 2,
    Failed: 3,
  },
  BackgroundFetchStatus: {
    Denied: 0,
    Restricted: 1,
    Available: 2,
  },
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('@/stores', () => ({
  useOfflineStore: {
    getState: jest.fn(() => ({
      isOnline: true,
      isSyncing: false,
    })),
  },
}));

jest.mock('../sync', () => ({
  syncAll: jest.fn(() =>
    Promise.resolve({
      uploaded: 0,
      downloaded: 0,
      conflicts: 0,
      errors: [],
    })
  ),
}));

// =============================================================================
// Tests
// =============================================================================

describe('backgroundSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
  });

  describe('BACKGROUND_SYNC_TASK', () => {
    it('should have correct task name', () => {
      expect(BACKGROUND_SYNC_TASK).toBe('background-sync-task');
    });
  });

  describe('registerBackgroundSync', () => {
    it('should register task when not already registered', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const result = await registerBackgroundSync();

      expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(BACKGROUND_SYNC_TASK);
      expect(BackgroundFetch.registerTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_SYNC_TASK,
        expect.objectContaining({
          minimumInterval: 15 * 60,
          stopOnTerminate: false,
          startOnBoot: true,
        })
      );
      expect(result).toBe(true);
    });

    it('should return true if task already registered', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      const result = await registerBackgroundSync();

      expect(BackgroundFetch.registerTaskAsync).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(
        new Error('Registration failed')
      );

      const result = await registerBackgroundSync();

      expect(result).toBe(false);
    });
  });

  describe('unregisterBackgroundSync', () => {
    it('should unregister task when registered', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      const result = await unregisterBackgroundSync();

      expect(BackgroundFetch.unregisterTaskAsync).toHaveBeenCalledWith(BACKGROUND_SYNC_TASK);
      expect(result).toBe(true);
    });

    it('should return true if task not registered', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const result = await unregisterBackgroundSync();

      expect(BackgroundFetch.unregisterTaskAsync).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
      (BackgroundFetch.unregisterTaskAsync as jest.Mock).mockRejectedValue(
        new Error('Unregister failed')
      );

      const result = await unregisterBackgroundSync();

      expect(result).toBe(false);
    });
  });

  describe('isBackgroundSyncRegistered', () => {
    it('should return true when task is registered', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      const result = await isBackgroundSyncRegistered();

      expect(result).toBe(true);
    });

    it('should return false when task is not registered', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const result = await isBackgroundSyncRegistered();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(new Error('Check failed'));

      const result = await isBackgroundSyncRegistered();

      expect(result).toBe(false);
    });
  });

  describe('getBackgroundFetchStatus', () => {
    it('should return status from BackgroundFetch', async () => {
      (BackgroundFetch.getStatusAsync as jest.Mock).mockResolvedValue(
        BackgroundFetch.BackgroundFetchStatus.Available
      );

      const result = await getBackgroundFetchStatus();

      expect(result).toBe(BackgroundFetch.BackgroundFetchStatus.Available);
    });

    it('should return null on error', async () => {
      (BackgroundFetch.getStatusAsync as jest.Mock).mockRejectedValue(new Error('Status failed'));

      const result = await getBackgroundFetchStatus();

      expect(result).toBe(null);
    });
  });

  describe('isBackgroundFetchAvailable', () => {
    it('should return true when status is Available', () => {
      const result = isBackgroundFetchAvailable(BackgroundFetch.BackgroundFetchStatus.Available);

      expect(result).toBe(true);
    });

    it('should return false when status is Denied', () => {
      const result = isBackgroundFetchAvailable(BackgroundFetch.BackgroundFetchStatus.Denied);

      expect(result).toBe(false);
    });

    it('should return false when status is Restricted', () => {
      const result = isBackgroundFetchAvailable(BackgroundFetch.BackgroundFetchStatus.Restricted);

      expect(result).toBe(false);
    });

    it('should return false when status is null', () => {
      const result = isBackgroundFetchAvailable(null);

      expect(result).toBe(false);
    });
  });
});
