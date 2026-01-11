/**
 * useOfflineMode Hook
 * Unified hook for offline UI state management
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#1: Network State Detection
 * @see AC#9: API Request Offline Fallback
 */
import { useMemo, useCallback } from 'react';
import { useOfflineStore } from '@/stores';

// =============================================================================
// Types
// =============================================================================

/**
 * Action types that can be checked for offline availability
 */
export type OfflineActionType =
  | 'browse_history'
  | 'view_outfit'
  | 'like'
  | 'unlike'
  | 'save'
  | 'unsave'
  | 'save_to_album'
  | 'generate_outfit'
  | 'share_social'
  | 'edit_preferences';

/**
 * Categorized network error result
 */
export interface OfflineError {
  isOfflineError: boolean;
  userMessage: string;
  originalError: unknown;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Actions that work offline (local operations)
 */
const OFFLINE_ALLOWED_ACTIONS: Set<OfflineActionType> = new Set([
  'browse_history',
  'view_outfit',
  'like',
  'unlike',
  'save',
  'unsave',
  'save_to_album',
  'edit_preferences',
]);

/**
 * Network error patterns to detect
 */
const NETWORK_ERROR_PATTERNS = [
  'network error',
  'network request failed',
  'net::err_',
  'err_network',
  'err_internet_disconnected',
  'no internet',
  'offline',
];

const TIMEOUT_ERROR_PATTERNS = [
  'timeout',
  'timed out',
  'etimedout',
  'econnaborted',
];

// =============================================================================
// Hook: useOfflineMode
// =============================================================================

/**
 * Unified hook for offline UI state management
 * Provides isOffline state and helper functions
 */
export function useOfflineMode() {
  const { isOnline, wasOnline } = useOfflineStore();

  /**
   * Whether the device is currently offline
   */
  const isOffline = !isOnline;

  /**
   * Whether the device just went offline (transition detected)
   */
  const justWentOffline = useMemo(
    () => !isOnline && wasOnline,
    [isOnline, wasOnline]
  );

  /**
   * Whether the device just came back online (transition detected)
   */
  const justWentOnline = useMemo(
    () => isOnline && !wasOnline,
    [isOnline, wasOnline]
  );

  /**
   * Whether to show the offline banner
   */
  const showBanner = isOffline;

  /**
   * Check if an action can be performed offline
   */
  const canPerformAction = useCallback(
    (action: OfflineActionType): boolean => {
      if (isOnline) {
        return true; // All actions allowed when online
      }
      return OFFLINE_ALLOWED_ACTIONS.has(action);
    },
    [isOnline]
  );

  /**
   * Get user-friendly message for restricted action
   */
  const getRestrictionMessage = useCallback(
    (action: OfflineActionType): string | null => {
      if (canPerformAction(action)) {
        return null;
      }

      switch (action) {
        case 'generate_outfit':
          return '无法生成新搭配，你可以查看历史搭配或等待网络恢复';
        case 'share_social':
          return '当前离线，分享功能暂不可用';
        default:
          return '当前离线，此功能暂不可用';
      }
    },
    [canPerformAction]
  );

  return {
    isOffline,
    isOnline,
    justWentOffline,
    justWentOnline,
    showBanner,
    canPerformAction,
    getRestrictionMessage,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Categorize an error as network/offline error or other error
 * Used for API error handling
 */
export function categorizeNetworkError(error: unknown): OfflineError {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const lowerMessage = errorMessage.toLowerCase();
  const lowerCode = errorCode.toLowerCase();

  // Check for network errors
  const isNetworkError = NETWORK_ERROR_PATTERNS.some(
    (pattern) => lowerMessage.includes(pattern) || lowerCode.includes(pattern)
  );

  if (isNetworkError) {
    return {
      isOfflineError: true,
      userMessage: '当前离线，请检查网络连接',
      originalError: error,
    };
  }

  // Check for timeout errors
  const isTimeoutError = TIMEOUT_ERROR_PATTERNS.some(
    (pattern) => lowerMessage.includes(pattern) || lowerCode.includes(pattern)
  );

  if (isTimeoutError) {
    return {
      isOfflineError: true,
      userMessage: '网络连接超时，请稍后重试',
      originalError: error,
    };
  }

  // Other errors
  return {
    isOfflineError: false,
    userMessage: errorMessage,
    originalError: error,
  };
}

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
  }
  return String(error);
}

/**
 * Extract error code from Axios-like error objects
 */
function getErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.code === 'string') {
      return obj.code;
    }
  }
  return '';
}

export default useOfflineMode;
