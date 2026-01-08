/**
 * ShareTemplate Component
 *
 * Main component for generating share images with different template styles.
 * Uses react-native-view-shot to capture the rendered template as an image.
 *
 * @module components/share/ShareTemplate
 */

import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Alert, ToastAndroid, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';
import type { OutfitData, TemplateStyle } from '@/types/share';
import MinimalTemplate from './templates/MinimalTemplate';
import FashionTemplate from './templates/FashionTemplate';
import ArtisticTemplate from './templates/ArtisticTemplate';

/**
 * ShareTemplate component props
 */
export interface ShareTemplateProps {
  outfit: OutfitData;
  templateStyle: TemplateStyle;
  onGenerate: (imageUri: string) => void;
  onError?: (error: Error) => void;
}

/**
 * ShareTemplate ref methods
 */
export interface ShareTemplateRef {
  capture: () => Promise<void>;
  cleanup: () => void;
}

/**
 * Show toast message
 */
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // On iOS, could use a toast library or fallback to Alert
    Alert.alert('提示', message);
  }
};

/**
 * ShareTemplate component for generating shareable images
 *
 * @param props - Component props
 * @param ref - Forward ref for exposing methods
 * @returns ShareTemplate component
 */
export const ShareTemplate = forwardRef<ShareTemplateRef, ShareTemplateProps>(
  ({ outfit, templateStyle, onGenerate, onError }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);

  /**
   * Capture the template as an image
   */
  const handleCapture = useCallback(async () => {
    const startTime = Date.now();

    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        throw new Error('ViewShot ref is not initialized');
      }

      const uri = await viewShotRef.current.capture();

      if (!uri) {
        throw new Error('Screenshot capture failed - no URI returned');
      }

      const generationTime = Date.now() - startTime;

      // Check file size (basic estimate based on dimensions)
      // For actual file size check, would need to read the file
      // For now, we rely on quality setting to keep under 2MB

      onGenerate(uri);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error during screenshot');
      console.error('Screenshot error:', err);

      // Call error callback if provided
      if (onError) {
        onError(err);
      }

      // Show toast error message (as per AC requirement)
      showToast('图片生成失败,请重试');

      // Log error to monitoring service (placeholder for Sentry)
      // In production: Sentry.captureException(err, { tags: { component: 'ShareTemplate' } })
      if (__DEV__) {
        console.error('[ShareTemplate] Error:', err, {
          templateStyle,
          outfitId: outfit.id,
        });
      }

      // Show retry dialog
      Alert.alert(
        '生成失败',
        '图片生成失败,是否重新生成?',
        [
          { text: '取消', style: 'cancel' },
          { text: '重试', onPress: handleCapture },
        ]
      );
    }
  }, [onGenerate, onError, templateStyle, outfit.id]);

  /**
   * Cleanup resources and release memory
   */
  const cleanup = useCallback(() => {
    // Release ViewShot reference to free memory
    if (viewShotRef.current) {
      viewShotRef.current = null;
    }
  }, []);

  /**
   * Expose capture and cleanup methods to parent components
   */
  useImperativeHandle(
    ref,
    () => ({
      capture: handleCapture,
      cleanup,
    }),
    [handleCapture, cleanup]
  );

  return (
    <ViewShot
      ref={viewShotRef}
      options={{
        format: 'png',
        quality: 0.9,
        width: 1080,
        height: 1920,
      }}
      style={styles.container}
    >
      {templateStyle === 'minimal' && <MinimalTemplate outfit={outfit} />}
      {templateStyle === 'fashion' && <FashionTemplate outfit={outfit} />}
      {templateStyle === 'artistic' && <ArtisticTemplate outfit={outfit} />}
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1920,
  },
});

export default ShareTemplate;
