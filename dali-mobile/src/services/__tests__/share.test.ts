/**
 * Share Service Tests
 *
 * @module services/__tests__/share.test
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';

import {
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
} from '../share';
import { apiClient } from '../apiClient';

// Mock dependencies
jest.mock('expo-file-system');
jest.mock('expo-media-library');
jest.mock('expo-haptics');
jest.mock('expo-sharing');
jest.mock('../apiClient');

// Import expo-sharing after mock
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockMediaLibrary = MediaLibrary as jest.Mocked<typeof MediaLibrary>;
const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSharing = Sharing as jest.Mocked<typeof Sharing>;

// Mock Linking using spyOn to avoid TurboModuleRegistry issues
const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();
jest.spyOn(Linking, 'canOpenURL').mockImplementation(mockCanOpenURL);
jest.spyOn(Linking, 'openURL').mockImplementation(mockOpenURL);

describe('Share Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestMediaLibraryPermissions', () => {
    it('should return granted true when permission is granted', async () => {
      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      } as MediaLibrary.PermissionResponse);

      const result = await requestMediaLibraryPermissions();

      expect(result.granted).toBe(true);
      expect(result.canAskAgain).toBe(true);
      expect(mockMediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return granted false when permission is denied', async () => {
      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
        expires: 'never',
      } as MediaLibrary.PermissionResponse);

      const result = await requestMediaLibraryPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockMediaLibrary.requestPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await requestMediaLibraryPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });
  });

  describe('checkMediaLibraryPermissions', () => {
    it('should return current permission status', async () => {
      mockMediaLibrary.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      } as MediaLibrary.PermissionResponse);

      const result = await checkMediaLibraryPermissions();

      expect(result.granted).toBe(true);
      expect(mockMediaLibrary.getPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('saveImageToGallery', () => {
    const testImageUri = 'file:///test/image.png';

    it('should save image and trigger success haptic when permission granted', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: testImageUri,
        isDirectory: false,
      });
      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      } as MediaLibrary.PermissionResponse);
      mockMediaLibrary.saveToLibraryAsync.mockResolvedValue();
      mockHaptics.notificationAsync.mockResolvedValue();

      const result = await saveImageToGallery(testImageUri);

      expect(result.success).toBe(true);
      expect(mockMediaLibrary.saveToLibraryAsync).toHaveBeenCalledWith(testImageUri);
      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should return permission_denied error when permission not granted', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: testImageUri,
        isDirectory: false,
      });
      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
        expires: 'never',
      } as MediaLibrary.PermissionResponse);

      const result = await saveImageToGallery(testImageUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('permission_denied');
      expect(mockMediaLibrary.saveToLibraryAsync).not.toHaveBeenCalled();
    });

    it('should return file_not_found error when file does not exist', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        uri: testImageUri,
        isDirectory: false,
      });

      const result = await saveImageToGallery(testImageUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('file_not_found');
    });

    it('should return save_failed error and trigger error haptic on exception', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: testImageUri,
        isDirectory: false,
      });
      mockMediaLibrary.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      } as MediaLibrary.PermissionResponse);
      mockMediaLibrary.saveToLibraryAsync.mockRejectedValue(new Error('Save failed'));
      mockHaptics.notificationAsync.mockResolvedValue();

      const result = await saveImageToGallery(testImageUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('save_failed');
      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });
  });

  describe('getFileSize', () => {
    it('should return file size when file exists', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: 'file:///test.png',
        isDirectory: false,
        size: 1024000,
      });

      const size = await getFileSize('file:///test.png');

      expect(size).toBe(1024000);
    });

    it('should return null when file does not exist', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        uri: 'file:///test.png',
        isDirectory: false,
      });

      const size = await getFileSize('file:///test.png');

      expect(size).toBeNull();
    });

    it('should return null on error', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('IO error'));

      const size = await getFileSize('file:///test.png');

      expect(size).toBeNull();
    });
  });

  describe('exceedsFileSizeLimit', () => {
    it('should return true when file exceeds 2MB limit', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: 'file:///test.png',
        isDirectory: false,
        size: 3 * 1024 * 1024, // 3MB
      });

      const exceeds = await exceedsFileSizeLimit('file:///test.png');

      expect(exceeds).toBe(true);
    });

    it('should return false when file is under 2MB limit', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: 'file:///test.png',
        isDirectory: false,
        size: 1.5 * 1024 * 1024, // 1.5MB
      });

      const exceeds = await exceedsFileSizeLimit('file:///test.png');

      expect(exceeds).toBe(false);
    });

    it('should return false when file size cannot be determined', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        uri: 'file:///test.png',
        isDirectory: false,
      });

      const exceeds = await exceedsFileSizeLimit('file:///test.png');

      expect(exceeds).toBe(false);
    });
  });

  describe('ensureFileSizeLimit', () => {
    it('should return result with needsCompression false when under limit', async () => {
      const testUri = 'file:///test/small.png';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: testUri,
        isDirectory: false,
        size: 1 * 1024 * 1024, // 1MB
      });

      const result = await ensureFileSizeLimit(testUri);

      expect(result.uri).toBe(testUri);
      expect(result.needsCompression).toBe(false);
      expect(result.currentSize).toBe(1 * 1024 * 1024);
    });

    it('should return needsCompression true with warning when over limit', async () => {
      const testUri = 'file:///test/large.png';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        uri: testUri,
        isDirectory: false,
        size: 3 * 1024 * 1024, // 3MB
      });

      const result = await ensureFileSizeLimit(testUri);

      expect(result.uri).toBe(testUri);
      expect(result.needsCompression).toBe(true);
      expect(result.currentSize).toBe(3 * 1024 * 1024);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Image exceeds')
      );

      consoleSpy.mockRestore();
    });

    it('should handle null file size gracefully', async () => {
      const testUri = 'file:///test/unknown.png';
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        uri: testUri,
        isDirectory: false,
      });

      const result = await ensureFileSizeLimit(testUri);

      expect(result.uri).toBe(testUri);
      expect(result.needsCompression).toBe(false);
      expect(result.currentSize).toBeNull();
    });
  });

  describe('trackShareImageGenerated', () => {
    it('should send tracking event to backend', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackShareImageGenerated('outfit-123', 'minimal');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          event_type: 'share_image_generated',
          outfit_id: 'outfit-123',
          template_style: 'minimal',
          timestamp: expect.any(Number),
        })
      );
    });

    it('should not throw when backend call fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(trackShareImageGenerated('outfit-123', 'fashion')).resolves.not.toThrow();
    });
  });

  describe('trackSaveToGallery', () => {
    it('should send save to gallery event to backend', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackSaveToGallery('outfit-456', 'artistic');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          event_type: 'share_save_to_gallery',
          outfit_id: 'outfit-456',
          template_style: 'artistic',
        })
      );
    });
  });

  describe('trackShareCompleted', () => {
    it('should send share completed event to backend', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackShareCompleted('outfit-789', 'fashion');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          event_type: 'share_completed',
          outfit_id: 'outfit-789',
          template_style: 'fashion',
          timestamp: expect.any(Number),
        })
      );
    });

    it('should not throw when backend call fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(trackShareCompleted('outfit-789', 'minimal')).resolves.not.toThrow();
    });
  });

  describe('shareService singleton', () => {
    it('should export all functions', () => {
      expect(shareService.requestMediaLibraryPermissions).toBeDefined();
      expect(shareService.checkMediaLibraryPermissions).toBeDefined();
      expect(shareService.saveImageToGallery).toBeDefined();
      expect(shareService.getFileSize).toBeDefined();
      expect(shareService.exceedsFileSizeLimit).toBeDefined();
      expect(shareService.ensureFileSizeLimit).toBeDefined();
      expect(shareService.trackShareImageGenerated).toBeDefined();
      expect(shareService.trackSaveToGallery).toBeDefined();
      expect(shareService.trackShareCompleted).toBeDefined();
      expect(shareService.trackShareToPlatform).toBeDefined();
      expect(shareService.trackShareCancelled).toBeDefined();
      expect(shareService.shareToSystem).toBeDefined();
      expect(shareService.isSystemShareAvailable).toBeDefined();
      expect(shareService.checkWeChatInstalled).toBeDefined();
      expect(shareService.openWeChatAppStore).toBeDefined();
    });
  });

  describe('trackShareToPlatform', () => {
    it('should track wechat_session share event', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackShareToPlatform('outfit-123', 'minimal', 'wechat_session');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          event_type: 'share_completed',
          outfit_id: 'outfit-123',
          template_style: 'minimal',
          platform: 'wechat_session',
          timestamp: expect.any(Number),
        })
      );
    });

    it('should track wechat_timeline share event', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackShareToPlatform('outfit-456', 'fashion', 'wechat_timeline');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          platform: 'wechat_timeline',
        })
      );
    });

    it('should track system_share event', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackShareToPlatform('outfit-789', 'artistic', 'system_share');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          platform: 'system_share',
        })
      );
    });

    it('should fail silently on API error', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(trackShareToPlatform('outfit-123', 'minimal', 'system_share')).resolves.not.toThrow();
    });
  });

  describe('trackShareCancelled', () => {
    it('should track share cancelled event', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await trackShareCancelled('outfit-123', 'minimal');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/share/track',
        expect.objectContaining({
          event_type: 'share_cancelled',
          outfit_id: 'outfit-123',
          template_style: 'minimal',
          timestamp: expect.any(Number),
        })
      );
    });
  });

  describe('shareToSystem', () => {
    it('should return success true when sharing succeeds', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(true);
      mockSharing.shareAsync.mockResolvedValue(undefined);

      const result = await shareToSystem('file:///test/image.png');

      expect(result.success).toBe(true);
      expect(mockSharing.shareAsync).toHaveBeenCalledWith('file:///test/image.png', {
        mimeType: 'image/png',
        dialogTitle: '分享搭配',
      });
    });

    it('should return success false when sharing is not available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(false);

      const result = await shareToSystem('file:///test/image.png');

      expect(result.success).toBe(false);
      expect(mockSharing.shareAsync).not.toHaveBeenCalled();
    });

    it('should return success false on error', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(true);
      mockSharing.shareAsync.mockRejectedValue(new Error('Share failed'));

      const result = await shareToSystem('file:///test/image.png');

      expect(result.success).toBe(false);
    });
  });

  describe('isSystemShareAvailable', () => {
    it('should return true when sharing is available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(true);

      const result = await isSystemShareAvailable();

      expect(result).toBe(true);
    });

    it('should return false when sharing is not available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(false);

      const result = await isSystemShareAvailable();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockSharing.isAvailableAsync.mockRejectedValue(new Error('Error'));

      const result = await isSystemShareAvailable();

      expect(result).toBe(false);
    });
  });

  describe('checkWeChatInstalled', () => {
    it('should return true when WeChat URL can be opened', async () => {
      mockCanOpenURL.mockResolvedValue(true);

      const result = await checkWeChatInstalled();

      expect(result).toBe(true);
      expect(mockCanOpenURL).toHaveBeenCalledWith('weixin://');
    });

    it('should return false when WeChat URL cannot be opened', async () => {
      mockCanOpenURL.mockResolvedValue(false);

      const result = await checkWeChatInstalled();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockCanOpenURL.mockRejectedValue(new Error('Error'));

      const result = await checkWeChatInstalled();

      expect(result).toBe(false);
    });
  });

  describe('openWeChatAppStore', () => {
    it('should open App Store URL for WeChat', async () => {
      mockOpenURL.mockResolvedValue(undefined);

      await openWeChatAppStore();

      expect(mockOpenURL).toHaveBeenCalledWith('https://apps.apple.com/app/wechat/id414478124');
    });

    it('should not throw on error', async () => {
      mockOpenURL.mockRejectedValue(new Error('Error'));

      await expect(openWeChatAppStore()).resolves.not.toThrow();
    });
  });
});
