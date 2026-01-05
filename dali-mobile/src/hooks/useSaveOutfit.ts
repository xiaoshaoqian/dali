/**
 * useSaveOutfit Hook
 * React Query mutation hook for saving/unsaving outfits with optimistic updates
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { outfitService } from '@/services';
import { useOfflineStore } from '@/stores';
import { updateOutfitSaveStatus } from '@/utils';

interface UseSaveOutfitOptions {
  /** Callback when save succeeds */
  onSuccess?: (isFavorited: boolean) => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

interface SaveMutationContext {
  previousIsFavorited: boolean;
}

/**
 * Hook for saving/unsaving outfits with optimistic updates and offline support
 *
 * @param outfitId - The outfit ID to save/unsave
 * @param initialIsFavorited - Initial save state
 * @param options - Optional callbacks
 * @returns Mutation object with save/unsave functionality
 */
export function useSaveOutfit(
  outfitId: string,
  initialIsFavorited: boolean,
  options?: UseSaveOutfitOptions
) {
  const queryClient = useQueryClient();
  const { isOnline, addPendingAction } = useOfflineStore();

  const mutation = useMutation<
    { isFavorited: boolean },
    Error,
    boolean,
    SaveMutationContext
  >({
    mutationFn: async (newIsFavorited: boolean) => {
      // Update local SQLite first (optimistic)
      await updateOutfitSaveStatus(outfitId, newIsFavorited);

      if (!isOnline) {
        // Queue for later sync
        addPendingAction(newIsFavorited ? 'save' : 'unsave', outfitId);
        return { isFavorited: newIsFavorited };
      }

      // Make API call
      if (newIsFavorited) {
        return outfitService.saveOutfit(outfitId);
      } else {
        return outfitService.unsaveOutfit(outfitId);
      }
    },

    onMutate: async (newIsFavorited) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['outfits', outfitId] });

      // Save previous state for rollback
      return { previousIsFavorited: !newIsFavorited };
    },

    onError: (error, _newIsFavorited, context) => {
      // Rollback on error
      if (context) {
        updateOutfitSaveStatus(outfitId, context.previousIsFavorited);
      }
      options?.onError?.(error);
    },

    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      options?.onSuccess?.(data.isFavorited);
    },
  });

  return {
    toggleSave: (currentIsFavorited: boolean) =>
      mutation.mutate(!currentIsFavorited),
    save: () => mutation.mutate(true),
    unsave: () => mutation.mutate(false),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
