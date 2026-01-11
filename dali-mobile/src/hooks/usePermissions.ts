/**
 * usePermissions Hook
 * Manages camera, media library, location, and notification permissions with friendly prompts
 *
 * @see Story 8.1: Permission Manager with Friendly Prompts
 * @see AC#1: Just-in-Time Permission Model
 * @see AC#2-#3: Camera Permission with Pre-Dialog and Fallback
 * @see AC#4-#5: Photo Library Permission
 * @see AC#6-#8: Location Permission (Optional)
 * @see AC#9-#10: Push Notification Permission
 * @see AC#11: Permission State Persistence
 */
import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Camera, PermissionStatus } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { usePermissionStore, PermissionType as StorePermissionType } from '@/stores/permissionStore';

// =============================================================================
// Types
// =============================================================================

export type PermissionType = 'camera' | 'mediaLibrary' | 'location' | 'notification';

interface PermissionState {
  camera: PermissionStatus | null;
  mediaLibrary: ImagePicker.PermissionStatus | null;
  location: Location.PermissionStatus | null;
  notification: Notifications.PermissionStatus | null;
}

interface UsePermissionsReturn {
  /** Current permission states */
  permissions: PermissionState;
  /** Push token for notifications (null if not available) */
  pushToken: string | null;

  // Request functions (show friendly dialog first)
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;

  // Check functions (no dialog, just check status)
  checkCameraPermission: () => Promise<PermissionStatus>;
  checkMediaLibraryPermission: () => Promise<ImagePicker.PermissionStatus>;
  checkLocationPermission: () => Promise<Location.PermissionStatus>;
  checkNotificationPermission: () => Promise<Notifications.PermissionStatus>;

  // Utility
  openSettings: () => Promise<void>;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert expo permission status to store status format
 */
function toStoreStatus(status: string): 'undetermined' | 'granted' | 'denied' {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: null,
    mediaLibrary: null,
    location: null,
    notification: null,
  });
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Get store functions for persistence (AC#11)
  const {
    shouldShowRequest,
    incrementRequestCount,
    setStatus: setStoreStatus,
    setPushToken: setStorePushToken,
  } = usePermissionStore();

  // ===========================================================================
  // Check Functions (no dialog, just check status)
  // ===========================================================================

  /**
   * Check camera permission status without requesting
   */
  const checkCameraPermission = useCallback(async (): Promise<PermissionStatus> => {
    const { status } = await Camera.getCameraPermissionsAsync();
    setPermissions((prev) => ({ ...prev, camera: status }));
    setStoreStatus('camera', toStoreStatus(status));
    return status;
  }, [setStoreStatus]);

  /**
   * Check media library permission status without requesting
   */
  const checkMediaLibraryPermission = useCallback(async (): Promise<ImagePicker.PermissionStatus> => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    setPermissions((prev) => ({ ...prev, mediaLibrary: status }));
    setStoreStatus('mediaLibrary', toStoreStatus(status));
    return status;
  }, [setStoreStatus]);

  /**
   * Check location permission status without requesting
   */
  const checkLocationPermission = useCallback(async (): Promise<Location.PermissionStatus> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissions((prev) => ({ ...prev, location: status }));
    setStoreStatus('location', toStoreStatus(status));
    return status;
  }, [setStoreStatus]);

  /**
   * Check notification permission status without requesting
   */
  const checkNotificationPermission = useCallback(async (): Promise<Notifications.PermissionStatus> => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissions((prev) => ({ ...prev, notification: status }));
    setStoreStatus('notification', toStoreStatus(status));
    return status;
  }, [setStoreStatus]);

  // ===========================================================================
  // Request Functions (with friendly pre-dialog)
  // ===========================================================================

  /**
   * Request camera permission with friendly explanation (AC#2-#3)
   * Returns true if permission granted, false otherwise
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const currentStatus = await checkCameraPermission();

    // Already granted
    if (currentStatus === 'granted') {
      return true;
    }

    // If denied before, show settings prompt (AC#3)
    if (currentStatus === 'denied') {
      return new Promise((resolve) => {
        Alert.alert(
          '需要相机权限',
          '相机权限已被拒绝，请前往设置开启相机权限以拍摄衣服照片。',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: '前往设置',
              onPress: async () => {
                await openSettings();
                resolve(false);
              },
            },
          ],
          { cancelable: false }
        );
      });
    }

    // Check if we should show request (AC#11 - max 2 times)
    if (!shouldShowRequest('camera')) {
      return false;
    }

    // Show friendly explanation before system prompt (AC#2)
    return new Promise((resolve) => {
      Alert.alert(
        '需要访问相机',
        '搭理需要使用相机拍摄你的衣服照片，以便 AI 为你生成搭配建议。',
        [
          {
            text: '暂不',
            style: 'cancel',
            onPress: () => {
              incrementRequestCount('camera');
              resolve(false);
            },
          },
          {
            text: '好的，允许',
            onPress: async () => {
              incrementRequestCount('camera');
              const { status } = await Camera.requestCameraPermissionsAsync();
              setPermissions((prev) => ({ ...prev, camera: status }));
              setStoreStatus('camera', toStoreStatus(status));
              resolve(status === 'granted');
            },
          },
        ],
        { cancelable: false }
      );
    });
  }, [checkCameraPermission, shouldShowRequest, incrementRequestCount, setStoreStatus]);

  /**
   * Request media library permission with friendly explanation (AC#4-#5)
   * Returns true if permission granted, false otherwise
   */
  const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const currentStatus = await checkMediaLibraryPermission();

    // Already granted
    if (currentStatus === 'granted') {
      return true;
    }

    // If denied before, show settings prompt (AC#5)
    if (currentStatus === 'denied') {
      return new Promise((resolve) => {
        Alert.alert(
          '需要相册权限',
          '相册权限已被拒绝，请前往设置开启相册权限以选择衣服照片。',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: '前往设置',
              onPress: async () => {
                await openSettings();
                resolve(false);
              },
            },
          ],
          { cancelable: false }
        );
      });
    }

    // Check if we should show request (AC#11 - max 2 times)
    if (!shouldShowRequest('mediaLibrary')) {
      return false;
    }

    // Show friendly explanation before system prompt (AC#4)
    return new Promise((resolve) => {
      Alert.alert(
        '需要访问相册',
        '搭理需要访问相册以选择你的衣服照片。',
        [
          {
            text: '取消',
            style: 'cancel',
            onPress: () => {
              incrementRequestCount('mediaLibrary');
              resolve(false);
            },
          },
          {
            text: '好的，允许',
            onPress: async () => {
              incrementRequestCount('mediaLibrary');
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              setPermissions((prev) => ({ ...prev, mediaLibrary: status }));
              setStoreStatus('mediaLibrary', toStoreStatus(status));
              resolve(status === 'granted');
            },
          },
        ],
        { cancelable: false }
      );
    });
  }, [checkMediaLibraryPermission, shouldShowRequest, incrementRequestCount, setStoreStatus]);

  /**
   * Request location permission with friendly explanation (AC#6-#8)
   * Location is OPTIONAL - app works without it
   * Returns true if permission granted, false otherwise
   */
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const currentStatus = await checkLocationPermission();

    // Already granted (AC#7)
    if (currentStatus === 'granted') {
      return true;
    }

    // If denied before, don't prompt again - location is optional (AC#8)
    if (currentStatus === 'denied') {
      return false;
    }

    // Check if we should show request (AC#11 - max 2 times)
    if (!shouldShowRequest('location')) {
      return false;
    }

    // Show friendly explanation with emphasis on "optional" (AC#6)
    return new Promise((resolve) => {
      Alert.alert(
        '想获取当地天气吗？（可选）',
        '我们会根据天气为你推荐更合适的搭配，只获取城市级别位置。',
        [
          {
            text: '暂不需要',
            style: 'cancel',
            onPress: () => {
              incrementRequestCount('location');
              resolve(false);
            },
          },
          {
            text: '允许',
            onPress: async () => {
              incrementRequestCount('location');
              const { status } = await Location.requestForegroundPermissionsAsync();
              setPermissions((prev) => ({ ...prev, location: status }));
              setStoreStatus('location', toStoreStatus(status));
              resolve(status === 'granted');
            },
          },
        ],
        { cancelable: false }
      );
    });
  }, [checkLocationPermission, shouldShowRequest, incrementRequestCount, setStoreStatus]);

  /**
   * Request notification permission with friendly explanation (AC#9-#10)
   * Returns true if permission granted, false otherwise
   */
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const currentStatus = await checkNotificationPermission();

    // Already granted - also get push token (AC#10)
    if (currentStatus === 'granted') {
      try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        setPushToken(tokenResponse.data);
        setStorePushToken(tokenResponse.data);
      } catch (error) {
        // Silently handle token retrieval errors in dev
        if (__DEV__) {
          console.warn('[usePermissions] Failed to get push token:', error);
        }
      }
      return true;
    }

    // If denied before, don't bother user again
    if (currentStatus === 'denied') {
      return false;
    }

    // Check if we should show request (AC#11 - max 2 times)
    if (!shouldShowRequest('notification')) {
      return false;
    }

    // Show friendly explanation at aha moment (AC#9)
    return new Promise((resolve) => {
      Alert.alert(
        '想第一时间收到搭配建议吗？',
        '当 AI 完成分析后，我们会通知你，不会发送营销信息。',
        [
          {
            text: '暂不',
            style: 'cancel',
            onPress: () => {
              incrementRequestCount('notification');
              resolve(false);
            },
          },
          {
            text: '开启通知',
            onPress: async () => {
              incrementRequestCount('notification');
              const { status } = await Notifications.requestPermissionsAsync();
              setPermissions((prev) => ({ ...prev, notification: status }));
              setStoreStatus('notification', toStoreStatus(status));

              // Get push token if granted (AC#10)
              if (status === 'granted') {
                try {
                  const tokenResponse = await Notifications.getExpoPushTokenAsync();
                  setPushToken(tokenResponse.data);
                  setStorePushToken(tokenResponse.data);
                } catch (error) {
                  if (__DEV__) {
                    console.warn('[usePermissions] Failed to get push token:', error);
                  }
                }
              }

              resolve(status === 'granted');
            },
          },
        ],
        { cancelable: false }
      );
    });
  }, [checkNotificationPermission, shouldShowRequest, incrementRequestCount, setStoreStatus, setStorePushToken]);

  // ===========================================================================
  // Utility Functions
  // ===========================================================================

  /**
   * Open app settings
   */
  const openSettings = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  }, []);

  return {
    permissions,
    pushToken,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestLocationPermission,
    requestNotificationPermission,
    checkCameraPermission,
    checkMediaLibraryPermission,
    checkLocationPermission,
    checkNotificationPermission,
    openSettings,
  };
}

export default usePermissions;
