/**
 * Offline Store
 * Zustand store for managing offline state and sync queue
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 * @see Story 5.4: Cloud Sync Service
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see Story 8.3: Network Reconnection and Auto-Sync
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserPreferencesRequest } from '@/services/userPreferencesService';

// AsyncStorage key for pending actions
export const PENDING_ACTIONS_KEY = '@dali/pending_actions';

// AsyncStorage key for pending preferences
export const PENDING_PREFERENCES_KEY = '@dali/pending_preferences';

// Action types for offline queue
export type OfflineActionType = 'like' | 'unlike' | 'save' | 'unsave' | 'delete';

// Pending action structure
export interface PendingAction {
  id: string;
  type: OfflineActionType;
  outfitId: string;
  timestamp: number;
  retryCount: number;
}

// Sync result type
export interface SyncResult {
  uploaded: number;
  downloaded: number;
  conflicts: number;
  errors: string[];
}

interface OfflineState {
  /** Whether device is online */
  isOnline: boolean;
  /** Whether this was the previous online state (for detecting transitions) */
  wasOnline: boolean;
  /** Queue of pending actions to sync */
  pendingActions: PendingAction[];
  /** Whether sync is in progress */
  isSyncing: boolean;
  /** Timestamp of last successful sync */
  lastSyncTime: number | null;
  /** Number of outfits pending sync (from SQLite) */
  pendingSyncCount: number;
  /** Last sync result */
  lastSyncResult: SyncResult | null;

  /** Set online status */
  setOnline: (isOnline: boolean) => void;
  /** Add action to pending queue */
  addPendingAction: (type: OfflineActionType, outfitId: string) => void;
  /** Remove action from queue (after successful sync) */
  removePendingAction: (actionId: string) => void;
  /** Increment retry count for an action */
  incrementRetryCount: (actionId: string) => void;
  /** Set syncing status */
  setSyncing: (isSyncing: boolean) => void;
  /** Clear all pending actions */
  clearPendingActions: () => void;
  /** Get pending actions for a specific outfit */
  getPendingActionsForOutfit: (outfitId: string) => PendingAction[];
  /** Update last sync time */
  setLastSyncTime: (time: number) => void;
  /** Update pending sync count */
  setPendingSyncCount: (count: number) => void;
  /** Set last sync result */
  setLastSyncResult: (result: SyncResult | null) => void;
}

/**
 * Generate unique ID for pending actions
 */
function generateActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  wasOnline: true,
  pendingActions: [],
  isSyncing: false,
  lastSyncTime: null,
  pendingSyncCount: 0,
  lastSyncResult: null,

  setOnline: (isOnline) =>
    set((state) => ({
      wasOnline: state.isOnline,
      isOnline,
    })),

  addPendingAction: (type, outfitId) => {
    const newAction: PendingAction = {
      id: generateActionId(),
      type,
      outfitId,
      timestamp: Date.now(),
      retryCount: 0,
    };

    set((state) => {
      // Remove any existing action of same type for same outfit
      // (e.g., if user likes then unlikes, we only keep the latest)
      const filtered = state.pendingActions.filter(
        (action) => !(action.outfitId === outfitId && action.type === type)
      );

      // Also remove opposite action if exists (like cancels unlike, save cancels unsave)
      const oppositeType: Partial<Record<OfflineActionType, OfflineActionType>> = {
        like: 'unlike',
        unlike: 'like',
        save: 'unsave',
        unsave: 'save',
        // delete has no opposite
      };

      const opposite = oppositeType[type];
      const finalFiltered = opposite
        ? filtered.filter(
            (action) => !(action.outfitId === outfitId && action.type === opposite)
          )
        : filtered;

      return {
        pendingActions: [...finalFiltered, newAction],
      };
    });
  },

  removePendingAction: (actionId) => {
    set((state) => ({
      pendingActions: state.pendingActions.filter(
        (action) => action.id !== actionId
      ),
    }));
  },

  incrementRetryCount: (actionId) => {
    set((state) => ({
      pendingActions: state.pendingActions.map((action) =>
        action.id === actionId
          ? { ...action, retryCount: action.retryCount + 1 }
          : action
      ),
    }));
  },

  setSyncing: (isSyncing) => set({ isSyncing }),

  clearPendingActions: () => set({ pendingActions: [] }),

  getPendingActionsForOutfit: (outfitId) => {
    return get().pendingActions.filter((action) => action.outfitId === outfitId);
  },

  setLastSyncTime: (time) => set({ lastSyncTime: time }),

  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),

  setLastSyncResult: (result) => set({ lastSyncResult: result }),
}));

// =============================================================================
// Persistence Functions
// =============================================================================

/**
 * Load pending actions from AsyncStorage
 * Should be called on app startup
 */
export async function loadPendingActions(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    if (stored) {
      const actions = JSON.parse(stored) as PendingAction[];
      useOfflineStore.setState({ pendingActions: actions });
    }
  } catch (error) {
    console.error('[OfflineStore] Failed to load pending actions:', error);
    // Keep empty array on error
  }
}

/**
 * Persist pending actions to AsyncStorage
 * Should be called whenever pendingActions changes
 */
export async function persistPendingActions(): Promise<void> {
  try {
    const { pendingActions } = useOfflineStore.getState();
    if (pendingActions.length > 0) {
      await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
    } else {
      await AsyncStorage.removeItem(PENDING_ACTIONS_KEY);
    }
  } catch (error) {
    console.error('[OfflineStore] Failed to persist pending actions:', error);
  }
}

/**
 * Subscribe to store changes and persist automatically
 * Returns unsubscribe function
 */
export function setupPersistence(): () => void {
  return useOfflineStore.subscribe(
    (state, prevState) => {
      // Only persist when pendingActions changes
      if (state.pendingActions !== prevState.pendingActions) {
        persistPendingActions();
      }
    }
  );
}

// =============================================================================
// Pending Preferences Functions (Story 8.3: AC#6)
// =============================================================================

/**
 * Save pending preferences to AsyncStorage for offline sync
 * @see Story 8.3: AC#6 - Preferences sync on reconnection
 */
export async function savePendingPreferences(preferences: UserPreferencesRequest): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('[OfflineStore] Saved pending preferences for sync');
  } catch (error) {
    console.error('[OfflineStore] Failed to save pending preferences:', error);
  }
}

/**
 * Get pending preferences from AsyncStorage
 * @returns The pending preferences or null if none
 */
export async function getPendingPreferences(): Promise<UserPreferencesRequest | null> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored) as UserPreferencesRequest;
    }
    return null;
  } catch (error) {
    console.error('[OfflineStore] Failed to get pending preferences:', error);
    return null;
  }
}

/**
 * Clear pending preferences after successful sync
 */
export async function clearPendingPreferences(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PENDING_PREFERENCES_KEY);
    console.log('[OfflineStore] Cleared pending preferences');
  } catch (error) {
    console.error('[OfflineStore] Failed to clear pending preferences:', error);
  }
}

