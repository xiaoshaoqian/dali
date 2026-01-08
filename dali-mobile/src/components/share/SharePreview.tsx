/**
 * SharePreview Component
 *
 * Modal component for previewing and generating share images.
 * Allows users to select template style, preview the result,
 * and share or save the generated image.
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
import type { OutfitData, TemplateStyle, SocialPlatform } from '@/types/share';
import { trackTemplateSelection, trackImageGeneration, trackShareEvent } from '@/services/analytics';

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
}: SharePreviewProps): JSX.Element {
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>('minimal');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | undefined>(undefined);
  const shareTemplateRef = useRef<ShareTemplateRef>(null);

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

    // Track template selection
    trackTemplateSelection(style);
  }, []);

  /**
   * Generate share image
   */
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    const startTime = Date.now();

    try {
      if (shareTemplateRef.current && shareTemplateRef.current.capture) {
        await shareTemplateRef.current.capture();

        // Track successful image generation
        const generationTime = Date.now() - startTime;
        trackImageGeneration(selectedStyle, generationTime, true);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      Alert.alert('生成失败', '图片生成失败,请重试');

      // Track failed image generation
      const generationTime = Date.now() - startTime;
      trackImageGeneration(selectedStyle, generationTime, false);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedStyle]);

  /**
   * Handle image generation completion
   */
  const handleImageGenerated = useCallback((uri: string) => {
    setGeneratedImage(uri);
    setIsGenerating(false);
  }, []);

  /**
   * Handle share action
   */
  const handleShare = useCallback(async (platform?: SocialPlatform) => {
    if (!generatedImage) {
      await handleGenerate();
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('分享不可用', '您的设备不支持分享功能');
        return;
      }

      await Sharing.shareAsync(generatedImage);

      // Track share event with platform info
      if (platform) {
        trackShareEvent(outfit.id, platform, selectedStyle);
      }

      // Call onShare callback if provided
      if (onShare) {
        onShare(selectedStyle, generatedImage, platform);
      }
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('分享失败', '分享图片时出错,请重试');
    }
  }, [generatedImage, selectedStyle, handleGenerate, onShare, outfit.id]);

  /**
   * Handle error during image generation
   */
  const handleError = useCallback((error: Error) => {
    console.error('Image generation error:', error);
    setIsGenerating(false);
  }, []);

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
              >
                <View style={[styles.templatePreview, styles.templateMinimal]}>
                  <Text style={styles.templatePreviewText}>简约</Text>
                </View>
                <Text style={styles.templateName}>简约</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedStyle === 'fashion' && styles.templateButtonSelected,
                ]}
                onPress={() => handleStyleSelect('fashion')}
              >
                <View style={[styles.templatePreview, styles.templateFashion]}>
                  <Text style={[styles.templatePreviewText, styles.templatePreviewTextWhite]}>
                    时尚
                  </Text>
                </View>
                <Text style={styles.templateName}>时尚</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedStyle === 'artistic' && styles.templateButtonSelected,
                ]}
                onPress={() => handleStyleSelect('artistic')}
              >
                <View style={[styles.templatePreview, styles.templateArtistic]}>
                  <Text style={styles.templatePreviewText}>文艺</Text>
                </View>
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
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.generateButtonText}>生成预览</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, !generatedImage && styles.shareButtonDisabled]}
            onPress={() => handleShare(selectedPlatform)}
            disabled={!generatedImage || isGenerating}
          >
            <Text style={styles.shareButtonText}>立即分享</Text>
          </TouchableOpacity>
        </View>
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
  },
  templateButtonSelected: {
    opacity: 1,
  },
  templatePreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
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
  templateName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 8,
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
  generateButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  shareButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: '#D1D1D6',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SharePreview;
