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
