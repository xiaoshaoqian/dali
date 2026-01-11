/**
 * usePermissions Hook Tests
 * Tests for permission management with friendly prompts
 *
 * @see Story 8.1: Permission Manager with Friendly Prompts
 * @see AC#1-#5: Camera and Media Library Permissions
 * @see AC#6-#8: Location Permission
 * @see AC#9-#10: Push Notification Permission
 * @see AC#11: Permission State Persistence
 */
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { Camera, PermissionStatus } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock permissionStore
const mockShouldShowRequest = jest.fn().mockReturnValue(true);
const mockIncrementRequestCount = jest.fn();
const mockSetStatus = jest.fn();
const mockSetPushToken = jest.fn();

jest.mock('@/stores/permissionStore', () => ({
  usePermissionStore: () => ({
    shouldShowRequest: mockShouldShowRequest,
    incrementRequestCount: mockIncrementRequestCount,
    setStatus: mockSetStatus,
    setPushToken: mockSetPushToken,
  }),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  getMediaLibraryPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

// Mock Alert - capture the callback for later invocation
let alertCallback: (() => void) | null = null;
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Store the primary button callback for tests to invoke
  if (buttons && buttons.length > 1) {
    alertCallback = buttons[1].onPress || null;
  }
});

import { usePermissions } from '../usePermissions';

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alertCallback = null;
    mockShouldShowRequest.mockReturnValue(true);
  });

  describe('camera permission (AC#2-#3)', () => {
    it('should return true when camera permission is already granted', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      let granted = false;
      await act(async () => {
        granted = await result.current.requestCameraPermission();
      });

      expect(granted).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith('camera', 'granted');
    });

    it('should show friendly pre-dialog before requesting permission (AC#2)', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      // Start permission request
      await act(async () => {
        const promise = result.current.requestCameraPermission();
        // Let the check permission resolve
        await Promise.resolve();
      });

      // Verify Alert was called with correct content
      expect(Alert.alert).toHaveBeenCalledWith(
        '需要访问相机',
        '搭理需要使用相机拍摄你的衣服照片，以便 AI 为你生成搭配建议。',
        expect.arrayContaining([
          expect.objectContaining({ text: '暂不' }),
          expect.objectContaining({ text: '好的，允许' }),
        ]),
        expect.any(Object)
      );
    });

    it('should show settings prompt when permission was denied (AC#3)', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const promise = result.current.requestCameraPermission();
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '需要相机权限',
        expect.stringContaining('请前往设置开启相机权限'),
        expect.arrayContaining([
          expect.objectContaining({ text: '取消' }),
          expect.objectContaining({ text: '前往设置' }),
        ]),
        expect.any(Object)
      );
    });

    it('should not show dialog when max request count reached (AC#11)', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      mockShouldShowRequest.mockReturnValue(false);

      const { result } = renderHook(() => usePermissions());

      let granted = true;
      await act(async () => {
        granted = await result.current.requestCameraPermission();
      });

      expect(granted).toBe(false);
      // Should not show Alert because max requests reached
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('media library permission (AC#4-#5)', () => {
    it('should return true when media library permission is already granted', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      let granted = false;
      await act(async () => {
        granted = await result.current.requestMediaLibraryPermission();
      });

      expect(granted).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith('mediaLibrary', 'granted');
    });

    it('should show friendly pre-dialog for media library (AC#4)', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const promise = result.current.requestMediaLibraryPermission();
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '需要访问相册',
        '搭理需要访问相册以选择你的衣服照片。',
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('should show settings prompt when media library permission denied (AC#5)', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const promise = result.current.requestMediaLibraryPermission();
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '需要相册权限',
        expect.stringContaining('请前往设置开启相册权限'),
        expect.any(Array),
        expect.any(Object)
      );
    });
  });

  describe('location permission (AC#6-#8)', () => {
    it('should return true when location permission is already granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      let granted = false;
      await act(async () => {
        granted = await result.current.requestLocationPermission();
      });

      expect(granted).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith('location', 'granted');
    });

    it('should show optional location permission dialog (AC#6)', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const promise = result.current.requestLocationPermission();
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '想获取当地天气吗？（可选）',
        expect.stringContaining('城市级别位置'),
        expect.arrayContaining([
          expect.objectContaining({ text: '暂不需要' }),
          expect.objectContaining({ text: '允许' }),
        ]),
        expect.any(Object)
      );
    });

    it('should return false gracefully when location denied (AC#8)', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePermissions());

      let granted = true;
      await act(async () => {
        granted = await result.current.requestLocationPermission();
      });

      // Should not throw, app works without location
      expect(granted).toBe(false);
      // Should not show alert when already denied
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('notification permission (AC#9-#10)', () => {
    it('should return true when notification permission is already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test-token]',
      });

      const { result } = renderHook(() => usePermissions());

      let granted = false;
      await act(async () => {
        granted = await result.current.requestNotificationPermission();
      });

      expect(granted).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith('notification', 'granted');
      expect(mockSetPushToken).toHaveBeenCalledWith('ExponentPushToken[test-token]');
    });

    it('should show notification permission dialog (AC#9)', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const promise = result.current.requestNotificationPermission();
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '想第一时间收到搭配建议吗？',
        expect.stringContaining('不会发送营销信息'),
        expect.arrayContaining([
          expect.objectContaining({ text: '暂不' }),
          expect.objectContaining({ text: '开启通知' }),
        ]),
        expect.any(Object)
      );
    });

    it('should get push token when permission already granted (AC#10)', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test-token]',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      // getPushToken should have been called
      expect(result.current.pushToken).toBe('ExponentPushToken[test-token]');
    });

    it('should return false when notification permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePermissions());

      let granted = true;
      await act(async () => {
        granted = await result.current.requestNotificationPermission();
      });

      expect(granted).toBe(false);
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('permission state (AC#11)', () => {
    it('should track permission states', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.checkCameraPermission();
        await result.current.checkMediaLibraryPermission();
      });

      expect(result.current.permissions.camera).toBe('granted');
      expect(result.current.permissions.mediaLibrary).toBe('denied');
    });

    it('should sync status to permissionStore', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.checkCameraPermission();
      });

      expect(mockSetStatus).toHaveBeenCalledWith('camera', 'granted');
    });
  });

  describe('check functions', () => {
    it('should check camera permission without requesting', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const { result } = renderHook(() => usePermissions());

      let status: PermissionStatus | undefined;
      await act(async () => {
        status = await result.current.checkCameraPermission();
      });

      expect(status).toBe('undetermined');
      expect(Camera.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should check media library permission without requesting', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePermissions());

      let status: ImagePicker.PermissionStatus | undefined;
      await act(async () => {
        status = await result.current.checkMediaLibraryPermission();
      });

      expect(status).toBe('granted');
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should check location permission without requesting', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePermissions());

      let status: Location.PermissionStatus | undefined;
      await act(async () => {
        status = await result.current.checkLocationPermission();
      });

      expect(status).toBe('denied');
      expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should check notification permission without requesting', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const { result } = renderHook(() => usePermissions());

      let status: Notifications.PermissionStatus | undefined;
      await act(async () => {
        status = await result.current.checkNotificationPermission();
      });

      expect(status).toBe('undetermined');
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });
  });
});
