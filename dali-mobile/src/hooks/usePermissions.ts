/**
 * usePermissions Hook
 * Manages camera and media library permissions with friendly prompts
 */
import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Camera, PermissionStatus } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export type PermissionType = 'camera' | 'mediaLibrary';

interface PermissionState {
  camera: PermissionStatus | null;
  mediaLibrary: ImagePicker.PermissionStatus | null;
}

interface UsePermissionsReturn {
  permissions: PermissionState;
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
  checkCameraPermission: () => Promise<PermissionStatus>;
  checkMediaLibraryPermission: () => Promise<ImagePicker.PermissionStatus>;
  openSettings: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: null,
    mediaLibrary: null,
  });

  /**
   * Check camera permission status without requesting
   */
  const checkCameraPermission = useCallback(async (): Promise<PermissionStatus> => {
    const { status } = await Camera.getCameraPermissionsAsync();
    setPermissions((prev) => ({ ...prev, camera: status }));
    return status;
  }, []);

  /**
   * Check media library permission status without requesting
   */
  const checkMediaLibraryPermission = useCallback(async (): Promise<ImagePicker.PermissionStatus> => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    setPermissions((prev) => ({ ...prev, mediaLibrary: status }));
    return status;
  }, []);

  /**
   * Request camera permission with friendly explanation
   * Returns true if permission granted, false otherwise
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const currentStatus = await checkCameraPermission();

    // Already granted
    if (currentStatus === 'granted') {
      return true;
    }

    // If denied before, show settings prompt
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

    // Show friendly explanation before system prompt
    return new Promise((resolve) => {
      Alert.alert(
        '需要访问相机',
        '搭理需要使用相机拍摄你的衣服照片，以便 AI 为你生成搭配建议。',
        [
          {
            text: '暂不',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: '好的，允许',
            onPress: async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setPermissions((prev) => ({ ...prev, camera: status }));
              resolve(status === 'granted');
            },
          },
        ],
        { cancelable: false }
      );
    });
  }, [checkCameraPermission]);

  /**
   * Request media library permission with friendly explanation
   * Returns true if permission granted, false otherwise
   */
  const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const currentStatus = await checkMediaLibraryPermission();

    // Already granted
    if (currentStatus === 'granted') {
      return true;
    }

    // If denied before, show settings prompt
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

    // Show friendly explanation before system prompt
    return new Promise((resolve) => {
      Alert.alert(
        '需要访问相册',
        '搭理需要访问相册以选择你的衣服照片。',
        [
          {
            text: '取消',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: '好的，允许',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              setPermissions((prev) => ({ ...prev, mediaLibrary: status }));
              resolve(status === 'granted');
            },
          },
        ],
        { cancelable: false }
      );
    });
  }, [checkMediaLibraryPermission]);

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
    requestCameraPermission,
    requestMediaLibraryPermission,
    checkCameraPermission,
    checkMediaLibraryPermission,
    openSettings,
  };
}
