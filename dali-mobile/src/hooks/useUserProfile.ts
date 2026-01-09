/**
 * useUserProfile Hook
 * React Query hook for fetching and updating user profile
 *
 * @see Story 7.1: Profile Screen with User Stats
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, uploadUserAvatar } from '@/services/user';
import type { UpdateUserProfileRequest } from '@/types/user';

// =============================================================================
// Constants
// =============================================================================

/** Stale time: 5 minutes (profile data changes infrequently) */
const STALE_TIME = 5 * 60 * 1000;

// =============================================================================
// Query Keys
// =============================================================================

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook for fetching current user profile
 * @returns React Query result with user profile data
 */
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getUserProfile,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook for updating user profile (nickname, avatar, etc)
 * @returns Mutation object with mutate function
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateUserProfileRequest) => updateUserProfile(updates),
    onSuccess: (updatedProfile) => {
      // Update profile cache
      queryClient.setQueryData(userKeys.profile(), updatedProfile);
    },
  });
}

/**
 * Hook for uploading user avatar
 * @returns Mutation object with mutate function
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => uploadUserAvatar(imageUri),
    onSuccess: (avatarUrl) => {
      // Invalidate profile to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}
