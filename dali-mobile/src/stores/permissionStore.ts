/**
 * Permission Store
 * Persistent state management for permission tracking
 *
 * @see Story 8.1: Permission Manager with Friendly Prompts
 * @see AC#11: Permission State Persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// Types
// =============================================================================

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export type PermissionType = 'camera' | 'mediaLibrary' | 'location' | 'notification';

interface PermissionRequestCounts {
  camera: number;
  mediaLibrary: number;
  location: number;
  notification: number;
}

interface PermissionStates {
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
  location: PermissionStatus;
  notification: PermissionStatus;
}

interface PermissionStore {
  // State
  statuses: PermissionStates;
  requestCounts: PermissionRequestCounts;
  pushToken: string | null;

  // Actions
  setStatus: (type: PermissionType, status: PermissionStatus) => void;
  incrementRequestCount: (type: PermissionType) => void;
  getRequestCount: (type: PermissionType) => number;
  shouldShowRequest: (type: PermissionType) => boolean;
  setPushToken: (token: string | null) => void;
  reset: () => void;
}

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of permission requests before stopping (AC#11) */
const MAX_REQUEST_COUNT = 2;

// =============================================================================
// Initial State
// =============================================================================

const initialState = {
  statuses: {
    camera: 'undetermined' as PermissionStatus,
    mediaLibrary: 'undetermined' as PermissionStatus,
    location: 'undetermined' as PermissionStatus,
    notification: 'undetermined' as PermissionStatus,
  },
  requestCounts: {
    camera: 0,
    mediaLibrary: 0,
    location: 0,
    notification: 0,
  },
  pushToken: null as string | null,
};

// =============================================================================
// Store Implementation
// =============================================================================

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      setStatus: (type: PermissionType, status: PermissionStatus) => {
        set((state) => ({
          statuses: {
            ...state.statuses,
            [type]: status,
          },
        }));
      },

      incrementRequestCount: (type: PermissionType) => {
        set((state) => ({
          requestCounts: {
            ...state.requestCounts,
            [type]: state.requestCounts[type] + 1,
          },
        }));
      },

      getRequestCount: (type: PermissionType) => {
        return get().requestCounts[type];
      },

      /**
       * Check if we should show permission request dialog
       * Returns false if:
       * - Permission already granted
       * - Request count >= MAX_REQUEST_COUNT (2)
       */
      shouldShowRequest: (type: PermissionType) => {
        const { statuses, requestCounts } = get();

        // Already granted - no need to request
        if (statuses[type] === 'granted') {
          return false;
        }

        // Too many requests - stop bothering user (AC#11)
        if (requestCounts[type] >= MAX_REQUEST_COUNT) {
          return false;
        }

        return true;
      },

      setPushToken: (token: string | null) => {
        set({ pushToken: token });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'dali-permission-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        statuses: state.statuses,
        requestCounts: state.requestCounts,
        pushToken: state.pushToken,
      }),
    }
  )
);

export default usePermissionStore;
