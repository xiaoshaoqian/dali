/**
 * usePreferences Hook
 * React Query hooks for user preferences management
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see Story 8.2: AC#8 - Offline Preference Editing
 * @see Story 8.3: AC#6 - Preferences Sync on Reconnection
 * @see AC#3: Preferences Data API Integration
 * @see AC#5: Preferences Save and Sync
 * @see AC#7: Preferences Affect AI Recommendations
 * @see AC#8: Multi-device Sync
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userPreferencesService } from '@/services/userPreferencesService';
import { useOfflineStore, savePendingPreferences } from '@/stores';
import type { UserPreferencesRequest, UserPreferencesResponse } from '@/services/userPreferencesService';

// =============================================================================
// Types
// =============================================================================

/** Extended preferences response with inferred tags */
export interface PreferencesWithInferredTags extends UserPreferencesResponse {
  inferredTags?: Array<{
    tag: string;
    weight: number;
  }>;
}

// =============================================================================
// Constants
// =============================================================================

/** Stale time: 5 minutes (preferences change infrequently) */
const STALE_TIME = 5 * 60 * 1000;

// =============================================================================
// Query Keys
// =============================================================================

export const preferenceKeys = {
  all: ['preferences'] as const,
  detail: () => [...preferenceKeys.all, 'detail'] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook for fetching user preferences
 * Returns preferences including AI-inferred tags
 *
 * @returns React Query result with preferences data
 */
export function usePreferences() {
  return useQuery({
    queryKey: preferenceKeys.detail(),
    queryFn: async (): Promise<PreferencesWithInferredTags | null> => {
      const response = await userPreferencesService.getPreferences();
      return response as PreferencesWithInferredTags | null;
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Hook for updating user preferences
 * Invalidates cache and triggers sync
 * Supports offline mode with queue (AC#8, Story 8.3 AC#6)
 *
 * @param options - Optional callbacks
 * @returns Mutation object with mutate function
 */
export function useUpdatePreferences(options?: {
  /** Callback when preferences saved offline */
  onOfflineQueued?: () => void;
}) {
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStore();

  return useMutation({
    mutationFn: async (preferences: UserPreferencesRequest) => {
      if (!isOnline) {
        // Save to local storage for sync when online (Story 8.3 AC#6)
        await savePendingPreferences(preferences);
        // Notify caller for toast display (AC#8)
        options?.onOfflineQueued?.();
        // Return a mock response for offline mode
        return {
          id: 'offline-pending',
          userId: 'offline',
          ...preferences,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserPreferencesResponse;
      }

      // Online - save directly to server
      return await userPreferencesService.savePreferences(preferences);
    },
    onSuccess: () => {
      // Invalidate all preference queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: preferenceKeys.all });
    },
  });
}

/**
 * Hook to check if preferences need update reminder
 * Returns true if last update was > 30 days ago
 *
 * @param updatedAt - Last update timestamp
 * @returns boolean indicating if reminder should show
 */
export function usePreferencesNeedUpdate(updatedAt?: string): boolean {
  if (!updatedAt) return false;

  const lastUpdate = new Date(updatedAt).getTime();
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  return now - lastUpdate > thirtyDaysMs;
}

/**
 * Transform preferences data to PreferenceCloud format
 *
 * @param preferences - User preferences data
 * @returns Array of tags formatted for PreferenceCloud component
 */
export function transformToCloudTags(
  preferences: PreferencesWithInferredTags | null | undefined
): Array<{ tag: string; weight: number; type: 'user' | 'inferred' }> {
  if (!preferences) return [];

  const tags: Array<{ tag: string; weight: number; type: 'user' | 'inferred' }> = [];

  // Add user-selected style preferences (weight 1.0 for user selections)
  preferences.styles?.forEach((style, index) => {
    tags.push({
      tag: style,
      weight: 1.0 - index * 0.05, // Slightly decrease weight for order
      type: 'user',
    });
  });

  // Add user-selected occasions (weight 0.9 for user selections)
  preferences.occasions?.forEach((occasion, index) => {
    tags.push({
      tag: occasion,
      weight: 0.9 - index * 0.05,
      type: 'user',
    });
  });

  // Add body type as a tag
  if (preferences.bodyType) {
    tags.push({
      tag: preferences.bodyType,
      weight: 0.85,
      type: 'user',
    });
  }

  // Add AI-inferred tags
  preferences.inferredTags?.forEach((inferred) => {
    tags.push({
      tag: inferred.tag,
      weight: inferred.weight,
      type: 'inferred',
    });
  });

  // Sort by weight descending
  return tags.sort((a, b) => b.weight - a.weight);
}
