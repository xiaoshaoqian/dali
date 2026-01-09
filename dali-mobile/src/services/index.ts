// Services barrel export
// API and external services (auth, outfit, upload, share, sync, context)
export { authService, isValidPhone } from './authService';
export type { TokenResponse, RefreshTokenResponse, SendSMSResponse, ApiError } from './authService';

export { apiClient } from './apiClient';

export { userPreferencesService } from './userPreferencesService';
export type { UserPreferencesRequest, UserPreferencesResponse } from './userPreferencesService';

export { getUserStats, getUserProfile, updateUserProfile, uploadUserAvatar } from './user';

export { photoUploadService } from './photoUploadService';
export type { SignedUrlResponse, UploadResult, UploadProgress } from './photoUploadService';

export { garmentService } from './garmentService';
export type { ColorInfo, GarmentAnalysisResult, GarmentAnalysisError } from './garmentService';

export { outfitService } from './outfitService';
export type {
  OutfitItem,
  OutfitTheory,
  OutfitRecommendation,
  GenerateOutfitRequest,
  GenerateOutfitResponse,
} from './outfitService';

export {
  syncService,
  scheduleNetworkRecoverySync,
  updatePendingSyncCount,
  FOREGROUND_SYNC_INTERVAL,
} from './sync';

export {
  shareService,
  saveImageToGallery,
  ensureFileSizeLimit,
  trackShareImageGenerated,
  trackSaveToGallery,
  trackShareCompleted,
  trackShareToPlatform,
  trackShareCancelled,
  shareToSystem,
  isSystemShareAvailable,
  checkWeChatInstalled,
  openWeChatAppStore,
  requestMediaLibraryPermissions,
  checkMediaLibraryPermissions,
  getFileSize,
  exceedsFileSizeLimit,
} from './share';
export type {
  ShareTrackEvent,
  PermissionResult,
  SaveToGalleryResult,
  FileSizeCheckResult,
  SystemShareResult,
} from './share';
