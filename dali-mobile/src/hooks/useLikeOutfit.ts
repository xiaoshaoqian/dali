/**
 * useLikeOutfit Hook
 * React Query mutation hook for liking/unliking outfits with optimistic updates
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 * @see Story 8.2: AC#6 - Offline Like/Favorite Operations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { outfitService } from '@/services';
import { useOfflineStore } from '@/stores';
import { updateOutfitLikeStatus } from '@/utils';

interface UseLikeOutfitOptions {
  /** Callback when like succeeds */
  onSuccess?: (isLiked: boolean) => void;
  /** Callback when like fails */
  onError?: (error: Error) => void;
  /** Callback when action is queued offline (AC#6: shows "已离线保存，稍后同步") */
  onOfflineQueued?: () => void;
}

interface LikeMutationContext {
  previousIsLiked: boolean;
}

/**
 * Hook for liking/unliking outfits with optimistic updates and offline support
 *
 * @param outfitId - The outfit ID to like/unlike
 * @param initialIsLiked - Initial like state
 * @param options - Optional callbacks
 * @returns Mutation object with like/unlike functionality
 */
export function useLikeOutfit(
  outfitId: string,
  initialIsLiked: boolean,
  options?: UseLikeOutfitOptions
) {
  const queryClient = useQueryClient();
  const { isOnline, addPendingAction } = useOfflineStore();

  const mutation = useMutation<
    { isLiked: boolean },
    Error,
    boolean,
    LikeMutationContext
  >({
    mutationFn: async (newIsLiked: boolean) => {
      // Update local SQLite first (optimistic)
      await updateOutfitLikeStatus(outfitId, newIsLiked);

      if (!isOnline) {
        // Queue for later sync
        addPendingAction(newIsLiked ? 'like' : 'unlike', outfitId);
        // Notify caller for toast display (AC#6)
        options?.onOfflineQueued?.();
        return { isLiked: newIsLiked };
      }

      // Make API call
      if (newIsLiked) {
        return outfitService.likeOutfit(outfitId);
      } else {
        return outfitService.unlikeOutfit(outfitId);
      }
    },

    onMutate: async (newIsLiked) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['outfits', outfitId] });

      // Save previous state for rollback
      return { previousIsLiked: !newIsLiked };
    },

    onError: (error, _newIsLiked, context) => {
      // Rollback on error
      if (context) {
        updateOutfitLikeStatus(outfitId, context.previousIsLiked);
      }
      options?.onError?.(error);
    },

    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      options?.onSuccess?.(data.isLiked);
    },
  });

  return {
    toggleLike: (currentIsLiked: boolean) => mutation.mutate(!currentIsLiked),
    like: () => mutation.mutate(true),
    unlike: () => mutation.mutate(false),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
