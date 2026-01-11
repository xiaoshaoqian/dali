/**
 * Background Sync Service
 * Handles periodic background synchronization using expo-background-fetch
 *
 * @see Story 8.3: AC#11 - Background sync when app is suspended
 * @see NFR-U8: Network recovery sync within 30 seconds
 *
 * Note: iOS minimum interval is approximately 15 minutes
 * Android minimum interval is approximately 15 minutes as well
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useOfflineStore } from '@/stores';
import { syncAll } from './sync';

// =============================================================================
// Constants
// =============================================================================

/** Background fetch task name */
export const BACKGROUND_SYNC_TASK = 'background-sync-task';

/** Minimum interval for background fetch (15 minutes in seconds) */
const MIN_BACKGROUND_INTERVAL = 15 * 60;

// =============================================================================
// Task Definition
// =============================================================================

/**
 * Define the background sync task
 * This task runs when the app is in the background
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('[BackgroundSync] Background sync task started');

    const store = useOfflineStore.getState();

    // Check if we're online
    if (!store.isOnline) {
      console.log('[BackgroundSync] Device is offline, skipping sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Perform sync
    const result = await syncAll();

    console.log('[BackgroundSync] Background sync completed:', result);

    // Return appropriate result based on sync outcome
    if (result.uploaded > 0 || result.downloaded > 0) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    if (result.errors.length > 0) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundSync] Background sync error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Register the background sync task
 * Should be called when the app starts
 *
 * @see Story 8.3: AC#11
 */
export async function registerBackgroundSync(): Promise<boolean> {
  try {
    // Check if the task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

    if (isRegistered) {
      console.log('[BackgroundSync] Task already registered');
      return true;
    }

    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: MIN_BACKGROUND_INTERVAL,
      stopOnTerminate: false, // Continue running after app is killed (Android)
      startOnBoot: true, // Start on device boot (Android)
    });

    console.log('[BackgroundSync] Task registered successfully');
    return true;
  } catch (error) {
    console.error('[BackgroundSync] Failed to register task:', error);
    return false;
  }
}

/**
 * Unregister the background sync task
 * Should be called when user logs out or disables background sync
 */
export async function unregisterBackgroundSync(): Promise<boolean> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

    if (!isRegistered) {
      console.log('[BackgroundSync] Task not registered');
      return true;
    }

    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log('[BackgroundSync] Task unregistered successfully');
    return true;
  } catch (error) {
    console.error('[BackgroundSync] Failed to unregister task:', error);
    return false;
  }
}

/**
 * Check if background sync is registered
 */
export async function isBackgroundSyncRegistered(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  } catch (error) {
    console.error('[BackgroundSync] Failed to check task status:', error);
    return false;
  }
}

/**
 * Get the current background fetch status
 */
export async function getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
  try {
    return await BackgroundFetch.getStatusAsync();
  } catch (error) {
    console.error('[BackgroundSync] Failed to get status:', error);
    return null;
  }
}

/**
 * Check if background fetch is available on this device
 */
export function isBackgroundFetchAvailable(
  status: BackgroundFetch.BackgroundFetchStatus | null
): boolean {
  return status === BackgroundFetch.BackgroundFetchStatus.Available;
}
