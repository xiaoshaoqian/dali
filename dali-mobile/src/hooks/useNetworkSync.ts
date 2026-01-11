/**
 * useNetworkSync Hook
 * Monitors network status and triggers sync on network recovery
 *
 * @see Story 5.4: Cloud Sync Service (Last-Write-Wins Strategy)
 * @see NFR-U8: Network recovery sync within 30 seconds
 */

import { useEffect, useRef, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useOfflineStore } from '@/stores';
import {
  syncService,
  scheduleNetworkRecoverySync,
  updatePendingSyncCount,
  syncAll,
} from '@/services/sync';
import { AppState, AppStateStatus } from 'react-native';

// =============================================================================
// Hook: useNetworkSync
// =============================================================================

/**
 * Hook to manage network-based synchronization
 * - Monitors network state changes
 * - Triggers sync on network recovery (within 30s per NFR-U8)
 * - Manages foreground sync polling
 */
export function useNetworkSync(): {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingSyncCount: number;
  triggerSync: () => Promise<void>;
} {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    setOnline,
  } = useOfflineStore();

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const hasInitializedRef = useRef(false);

  /**
   * Handle network state changes
   */
  const handleNetworkChange = useCallback(
    (state: NetInfoState) => {
      const newOnlineStatus = state.isConnected ?? false;
      const previousOnlineStatus = useOfflineStore.getState().isOnline;

      setOnline(newOnlineStatus);

      // Detect transition from offline to online
      if (newOnlineStatus && !previousOnlineStatus) {
        console.log('[NetworkSync] Network recovered, scheduling sync');
        // Schedule sync within 30 seconds per NFR-U8
        scheduleNetworkRecoverySync(30000);
      }

      // Detect transition from online to offline
      if (!newOnlineStatus && previousOnlineStatus) {
        console.log('[NetworkSync] Network lost');
      }
    },
    [setOnline]
  );

  /**
   * Handle app state changes (foreground/background)
   */
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    const previousState = appStateRef.current;
    appStateRef.current = nextAppState;

    if (nextAppState === 'active' && previousState !== 'active') {
      // App came to foreground
      console.log('[NetworkSync] App came to foreground, starting sync polling');
      syncService.startForegroundSync();

      // Update pending count
      updatePendingSyncCount();
    } else if (nextAppState !== 'active' && previousState === 'active') {
      // App went to background
      console.log('[NetworkSync] App went to background, stopping sync polling');
      syncService.stopForegroundSync();
    }
  }, []);

  /**
   * Trigger manual sync (syncs both pending actions and outfits)
   * @see Story 8.3: AC#1, AC#2
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.log('[NetworkSync] Cannot sync while offline');
      return;
    }

    await syncAll();
    await updatePendingSyncCount();
  }, [isOnline]);

  /**
   * Initialize network monitoring
   */
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    console.log('[NetworkSync] Initializing network monitoring');

    // Subscribe to network state changes
    const unsubscribeNetInfo = NetInfo.addEventListener(handleNetworkChange);

    // Subscribe to app state changes
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Get initial network state
    NetInfo.fetch().then((state) => {
      handleNetworkChange(state);
    });

    // Start foreground sync if app is active
    if (AppState.currentState === 'active') {
      syncService.startForegroundSync();
    }

    // Initial pending count update
    updatePendingSyncCount();

    return () => {
      console.log('[NetworkSync] Cleaning up network monitoring');
      unsubscribeNetInfo();
      appStateSubscription.remove();
      syncService.stopForegroundSync();
    };
  }, [handleNetworkChange, handleAppStateChange]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    triggerSync,
  };
}

// =============================================================================
// Hook: useNetworkStatus
// =============================================================================

/**
 * Simple hook to just monitor network status
 * Use this when you don't need full sync functionality
 */
export function useNetworkStatus(): {
  isOnline: boolean;
  wasOnline: boolean;
} {
  const { isOnline, wasOnline, setOnline } = useOfflineStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [setOnline]);

  return { isOnline, wasOnline };
}

// =============================================================================
// Hook: useSyncStatus
// =============================================================================

/**
 * Hook to display sync status information
 */
export function useSyncStatus(): {
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastSyncTimeFormatted: string;
  pendingSyncCount: number;
} {
  const { isSyncing, lastSyncTime, pendingSyncCount } = useOfflineStore();

  const lastSyncTimeFormatted = formatLastSyncTime(lastSyncTime);

  return {
    isSyncing,
    lastSyncTime,
    lastSyncTimeFormatted,
    pendingSyncCount,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format last sync time as relative string
 */
function formatLastSyncTime(timestamp: number | null): string {
  if (!timestamp) {
    return '从未同步';
  }

  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes} 分钟前`;
  } else if (hours < 24) {
    return `${hours} 小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}
