/**
 * Share Service
 *
 * Service for handling share image operations including:
 * - Saving images to device gallery
 * - File size validation and compression
 * - Backend event tracking for share analytics
 *
 * @module services/share
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

import { apiClient } from './apiClient';
import type { TemplateStyle, SharePlatform } from '@/types/share';

/**
 * Share track event payload sent to backend
 */
export interface ShareTrackEvent {
  event_type: 'share_image_generated' | 'share_completed' | 'share_save_to_gallery' | 'share_cancelled';
  outfit_id: string;
  template_style: TemplateStyle;
  platform?: SharePlatform;
  timestamp: number;
}

/**
 * Result of permission request
 */
export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Result of save to gallery operation
 */
export interface SaveToGalleryResult {
  success: boolean;
  error?: 'permission_denied' | 'save_failed' | 'file_not_found';
}

/**
 * Default maximum file size for share images (2MB)
 */
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

/**
 * Request media library permissions
 *
 * @returns Permission result with granted status and whether user can be asked again
 */
export async function requestMediaLibraryPermissions(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain ?? true,
    };
  } catch (error) {
    console.error('[ShareService] Permission request failed:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

/**
 * Check current media library permission status
 *
 * @returns Current permission status
 */
export async function checkMediaLibraryPermissions(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain ?? true,
    };
  } catch (error) {
    console.error('[ShareService] Permission check failed:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

/**
 * Save image to device gallery with haptic feedback
 *
 * Requests permissions if needed and saves the image to the device's
 * photo library. Triggers haptic feedback on success.
 *
 * @param imageUri - URI of the image to save (file:// or cache path)
 * @returns Result object with success status and optional error
 */
export async function saveImageToGallery(imageUri: string): Promise<SaveToGalleryResult> {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      console.error('[ShareService] Image file not found:', imageUri);
      return {
        success: false,
        error: 'file_not_found',
      };
    }

    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      console.warn('[ShareService] Media library permission denied');
      return {
        success: false,
        error: 'permission_denied',
      };
    }

    // Save to library
    await MediaLibrary.saveToLibraryAsync(imageUri);

    // Trigger success haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ShareService] Failed to save image to gallery:', error);

    // Trigger error haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    return {
      success: false,
      error: 'save_failed',
    };
  }
}

/**
 * Get file size information for an image
 *
 * @param imageUri - URI of the image file
 * @returns File size in bytes, or null if file doesn't exist
 */
export async function getFileSize(imageUri: string): Promise<number | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return null;
  } catch (error) {
    console.error('[ShareService] Failed to get file size:', error);
    return null;
  }
}

/**
 * Check if image file size exceeds the limit
 *
 * @param imageUri - URI of the image file
 * @param maxSizeBytes - Maximum allowed size in bytes (default 2MB)
 * @returns True if file exceeds limit, false otherwise
 */
export async function exceedsFileSizeLimit(
  imageUri: string,
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES
): Promise<boolean> {
  const size = await getFileSize(imageUri);
  if (size === null) {
    return false; // Can't determine, assume ok
  }
  return size > maxSizeBytes;
}

/**
 * Result of file size check
 */
export interface FileSizeCheckResult {
  uri: string;
  needsCompression: boolean;
  currentSize: number | null;
}

/**
 * Ensure file size is within limits
 *
 * Checks file size and returns information about whether
 * compression is needed for re-capture.
 *
 * @param imageUri - URI of the image file
 * @param maxSizeBytes - Maximum allowed size in bytes (default 2MB)
 * @returns Object with URI and compression status
 */
export async function ensureFileSizeLimit(
  imageUri: string,
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES
): Promise<FileSizeCheckResult> {
  const size = await getFileSize(imageUri);

  if (size !== null && size > maxSizeBytes) {
    console.warn(
      `[ShareService] Image exceeds ${maxSizeBytes / 1024 / 1024}MB limit. ` +
      `Current size: ${(size / 1024 / 1024).toFixed(2)}MB. ` +
      'Compression recommended - retry with quality 0.9.'
    );
    return { uri: imageUri, needsCompression: true, currentSize: size };
  }

  return { uri: imageUri, needsCompression: false, currentSize: size };
}

/**
 * Track share image generated event to backend
 *
 * Sends analytics event to /api/v1/share/track endpoint.
 * Fails silently to not interrupt user experience.
 *
 * @param outfitId - ID of the outfit being shared
 * @param templateStyle - Template style used for the share image
 */
export async function trackShareImageGenerated(
  outfitId: string,
  templateStyle: TemplateStyle
): Promise<void> {
  try {
    const event: ShareTrackEvent = {
      event_type: 'share_image_generated',
      outfit_id: outfitId,
      template_style: templateStyle,
      timestamp: Date.now(),
    };

    await apiClient.post('/api/v1/share/track', event);

    if (__DEV__) {
      console.log('[ShareService] Tracked share_image_generated event:', event);
    }
  } catch (error) {
    // Fail silently - don't interrupt user experience for analytics
    console.error('[ShareService] Failed to track share event:', error);
  }
}

/**
 * Track save to gallery event to backend
 *
 * @param outfitId - ID of the outfit saved
 * @param templateStyle - Template style used
 */
export async function trackSaveToGallery(
  outfitId: string,
  templateStyle: TemplateStyle
): Promise<void> {
  try {
    const event: ShareTrackEvent = {
      event_type: 'share_save_to_gallery',
      outfit_id: outfitId,
      template_style: templateStyle,
      timestamp: Date.now(),
    };

    await apiClient.post('/api/v1/share/track', event);

    if (__DEV__) {
      console.log('[ShareService] Tracked share_save_to_gallery event:', event);
    }
  } catch (error) {
    // Fail silently
    console.error('[ShareService] Failed to track save event:', error);
  }
}

/**
 * Track share completed event to backend
 *
 * @param outfitId - ID of the outfit shared
 * @param templateStyle - Template style used
 */
export async function trackShareCompleted(
  outfitId: string,
  templateStyle: TemplateStyle
): Promise<void> {
  try {
    const event: ShareTrackEvent = {
      event_type: 'share_completed',
      outfit_id: outfitId,
      template_style: templateStyle,
      timestamp: Date.now(),
    };

    await apiClient.post('/api/v1/share/track', event);

    if (__DEV__) {
      console.log('[ShareService] Tracked share_completed event:', event);
    }
  } catch (error) {
    // Fail silently
    console.error('[ShareService] Failed to track share completed:', error);
  }
}

/**
 * Track share to platform event with platform info
 *
 * @param outfitId - ID of the outfit shared
 * @param templateStyle - Template style used
 * @param platform - Platform shared to (wechat_session, wechat_timeline, system_share)
 */
export async function trackShareToPlatform(
  outfitId: string,
  templateStyle: TemplateStyle,
  platform: SharePlatform
): Promise<void> {
  try {
    const event: ShareTrackEvent = {
      event_type: 'share_completed',
      outfit_id: outfitId,
      template_style: templateStyle,
      platform: platform,
      timestamp: Date.now(),
    };

    await apiClient.post('/api/v1/share/track', event);

    if (__DEV__) {
      console.log('[ShareService] Tracked share to platform:', event);
    }
  } catch (error) {
    // Fail silently - don't interrupt user experience for analytics
    console.error('[ShareService] Failed to track platform share:', error);
  }
}

/**
 * Track share cancelled event
 *
 * @param outfitId - ID of the outfit
 * @param templateStyle - Template style used
 */
export async function trackShareCancelled(
  outfitId: string,
  templateStyle: TemplateStyle
): Promise<void> {
  try {
    const event: ShareTrackEvent = {
      event_type: 'share_cancelled',
      outfit_id: outfitId,
      template_style: templateStyle,
      timestamp: Date.now(),
    };

    await apiClient.post('/api/v1/share/track', event);

    if (__DEV__) {
      console.log('[ShareService] Tracked share_cancelled event:', event);
    }
  } catch (error) {
    // Fail silently
    console.error('[ShareService] Failed to track share cancelled:', error);
  }
}

/**
 * Result of system share operation
 */
export interface SystemShareResult {
  success: boolean;
  dismissed: boolean;
}

/**
 * Share image using system share sheet (expo-sharing)
 *
 * @param imageUri - URI of the image to share
 * @returns Result with success and dismissed status
 */
export async function shareToSystem(imageUri: string): Promise<SystemShareResult> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('[ShareService] System sharing not available');
      return { success: false, dismissed: false };
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: '分享搭配',
    });

    // Note: expo-sharing doesn't provide callback for success/cancel
    // We assume success if no error thrown
    return { success: true, dismissed: false };
  } catch (error) {
    console.error('[ShareService] System share failed:', error);
    return { success: false, dismissed: false };
  }
}

/**
 * Check if system sharing is available
 *
 * @returns True if sharing is available
 */
export async function isSystemShareAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch (error) {
    console.error('[ShareService] Failed to check sharing availability:', error);
    return false;
  }
}

/**
 * Check if WeChat is installed on the device
 *
 * @returns True if WeChat is installed
 */
export async function checkWeChatInstalled(): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL('weixin://');
    return canOpen;
  } catch (error) {
    console.error('[ShareService] Failed to check WeChat installation:', error);
    return false;
  }
}

/**
 * Open App Store to download WeChat
 */
export async function openWeChatAppStore(): Promise<void> {
  try {
    await Linking.openURL('https://apps.apple.com/app/wechat/id414478124');
  } catch (error) {
    console.error('[ShareService] Failed to open App Store:', error);
  }
}

/**
 * Share service singleton for easy import
 */
export const shareService = {
  requestMediaLibraryPermissions,
  checkMediaLibraryPermissions,
  saveImageToGallery,
  getFileSize,
  exceedsFileSizeLimit,
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
};

export default shareService;
