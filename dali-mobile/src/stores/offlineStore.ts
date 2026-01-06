/**
 * Offline Store
 * Zustand store for managing offline actions queue
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */
import { create } from 'zustand';

// Action types for offline queue
export type OfflineActionType = 'like' | 'unlike' | 'save' | 'unsave';

// Pending action structure
export interface PendingAction {
  id: string;
  type: OfflineActionType;
  outfitId: string;
  timestamp: number;
  retryCount: number;
}

interface OfflineState {
  /** Whether device is online */
  isOnline: boolean;
  /** Queue of pending actions to sync */
  pendingActions: PendingAction[];
  /** Whether sync is in progress */
  isSyncing: boolean;

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
}

/**
 * Generate unique ID for pending actions
 */
function generateActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  pendingActions: [],
  isSyncing: false,

  setOnline: (isOnline) => set({ isOnline }),

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
      const oppositeType: Record<OfflineActionType, OfflineActionType> = {
        like: 'unlike',
        unlike: 'like',
        save: 'unsave',
        unsave: 'save',
      };

      const finalFiltered = filtered.filter(
        (action) =>
          !(action.outfitId === outfitId && action.type === oppositeType[type])
      );

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
}));
