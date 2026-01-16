/**
 * Camera Screen
 * Full-screen camera for capturing clothing photos
 * Part of Story 2.1: Camera Integration for Photo Capture
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, CameraType, FlashMode } from 'expo-camera';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';

import { colors } from '@/constants';
import { usePermissions } from '@/hooks';
import { photoUploadService } from '@/services';

// Camera state type
type CameraState = 'loading' | 'ready' | 'capturing' | 'preview' | 'uploading';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const { requestCameraPermission } = usePermissions();

  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Request camera permission on mount
  React.useEffect(() => {
    (async () => {
      const granted = await requestCameraPermission();
      setHasPermission(granted);
      if (granted) {
        setCameraState('ready');
      }
    })();
  }, [requestCameraPermission]);

  // Handle camera ready
  const handleCameraReady = useCallback(() => {
    setCameraState('ready');
  }, []);

  // Capture photo
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || cameraState !== 'ready') return;

    try {
      setCameraState('capturing');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setCapturedPhoto(photo.uri);
        setCameraState('preview');
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      setCameraState('ready');
      Alert.alert('拍照失败', '请重试');
    }
  }, [cameraState]);

  // Retake photo
  const handleRetake = useCallback(async () => {
    // Delete the captured photo from cache
    if (capturedPhoto) {
      try {
        await FileSystem.deleteAsync(capturedPhoto, { idempotent: true });
      } catch {
        // Ignore deletion errors
      }
    }
    setCapturedPhoto(null);
    setCameraState('ready');
  }, [capturedPhoto]);

  // Use photo - upload and navigate to occasion selector
  const handleUsePhoto = useCallback(async () => {
    if (!capturedPhoto) return;

    try {
      setCameraState('uploading');

      // Upload photo to cloud storage
      const result = await photoUploadService.uploadPhoto(capturedPhoto);

      if (result.success && result.photoUrl) {
        // Clean up local cache file
        try {
          await FileSystem.deleteAsync(capturedPhoto, { idempotent: true });
        } catch {
          // Ignore cleanup errors
        }

        console.log('[Camera] Upload successful, photoUrl:', result.photoUrl);

        // Navigate to recognition page for garment detection
        // The photoUrl is already URL-encoded by the backend
        router.replace({
          pathname: '/recognition' as never,
          params: { photoUrl: result.photoUrl },
        });
      } else {
        Alert.alert('上传失败', result.error || '请检查网络后重试');
        setCameraState('preview');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('上传失败', '请检查网络后重试');
      setCameraState('preview');
    }
  }, [capturedPhoto]);

  // Cancel and go back
  const handleCancel = useCallback(async () => {
    // Clean up captured photo if exists
    if (capturedPhoto) {
      try {
        await FileSystem.deleteAsync(capturedPhoto, { idempotent: true });
      } catch {
        // Ignore deletion errors
      }
    }
    router.back();
  }, [capturedPhoto]);

  // Toggle flash
  const handleToggleFlash = useCallback(() => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  }, []);

  // Toggle camera facing
  const handleToggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  // Permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionIconText}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>需要相机权限</Text>
          <Text style={styles.permissionDesc}>
            请在设置中开启相机权限，{'\n'}以便拍摄衣服照片
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.permissionButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state
  if (hasPermission === null || cameraState === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>正在启动相机...</Text>
      </View>
    );
  }

  // Preview captured photo
  if ((cameraState === 'preview' || cameraState === 'uploading') && capturedPhoto) {
    const isUploading = cameraState === 'uploading';

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Photo Preview */}
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />

        {/* Uploading overlay */}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.uploadingText}>正在上传...</Text>
          </View>
        )}

        {/* Overlay gradient at top */}
        <View style={[styles.topOverlay, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleRetake}
            activeOpacity={0.7}
            disabled={isUploading}
          >
            <Text style={[styles.closeButtonText, isUploading && styles.disabledText]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={[styles.previewControls, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.retakeButton, isUploading && styles.disabledButton]}
            onPress={handleRetake}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            <Text style={[styles.retakeButtonText, isUploading && styles.disabledText]}>重拍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.usePhotoButton, isUploading && styles.disabledButton]}
            onPress={handleUsePhoto}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.usePhotoButtonText}>使用照片</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={handleCameraReady}
      >
        {/* Top controls overlay */}
        <View style={[styles.topControls, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.hintText}>将衣服放在画面中央</Text>
          </View>

          <TouchableOpacity
            style={styles.topButton}
            onPress={handleToggleFlash}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>
              {flash === 'off' ? '⚡' : '⚡️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
          {/* Gallery button placeholder */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.sideButtonText}>相册</Text>
          </TouchableOpacity>

          {/* Capture button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.8}
            disabled={cameraState === 'capturing'}
          >
            <View style={styles.captureButtonInner}>
              {cameraState === 'capturing' ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <View style={styles.captureButtonDot} />
              )}
            </View>
          </TouchableOpacity>

          {/* Flip camera button */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={handleToggleFacing}
            activeOpacity={0.7}
          >
            <Text style={styles.sideButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
  },

  // Permission denied state
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionIconText: {
    fontSize: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Top controls
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  hintText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sideButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    padding: 4,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },

  // Preview state
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 16,
  },
  retakeButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  usePhotoButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usePhotoButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Uploading state
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  uploadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
