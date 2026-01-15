/**
 * Album Photo Editor Screen
 * Select and edit photos from device gallery
 * Part of Story 2.2: Photo Album Selection & Editing
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';
import { usePermissions } from '@/hooks';
import { photoUploadService } from '@/services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH - 40; // 20px padding on each side

// Editor state type
type EditorState = 'selecting' | 'editing' | 'processing' | 'uploading';

export default function AlbumEditorScreen() {
  const insets = useSafeAreaInsets();
  const { requestMediaLibraryPermission } = usePermissions();

  const [editorState, setEditorState] = useState<EditorState>('selecting');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request permission and open picker on mount
  useEffect(() => {
    (async () => {
      const granted = await requestMediaLibraryPermission();
      setHasPermission(granted);
      if (granted) {
        openImagePicker();
      }
    })();
  }, [requestMediaLibraryPermission]);

  // Open image picker
  const openImagePicker = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // We'll handle editing ourselves
        quality: 0.8,
      });

      if (result.canceled) {
        router.back();
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setEditorState('editing');
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('选择照片失败', '请重试');
      router.back();
    }
  }, []);

  // Rotate image 90 degrees clockwise
  const handleRotate = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Process and save the edited image
  const handleConfirm = useCallback(async () => {
    if (!selectedImage) return;

    try {
      setEditorState('processing');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Build manipulation actions
      const actions: ImageManipulator.Action[] = [];

      // Add rotation if needed
      if (rotation !== 0) {
        actions.push({ rotate: rotation });
      }

      // Resize to reasonable size while maintaining aspect ratio
      actions.push({
        resize: { width: 1024 },
      });

      // Process the image
      const manipResult = await ImageManipulator.manipulateAsync(
        selectedImage,
        actions,
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Generate unique filename and save to cache
      const fileName = `photo_${Date.now()}.jpg`;
      const cacheUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.copyAsync({
        from: manipResult.uri,
        to: cacheUri,
      });

      // Upload to cloud storage
      setEditorState('uploading');
      const uploadResult = await photoUploadService.uploadPhoto(cacheUri);

      if (uploadResult.success && uploadResult.photoUrl) {
        // Clean up local cache files
        try {
          await FileSystem.deleteAsync(cacheUri, { idempotent: true });
          await FileSystem.deleteAsync(manipResult.uri, { idempotent: true });
        } catch {
          // Ignore cleanup errors
        }

        // Navigate to recognition page for garment detection
        router.replace({
          pathname: '/recognition' as never,
          params: { photoUrl: uploadResult.photoUrl },
        });
      } else {
        Alert.alert('上传失败', uploadResult.error || '请检查网络后重试');
        setEditorState('editing');
      }
    } catch (error) {
      console.error('Failed to process/upload image:', error);
      setEditorState('editing');
      Alert.alert('处理照片失败', '请重试');
    }
  }, [selectedImage, rotation]);

  // Cancel and go back
  const handleCancel = useCallback(async () => {
    // Clean up selected image if exists
    if (selectedImage && selectedImage.startsWith(FileSystem.cacheDirectory || '')) {
      try {
        await FileSystem.deleteAsync(selectedImage, { idempotent: true });
      } catch {
        // Ignore deletion errors
      }
    }
    router.back();
  }, [selectedImage]);

  // Reselect photo
  const handleReselect = useCallback(() => {
    setSelectedImage(null);
    setRotation(0);
    setEditorState('selecting');
    openImagePicker();
  }, [openImagePicker]);

  // Permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionIconText}>🖼️</Text>
          </View>
          <Text style={styles.permissionTitle}>需要相册权限</Text>
          <Text style={styles.permissionDesc}>
            请在设置中开启相册权限，{'\n'}以便选择衣服照片
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

  // Selecting state (showing picker)
  if (hasPermission === null || editorState === 'selecting') {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>正在打开相册...</Text>
      </View>
    );
  }

  // Processing state
  if (editorState === 'processing') {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>正在处理照片...</Text>
      </View>
    );
  }

  // Uploading state
  if (editorState === 'uploading') {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>正在上传...</Text>
      </View>
    );
  }

  // Editor state
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.headerButtonText}>取消</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>编辑照片</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleReselect}
          activeOpacity={0.7}
        >
          <Text style={styles.headerButtonText}>重选</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={[
              styles.previewImage,
              { transform: [{ rotate: `${rotation}deg` }] },
            ]}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Edit Controls */}
      <View style={styles.editControls}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleRotate}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonIcon}>↻</Text>
          <Text style={styles.editButtonText}>旋转</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>完成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Image container
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
  },

  // Edit controls
  editControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 32,
  },
  editButton: {
    alignItems: 'center',
    gap: 8,
  },
  editButtonIcon: {
    fontSize: 32,
    color: '#FFF',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
  },

  // Bottom controls
  bottomControls: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
