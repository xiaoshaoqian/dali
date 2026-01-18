/**
 * AI Loading Screen V3 - Real-time SSE Streaming
 * Shows streaming text + thinking animation + image generation progress
 * Connects to backend SSE endpoint for real-time updates
 *
 * @see Story 9-7: AI Loading Page Rewrite
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
  FadeInUp,
  SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/constants';
import {
  sseService,
  type SSEConnection,
  type TextChunkEventData,
  type ThinkingEventData,
  type ImageReadyData,
  type CompleteEventData,
  type ErrorEventData,
} from '@/services/sseService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.48;

// Typing cursor component
function TypingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.cursor, animatedStyle]} />;
}

// Thinking dots animation
function ThinkingDots() {
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  useEffect(() => {
    const animate = (value: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        value.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        );
      }, delay);
    };

    animate(translateY1, 0);
    animate(translateY2, 150);
    animate(translateY3, 300);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY1.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY2.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY3.value }],
  }));

  return (
    <View style={styles.thinkingDots}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
}

// Hero image section with progressive reveal
function HeroSection({
  imageUrl,
  generatedImageUrl,
  isImageReady,
}: {
  imageUrl: string;
  generatedImageUrl: string | null;
  isImageReady: boolean;
}) {
  const insets = useSafeAreaInsets();
  const imageOpacity = useSharedValue(0);

  useEffect(() => {
    if (isImageReady && generatedImageUrl) {
      imageOpacity.value = withTiming(1, { duration: 500 });
    }
  }, [isImageReady, generatedImageUrl]);

  const generatedImageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  return (
    <View style={styles.heroSection}>
      {/* Original photo as background */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.heroImage}
        resizeMode="cover"
        blurRadius={10}
      />

      {/* Generated image overlay (fades in when ready) */}
      {generatedImageUrl && (
        <Animated.Image
          source={{ uri: generatedImageUrl }}
          style={[styles.generatedImage, generatedImageStyle]}
          resizeMode="cover"
        />
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.4)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Status badge */}
      <View style={[styles.statusBadge, { top: insets.top + 16 }]}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>AI 生成中</Text>
      </View>

      {/* Generated image indicator */}
      {isImageReady && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.imageReadyBadge}>
          <Text style={styles.imageReadyText}>搭配效果图已生成</Text>
        </Animated.View>
      )}
    </View>
  );
}

// Streaming text display with markdown-like formatting
function StreamingTextDisplay({
  text,
  isThinking,
  thinkingMessage,
  showCursor,
}: {
  text: string;
  isThinking: boolean;
  thinkingMessage: string;
  showCursor: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom as text streams
  useEffect(() => {
    if (text) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [text]);

  // Parse text for highlighted keywords (**text**)
  const renderText = () => {
    if (!text) return null;

    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.highlightedText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.streamContainer}
      contentContainerStyle={styles.streamContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.streamText}>
        {renderText()}
        {showCursor && !isThinking && <TypingCursor />}
      </Text>

      {/* Thinking indicator */}
      {isThinking && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.thinkingRow}>
          <Text style={styles.thinkingEmoji}>💭</Text>
          <Text style={styles.thinkingText}>{thinkingMessage}</Text>
          <ThinkingDots />
        </Animated.View>
      )}
    </ScrollView>
  );
}

// Progress indicator
function ProgressIndicator({
  stage,
}: {
  stage: 'analyzing' | 'streaming' | 'generating_image' | 'complete';
}) {
  const stageLabels = {
    analyzing: '分析服装特征...',
    streaming: '生成搭配建议...',
    generating_image: '生成搭配效果图...',
    complete: '生成完成',
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressSteps}>
        <View style={[styles.progressStep, styles.progressStepActive]} />
        <View style={[styles.progressStep, stage !== 'analyzing' && styles.progressStepActive]} />
        <View style={[styles.progressStep, (stage === 'generating_image' || stage === 'complete') && styles.progressStepActive]} />
        <View style={[styles.progressStep, stage === 'complete' && styles.progressStepActive]} />
      </View>
      <Text style={styles.progressLabel}>{stageLabels[stage]}</Text>
    </View>
  );
}

export default function AILoadingScreen() {
  const params = useLocalSearchParams<{
    photoUrl: string;
    occasion: string;
    selectedItem?: string;
    useStreaming?: string;
  }>();

  const insets = useSafeAreaInsets();
  const streamedTextRef = useRef('');

  // State
  const [streamedText, setStreamedText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('AI正在思考...');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageReady, setIsImageReady] = useState(false);
  const [stage, setStage] = useState<'analyzing' | 'streaming' | 'generating_image' | 'complete'>('analyzing');
  const [error, setError] = useState<string | null>(null);

  const photoUrl = params.photoUrl
    ? decodeURIComponent(params.photoUrl)
    : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

  // Connect to SSE stream
  useEffect(() => {
    console.log('[AILoading] Connecting to SSE stream...');

    sseService.startGeneration(
      {
        imageUrl: photoUrl,
        occasion: params.occasion || '日常',
        selectedItem: params.selectedItem,
      },
      {
        onThinking: (data: ThinkingEventData) => {
          setIsThinking(true);
          setThinkingMessage(data.message);
        },

        onAnalysisComplete: () => {
          setStage('streaming');
          setIsThinking(false);
        },

        onTextChunk: (data: TextChunkEventData) => {
          setIsThinking(false);
          setStage('streaming');
          streamedTextRef.current += data.content;
          setStreamedText(streamedTextRef.current);
        },

        onImageGenerating: (data) => {
          setIsImageGenerating(true);
          setStage('generating_image');
          setThinkingMessage(data.message || '正在生成搭配效果图...');
        },

        onImageReady: (data: ImageReadyData) => {
          setIsImageGenerating(false);
          setGeneratedImageUrl(data.url);
          setIsImageReady(true);
        },

        onImageFailed: () => {
          setIsImageGenerating(false);
          // Continue without image - not a fatal error
        },

        onComplete: (data: CompleteEventData) => {
          setStage('complete');
          if (data.generated_image_url) {
            setGeneratedImageUrl(data.generated_image_url);
            setIsImageReady(true);
          }

          // Navigate to results after short delay
          setTimeout(() => {
            router.replace({
              pathname: '/outfit-results',
              params: {
                outfitId: data.outfit_id,
                theoryText: streamedTextRef.current,
                generatedImageUrl: data.generated_image_url || '',
                occasion: params.occasion,
                photoUrl,
              },
            });
          }, 800);
        },

        onError: (data: ErrorEventData) => {
          console.error('[AILoading] SSE error:', data);
          setError(data.message);
        },

        onDone: () => {
          console.log('[AILoading] Stream done');
        },
      }
    );

    // Cleanup on unmount
    return () => {
      console.log('[AILoading] Cleaning up SSE connection');
      sseService.stopGeneration();
    };
  }, [photoUrl, params.occasion, params.selectedItem]);

  // Handle back press
  const handleBack = useCallback(() => {
    sseService.stopGeneration();
    router.back();
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null);
    setStreamedText('');
    streamedTextRef.current = '';
    setStage('analyzing');
    // Re-trigger connection
    router.replace({
      pathname: '/ai-loading',
      params: {
        photoUrl: params.photoUrl,
        occasion: params.occasion,
        selectedItem: params.selectedItem,
        useStreaming: 'true',
      },
    });
  }, [params]);

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorTitle}>生成失败</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={handleBack}>
          <Text style={styles.backLinkText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero section with images */}
      <HeroSection
        imageUrl={photoUrl}
        generatedImageUrl={generatedImageUrl}
        isImageReady={isImageReady}
      />

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 16 }]}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>×</Text>
      </TouchableOpacity>

      {/* Content sheet */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        style={[styles.contentSheet, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.sheetHandle} />

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>AI 搭配建议</Text>
          <Text style={styles.occasion}>{params.occasion || '日常'}</Text>
        </View>

        {/* Streaming text area */}
        <View style={styles.streamBox}>
          <StreamingTextDisplay
            text={streamedText}
            isThinking={isThinking}
            thinkingMessage={thinkingMessage}
            showCursor={stage === 'streaming'}
          />
        </View>

        {/* Progress indicator */}
        <ProgressIndicator stage={stage} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Hero section
  heroSection: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: '#2C2C2E',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  generatedImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  // Status badge
  statusBadge: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  // Image ready badge
  imageReadyBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(108,99,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageReadyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Back button
  backButton: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },

  // Content sheet
  contentSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    zIndex: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Title row
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  occasion: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Stream box
  streamBox: {
    flex: 1,
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    marginBottom: 16,
  },
  streamContainer: {
    flex: 1,
  },
  streamContent: {
    paddingBottom: 20,
  },
  streamText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#3A3A3C',
  },
  highlightedText: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Cursor
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: colors.primary,
    marginLeft: 2,
  },

  // Thinking indicator
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    gap: 8,
  },
  thinkingEmoji: {
    fontSize: 16,
  },
  thinkingText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    gap: 8,
  },
  progressSteps: {
    flexDirection: 'row',
    gap: 8,
  },
  progressStep: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
