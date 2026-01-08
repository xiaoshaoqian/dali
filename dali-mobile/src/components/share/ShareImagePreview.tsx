/**
 * ShareImagePreview Component
 *
 * Full-screen preview of a generated share image with action buttons.
 * Provides options to save to gallery, share, or regenerate the image.
 * Uses glassmorphism design for the bottom action bar.
 * Integrates SharePlatformSheet for social platform selection.
 *
 * @module components/share/ShareImagePreview
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Line, Circle } from 'react-native-svg';

import { saveImageToGallery, trackSaveToGallery } from '@/services/share';
import { SharePlatformSheet } from './SharePlatformSheet';
import type { TemplateStyle } from '@/types/share';

/**
 * ShareImagePreview component props
 */
export interface ShareImagePreviewProps {
  /** URI of the generated image to preview */
  imageUri: string;
  /** Template style used for the image */
  templateStyle: TemplateStyle;
  /** ID of the outfit being shared */
  outfitId: string;
  /** Callback when user wants to regenerate image */
  onRegenerate: () => void;
  /** Callback when user wants to share the image (optional - uses built-in SharePlatformSheet if not provided) */
  onShare?: () => void;
  /** Callback when user closes the preview */
  onClose: () => void;
  /** Callback when share completes successfully (optional) */
  onShareComplete?: (success: boolean) => void;
}

/**
 * SVG Icon Components for action buttons
 */
const SaveIcon = ({ color = '#1C1C1E' }: { color?: string }): React.ReactElement => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
    <Path
      d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M17 21v-8H7v8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 3v5h8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShareIcon = ({ color = '#FFFFFF' }: { color?: string }): React.ReactElement => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
    <Circle cx={18} cy={5} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={6} cy={12} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={18} cy={19} r={3} stroke={color} strokeWidth={2} />
    <Line x1={8.59} y1={13.51} x2={15.42} y2={17.49} stroke={color} strokeWidth={2} />
    <Line x1={15.41} y1={6.51} x2={8.59} y2={10.49} stroke={color} strokeWidth={2} />
  </Svg>
);

const RefreshIcon = ({ color = '#1C1C1E' }: { color?: string }): React.ReactElement => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
    <Path
      d="M1 4v6h6M23 20v-6h-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ color = '#FFFFFF' }: { color?: string }): React.ReactElement => (
  <Svg width={18} height={18} fill="none" viewBox="0 0 24 24">
    <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

/**
 * Show toast message (platform-aware)
 */
const showToast = (message: string): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS uses Alert as fallback
    Alert.alert('提示', message);
  }
};

/**
 * ShareImagePreview component for displaying and interacting with generated share images
 *
 * @param props - Component props
 * @returns ShareImagePreview component
 */
export function ShareImagePreview({
  imageUri,
  templateStyle,
  outfitId,
  onRegenerate,
  onShare,
  onClose,
  onShareComplete,
}: ShareImagePreviewProps): React.ReactElement {
  const [isSaving, setIsSaving] = useState(false);
  const [showPlatformSheet, setShowPlatformSheet] = useState(false);

  /**
   * Handle save to gallery action
   */
  const handleSaveToGallery = useCallback(async () => {
    setIsSaving(true);

    try {
      const result = await saveImageToGallery(imageUri);

      if (result.success) {
        showToast('已保存到相册');

        // Track save event
        await trackSaveToGallery(outfitId, templateStyle);
      } else if (result.error === 'permission_denied') {
        Alert.alert(
          '权限不足',
          '需要相册权限才能保存，请前往设置开启',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '前往设置',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      } else if (result.error === 'file_not_found') {
        Alert.alert('保存失败', '图片文件不存在，请重新生成');
      } else {
        Alert.alert('保存失败', '保存图片时出错，请重试');
      }
    } catch (error) {
      console.error('[ShareImagePreview] Save error:', error);
      Alert.alert('保存失败', '保存图片时出错，请重试');
    } finally {
      setIsSaving(false);
    }
  }, [imageUri, outfitId, templateStyle]);

  /**
   * Handle share action with haptic feedback
   * Opens platform sheet if onShare not provided
   */
  const handleShare = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onShare) {
      // Use external share handler
      onShare();
    } else {
      // Use built-in SharePlatformSheet
      setShowPlatformSheet(true);
    }
  }, [onShare]);

  /**
   * Handle share completion from SharePlatformSheet
   */
  const handleShareComplete = useCallback((success: boolean) => {
    setShowPlatformSheet(false);

    if (success) {
      showToast('分享成功！');
    }

    onShareComplete?.(success);
  }, [onShareComplete]);

  /**
   * Handle share cancel from SharePlatformSheet
   */
  const handleShareCancel = useCallback(() => {
    setShowPlatformSheet(false);
  }, []);

  /**
   * Handle regenerate action with haptic feedback
   */
  const handleRegenerate = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRegenerate();
  }, [onRegenerate]);

  /**
   * Handle close action
   */
  const handleClose = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        testID="close-button"
      >
        <View style={styles.closeButtonInner}>
          <CloseIcon />
        </View>
      </TouchableOpacity>

      {/* Preview Image */}
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.previewImage}
          resizeMode="contain"
          testID="preview-image"
        />
      </View>

      {/* Action Bar with Glassmorphism */}
      <BlurView intensity={80} tint="light" style={styles.actionBar}>
        <View style={styles.actionBarContent}>
          {/* Save to Gallery Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveToGallery}
            disabled={isSaving}
            testID="save-button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#1C1C1E" />
            ) : (
              <>
                <View style={styles.actionIconContainer}>
                  <SaveIcon />
                </View>
                <Text style={styles.actionText}>保存到相册</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Share Button (Primary) */}
          <TouchableOpacity
            style={[styles.actionButton, styles.shareActionButton]}
            onPress={handleShare}
            testID="share-button"
          >
            <View style={[styles.actionIconContainer, styles.shareIconContainer]}>
              <ShareIcon />
            </View>
            <Text style={[styles.actionText, styles.shareActionText]}>分享到...</Text>
          </TouchableOpacity>

          {/* Regenerate Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRegenerate}
            testID="regenerate-button"
          >
            <View style={styles.actionIconContainer}>
              <RefreshIcon />
            </View>
            <Text style={styles.actionText}>重新生成</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* SharePlatformSheet for social platform selection */}
      <SharePlatformSheet
        imageUri={imageUri}
        outfitId={outfitId}
        templateStyle={templateStyle}
        visible={showPlatformSheet}
        onComplete={handleShareComplete}
        onCancel={handleShareCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    maxWidth: 320,
    maxHeight: 568,
    borderRadius: 16,
  },
  actionBar: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  actionBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  shareActionButton: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 8,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  shareActionText: {
    color: '#FFFFFF',
  },
});

export default ShareImagePreview;
