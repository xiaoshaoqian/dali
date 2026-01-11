// Hooks barrel export
// Custom React hooks (useAuth, useOutfits, useOfflineSync, usePermissions)
export { useCountdown } from './useCountdown';
export { usePermissions } from './usePermissions';
export type { PermissionType } from './usePermissions';
export { useLikeOutfit } from './useLikeOutfit';
export { useSaveOutfit } from './useSaveOutfit';
export { useTheoryViewTracking, submitTheoryFeedback } from './useTheoryViewTracking';
export {
  useOutfits,
  useOutfitsInfinite,
  useOutfitCount,
  useOutfit,
  useInvalidateOutfits,
  outfitKeys,
  formatRelativeDate,
  flattenOutfitPages,
} from './useOutfits';
export {
  useNetworkSync,
  useNetworkStatus,
  useSyncStatus,
} from './useNetworkSync';
export {
  useUserProfile,
  useUpdateUserProfile,
  useUploadAvatar,
  userKeys,
} from './useUserProfile';
export { useUserStats } from './useUserStats';
export { useAIProgress } from './useAIProgress';
export type { UseAIProgressParams, UseAIProgressResult } from './useAIProgress';
export {
  usePreferences,
  useUpdatePreferences,
  usePreferencesNeedUpdate,
  transformToCloudTags,
  preferenceKeys,
} from './usePreferences';
export type { PreferencesWithInferredTags } from './usePreferences';
export {
  useOfflineMode,
  categorizeNetworkError,
} from './useOfflineMode';
export type { OfflineActionType, OfflineError } from './useOfflineMode';
