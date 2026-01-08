/**
 * SharePreview Component
 *
 * Modal component for previewing and generating share images.
 * Allows users to select template style, preview the result,
 * and share or save the generated image.
 *
 * Story 6-2: Added loading overlay, image preview integration,
 * and improved generation flow.
 *
 * @module components/share/SharePreview
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';

import { ShareTemplate, ShareTemplateRef } from './ShareTemplate';
import { ShareImagePreview } from './ShareImagePreview';
import type { OutfitData, TemplateStyle, SocialPlatform } from '@/types/share';
import {
  trackTemplateSelection,
  trackImageGeneration,
  trackShareEvent,
} from '@/services/analytics';
import {
  trackShareImageGenerated,
  trackShareCompleted,
  ensureFileSizeLimit,
} from '@/services/share';

/**
 * SharePreview component props
 */
export interface SharePreviewProps {
  visible: boolean;
  outfit: OutfitData;
  onClose: () => void;
  onShare?: (templateStyle: TemplateStyle, imageUri: string, platform?: SocialPlatform) => void;
}

/**
 * Preview state machine
 */
type PreviewState = 'selecting' | 'generating' | 'preview';

/**
 * SharePreview modal component
 *
 * @param props - Component props
 * @returns SharePreview component
 */
export function SharePreview({
  visible,
  outfit,
  onClose,
  onShare,
}: SharePreviewProps): React.ReactElement {
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>('minimal');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>('selecting');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | undefined>(undefined);
  const shareTemplateRef = useRef<ShareTemplateRef>(null);
  const generationStartTime = useRef<number>(0);

  /**
   * Reset state when modal closes
   */
  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setPreviewState('selecting');
      setGeneratedImage(null);
    }
  }, [visible]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clean up resources when component unmounts
      if (shareTemplateRef.current) {
        shareTemplateRef.current.cleanup();
      }
    };
  }, []);

  /**
   * Handle template style selection
   */
  const handleStyleSelect = useCallback((style: TemplateStyle) => {
    setSelectedStyle(style);
    setGeneratedImage(null); // Clear previous image
    setPreviewState('selecting');

    // Track template selection
    trackTemplateSelection(style);
  }, []);

  /**
   * Generate share image
   */
  const handleGenerate = useCallback(async () => {
    setPreviewState('generating');
    generationStartTime.current = Date.now();

    try {
      if (shareTemplateRef.current && shareTemplateRef.current.capture) {
        await shareTemplateRef.current.capture();
        // Note: handleImageGenerated will be called by ShareTemplate's onGenerate
      } else {
        throw new Error('ShareTemplate ref not available');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      Alert.alert('生成失败', '图片生成失败,请重试');

      // Track failed image generation
      const generationTime = Date.now() - generationStartTime.current;
      trackImageGeneration(selectedStyle, generationTime, false);

      setPreviewState('selecting');
    }
  }, [selectedStyle]);

  /**
   * Handle image generation completion
   */
  const handleImageGenerated = useCallback(async (uri: string) => {
    const generationTime = Date.now() - generationStartTime.current;

    try {
      // Ensure file size is within limits (AC6: auto-compress if >2MB)
      const result = await ensureFileSizeLimit(uri);

      if (result.needsCompression) {
        // Log compression needed - ViewShot quality already set to 0.9
        // If still over limit, warn user but proceed
        console.warn(
          `[SharePreview] Image size ${result.currentSize ? (result.currentSize / 1024 / 1024).toFixed(2) : 'unknown'}MB. ` +
          'ViewShot quality is already set to 0.9 for compression.'
        );
      }

      // Track successful generation
      trackImageGeneration(selectedStyle, generationTime, true);

      // Track backend event
      await trackShareImageGenerated(outfit.id, selectedStyle);

      setGeneratedImage(result.uri);
      setPreviewState('preview');
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Still use original URI
      setGeneratedImage(uri);
      setPreviewState('preview');

      // Track with original URI
      trackImageGeneration(selectedStyle, generationTime, true);
      await trackShareImageGenerated(outfit.id, selectedStyle);
    }
  }, [selectedStyle, outfit.id]);

  /**
   * Handle share action from preview screen
   */
  const handleShareFromPreview = useCallback(async () => {
    if (!generatedImage) {
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('分享不可用', '您的设备不支持分享功能');
        return;
      }

      await Sharing.shareAsync(generatedImage, {
        mimeType: 'image/png',
        dialogTitle: '分享搭配',
      });

      // Track share completed
      await trackShareCompleted(outfit.id, selectedStyle);

      // Track share event with platform info
      if (selectedPlatform) {
        trackShareEvent(outfit.id, selectedPlatform, selectedStyle);
      }

      // Call onShare callback if provided
      if (onShare) {
        onShare(selectedStyle, generatedImage, selectedPlatform);
      }
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('分享失败', '分享图片时出错,请重试');
    }
  }, [generatedImage, selectedStyle, selectedPlatform, onShare, outfit.id]);

  /**
   * Handle regenerate - go back to template selection
   */
  const handleRegenerate = useCallback(() => {
    setPreviewState('selecting');
    // Keep selected style for convenience
  }, []);

  /**
   * Handle close from preview screen
   */
  const handleClosePreview = useCallback(() => {
    setPreviewState('selecting');
  }, []);

  /**
   * Handle error during image generation
   */
  const handleError = useCallback((error: Error) => {
    console.error('Image generation error:', error);

    const generationTime = Date.now() - generationStartTime.current;
    trackImageGeneration(selectedStyle, generationTime, false);

    setPreviewState('selecting');
    Alert.alert('生成失败', '图片生成失败,请重试');
  }, [selectedStyle]);

  // Show preview screen when image is generated
  if (previewState === 'preview' && generatedImage) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={handleClosePreview}
      >
        <ShareImagePreview
          imageUri={generatedImage}
          templateStyle={selectedStyle}
          outfitId={outfit.id}
          onRegenerate={handleRegenerate}
          onShare={handleShareFromPreview}
          onClose={handleClosePreview}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>分享搭配</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>选择一个模板，生成精美的分享图片</Text>

          {/* Template Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>选择分享模板</Text>
            <View style={styles.templateGrid}>
              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedStyle === 'minimal' && styles.templateButtonSelected,
                ]}
                onPress={() => handleStyleSelect('minimal')}
                testID="template-minimal"
              >
                <View style={[
                  styles.templatePreview,
                  styles.templateMinimal,
                  selectedStyle === 'minimal' && styles.templatePreviewSelected,
                ]}>
                  <Text style={styles.templatePreviewText}>简约</Text>
                  <Text style={styles.templateWatermark}>搭理</Text>
                </View>
                {selectedStyle === 'minimal' && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeIcon}>✓</Text>
                  </View>
                )}
                <Text style={styles.templateName}>简约</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedStyle === 'fashion' && styles.templateButtonSelected,
                ]}
                onPress={() => handleStyleSelect('fashion')}
                testID="template-fashion"
              >
                <View style={[
                  styles.templatePreview,
                  styles.templateFashion,
                  selectedStyle === 'fashion' && styles.templatePreviewSelected,
                ]}>
                  <Text style={[styles.templatePreviewText, styles.templatePreviewTextWhite]}>
                    时尚
                  </Text>
                  <Text style={[styles.templateWatermark, styles.templateWatermarkWhite]}>搭理</Text>
                </View>
                {selectedStyle === 'fashion' && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeIcon}>✓</Text>
                  </View>
                )}
                <Text style={styles.templateName}>时尚</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedStyle === 'artistic' && styles.templateButtonSelected,
                ]}
                onPress={() => handleStyleSelect('artistic')}
                testID="template-artistic"
              >
                <View style={[
                  styles.templatePreview,
                  styles.templateArtistic,
                  selectedStyle === 'artistic' && styles.templatePreviewSelected,
                ]}>
                  <Text style={styles.templatePreviewText}>文艺</Text>
                  <Text style={styles.templateWatermark}>搭理</Text>
                </View>
                {selectedStyle === 'artistic' && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeIcon}>✓</Text>
                  </View>
                )}
                <Text style={styles.templateName}>文艺</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hidden template for image generation */}
          <View style={styles.hiddenTemplate}>
            <ShareTemplate
              ref={shareTemplateRef}
              outfit={outfit}
              templateStyle={selectedStyle}
              onGenerate={handleImageGenerated}
              onError={handleError}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onClose}
            testID="cancel-button"
          >
            <Text style={styles.saveButtonText}>取消</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={previewState === 'generating'}
            testID="generate-button"
          >
            <Text style={styles.generateButtonText}>生成分享图</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {previewState === 'generating' && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#6C63FF" />
              <Text style={styles.loadingText}>正在生成精美分享图...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6C63FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  templateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateButton: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  templateButtonSelected: {
    opacity: 1,
  },
  templatePreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  templatePreviewSelected: {
    borderColor: '#6C63FF',
  },
  templateMinimal: {
    backgroundColor: '#FFFFFF',
  },
  templateFashion: {
    backgroundColor: '#6C63FF',
  },
  templateArtistic: {
    backgroundColor: '#FFF5E5',
  },
  templatePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  templatePreviewTextWhite: {
    color: '#FFFFFF',
  },
  templateWatermark: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    opacity: 0.7,
  },
  templateWatermarkWhite: {
    color: '#FFFFFF',
  },
  templateName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hiddenTemplate: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    width: 1080,
    height: 1920,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  generateButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Loading overlay styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
});

export default SharePreview;
