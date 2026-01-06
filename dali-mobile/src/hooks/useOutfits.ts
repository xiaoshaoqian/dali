/**
 * useOutfits Hook
 * React Query hooks for fetching outfit data from SQLite local storage
 *
 * @see Story 5.2: Outfit History Grid View
 */
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOutfits,
  getOutfitCount,
  getOutfitById,
} from '@/utils/storage';
import type { OutfitFilters, LocalOutfitRecord } from '@/utils/storage';

// =============================================================================
// Constants
// =============================================================================

/** Default page size for pagination */
const PAGE_SIZE = 20;

/** Default stale time (30 seconds) */
const STALE_TIME = 30 * 1000;

// =============================================================================
// Query Keys
// =============================================================================

export const outfitKeys = {
  all: ['outfits'] as const,
  local: () => [...outfitKeys.all, 'local'] as const,
  lists: () => [...outfitKeys.local(), 'list'] as const,
  list: (filters?: OutfitFilters) => [...outfitKeys.lists(), filters] as const,
  infinite: (filters?: Omit<OutfitFilters, 'limit' | 'offset'>) =>
    [...outfitKeys.local(), 'infinite', filters] as const,
  counts: () => [...outfitKeys.local(), 'count'] as const,
  count: (filters?: Omit<OutfitFilters, 'limit' | 'offset'>) =>
    [...outfitKeys.counts(), filters] as const,
  details: () => [...outfitKeys.local(), 'detail'] as const,
  detail: (id: string) => [...outfitKeys.details(), id] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook for fetching a list of outfits with optional filters
 * @param filters - Query filters (userId, occasion, isLiked, etc.)
 * @returns React Query result with outfit records
 */
export function useOutfits(filters?: OutfitFilters) {
  return useQuery({
    queryKey: outfitKeys.list(filters),
    queryFn: () => getOutfits(filters),
    staleTime: STALE_TIME,
  });
}

/**
 * Hook for fetching outfits with infinite scroll pagination
 * @param filters - Query filters (excluding limit/offset)
 * @returns React Query infinite query result
 */
export function useOutfitsInfinite(
  filters?: Omit<OutfitFilters, 'limit' | 'offset'>
) {
  return useInfiniteQuery({
    queryKey: outfitKeys.infinite(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getOutfits({
        ...filters,
        limit: PAGE_SIZE,
        offset: pageParam,
      });
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than PAGE_SIZE, no more pages
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Return next offset
      return allPages.length * PAGE_SIZE;
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Hook for fetching outfit count with optional filters
 * @param filters - Query filters (excluding limit/offset)
 * @returns React Query result with count
 */
export function useOutfitCount(
  filters?: Omit<OutfitFilters, 'limit' | 'offset'>
) {
  return useQuery({
    queryKey: outfitKeys.count(filters),
    queryFn: () => getOutfitCount(filters),
    staleTime: STALE_TIME,
  });
}

/**
 * Hook for fetching a single outfit by ID
 * @param outfitId - The outfit ID
 * @returns React Query result with outfit record
 */
export function useOutfit(outfitId: string) {
  return useQuery({
    queryKey: outfitKeys.detail(outfitId),
    queryFn: () => getOutfitById(outfitId),
    staleTime: STALE_TIME,
    enabled: !!outfitId,
  });
}

/**
 * Hook for invalidating outfit queries (useful after mutations)
 * @returns Function to invalidate outfit queries
 */
export function useInvalidateOutfits() {
  const queryClient = useQueryClient();

  return {
    /** Invalidate all outfit queries */
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: outfitKeys.all }),
    /** Invalidate list queries only */
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: outfitKeys.lists() }),
    /** Invalidate count queries only */
    invalidateCounts: () => queryClient.invalidateQueries({ queryKey: outfitKeys.counts() }),
    /** Invalidate a specific outfit detail */
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: outfitKeys.detail(id) }),
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format timestamp to relative date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative date (e.g., "今天", "昨天", "3天前", "1月15日")
 */
export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const day = 24 * 60 * 60 * 1000;

  if (diff < day) {
    return '今天';
  }
  if (diff < 2 * day) {
    return '昨天';
  }
  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  }

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * Get flattened outfit list from infinite query pages
 * @param pages - Array of outfit pages from useInfiniteQuery
 * @returns Flattened array of outfit records
 */
export function flattenOutfitPages(
  pages?: LocalOutfitRecord[][]
): LocalOutfitRecord[] {
  if (!pages) return [];
  return pages.flat();
}
