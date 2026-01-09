/**
 * useUserStats Hook
 * React Query hook for fetching user statistics
 *
 * @see Story 7.1: Profile Screen with User Stats
 */
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '@/services/user';
import { userKeys } from './useUserProfile';

// =============================================================================
// Constants
// =============================================================================

/** Stale time: 5 minutes (stats refresh on manual pull-to-refresh) */
const STALE_TIME = 5 * 60 * 1000;

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook for fetching user statistics
 * Includes totalOutfits, favoriteCount, shareCount, etc
 * @returns React Query result with user stats data
 */
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: getUserStats,
    staleTime: STALE_TIME,
  });
}
