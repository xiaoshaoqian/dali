/**
 * AI Loading Screen V2 - Immersive Generation Experience
 * Shows blur-to-clear image rendering with streaming text logic
 * Updated to match ai-loading-v2.html prototype
 * Part of Story 3.3: Progressive Visual Generation
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/07-flow-pages/ai-loading-v2.html
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
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
  interpolate,
  Easing,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';

import { colors } from '@/constants';
import { outfitService, type OutfitRecommendation } from '@/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.52;

// Text stream content
const TEXT_STREAM = [
  { text: '识别主体：', highlight: false },
  { text: '米色风衣\n', highlight: true },
  { text: '匹配风格库：', highlight: false },
  { text: '职场简约 / 韩系通勤\n\n', highlight: true },
  { text: '配色策略：', highlight: false },
  { text: '高对比度·黑白经典法则\n', highlight: true },
  { text: '视觉优化：', highlight: false },
  { text: '拉长腿部线条，收缩视觉重心。', highlight: false },
];

// Hero image with blur-to-clear effect
function HeroImage({
  imageUrl,
  progress,
}: {
  imageUrl: string;
  progress: number;
}) {
  // Calculate blur based on progress: 20px -> 0px
  const blurValue = Math.max(0, 20 - progress * 0.2);
  const opacity = progress < 30 ? 0.6 : progress < 60 ? 0.7 : progress < 100 ? 0.85 : 1;

  return (
    <View style={styles.heroSection}>
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.heroImage,
          {
            opacity,
            // Note: RN doesn't support blur filter directly, using opacity for visual effect
            // In production, use @react-native-community/blur or similar
          },
        ]}
        blurRadius={blurValue}
        resizeMode="cover"
      />

      {/* Purple pulse overlay */}
      <PurplePulseOverlay visible={progress < 100} />

      {/* Scan line */}
      <ScanLine />

      {/* Rendering status */}
      <View style={styles.renderingStatus}>
        <Text style={styles.renderingText}>Rendering {Math.floor(progress)}%</Text>
      </View>
    </View>
  );
}

// Purple pulse overlay animation
function PurplePulseOverlay({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visible ? opacity.value : 0,
  }));

  return (
    <Animated.View style={[styles.purpleOverlay, animatedStyle]}>
      <LinearGradient
        colors={['rgba(108,99,255,0.4)', 'rgba(108,99,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

// Scan line animation
function ScanLine() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(HERO_HEIGHT, {
        duration: 2500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [0, HERO_HEIGHT * 0.1, HERO_HEIGHT * 0.9, HERO_HEIGHT],
      [0, 1, 1, 0]
    ),
  }));

  return <Animated.View style={[styles.scanLine, animatedStyle]} />;
}

// Floating header
function FloatingHeader() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['rgba(28,28,46,0.7)', 'rgba(44,44,84,0.4)', 'transparent']}
      locations={[0, 0.6, 1]}
      style={[styles.header, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.loadingBadge}>
        <Text style={styles.spinnerIcon}>⟳</Text>
        <Text style={styles.loadingText}>AI 思考中...</Text>
      </View>
    </LinearGradient>
  );
}

// Streaming text display
function StreamingText({ currentIndex }: { currentIndex: number }) {
  return (
    <View style={styles.streamContainer}>
      {TEXT_STREAM.slice(0, currentIndex + 1).map((item, idx) => (
        <Animated.Text
          key={idx}
          entering={FadeIn.duration(400)}
          style={[styles.streamText, item.highlight && styles.hlText]}
        >
          {item.text}
        </Animated.Text>
      ))}
      {currentIndex < TEXT_STREAM.length - 1 && (
        <View style={styles.cursor} />
      )}
    </View>
  );
}

// Progress bar
function ProgressBar({
  progress,
  statusText,
}: {
  progress: number;
  statusText: string;
}) {
  return (
    <View style={styles.progressArea}>
      <Text style={styles.statusText}>{statusText}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export default function AILoadingScreen() {
  const params = useLocalSearchParams<{
    photoUrl: string;
    occasion: string;
  }>();

  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);
  const [streamIndex, setStreamIndex] = useState(-1);
  const [statusText, setStatusText] = useState('初始化...');
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const progressRef = useRef(0);
  const isComplete = useRef(false);

  const photoUrl = params.photoUrl ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=10&w=200';

  // Navigate to results when complete
  const navigateToResults = useCallback(() => {
    router.replace({
      pathname: '/outfit-results',
      params: {
        recommendations: JSON.stringify(recommendations),
        occasion: params.occasion || '职场通勤',
        photoUrl: params.photoUrl,
      },
    });
  }, [recommendations, params]);

  // Simulate API call - using mock data directly since proper API integration requires garmentData
  useEffect(() => {
    // For now, use mock recommendations since full API integration requires garmentData from recognition step
    // In production, this would call outfitService.generateOutfits with proper request object
    const mockRecommendations: OutfitRecommendation[] = [
      {
        id: 'mock-1',
        name: '职场优雅·风衣Look',
        items: [
          { itemType: '外套', name: '米色风衣', color: '米色', colorHex: '#F5F5DC', styleTip: '经典款' },
          { itemType: '上衣', name: '白色衬衫', color: '白色', colorHex: '#FFFFFF', styleTip: '内搭首选' },
          { itemType: '裤子', name: '黑色阔腿裤', color: '黑色', colorHex: '#1C1C1E', styleTip: '显瘦利器' },
        ],
        theory: {
          colorPrinciple: '高对比度·黑白经典',
          styleAnalysis: '职场简约风格',
          bodyTypeAdvice: '阔腿裤拉长腿部线条',
          occasionFit: '职场通勤',
          fullExplanation: '识别到**米色风衣**主体，匹配**职场简约**风格库。采用高对比度·黑白经典配色法则。',
        },
        styleTags: ['简约', '通勤'],
        confidence: 0.98,
        occasion: params.occasion || '职场通勤',
      },
    ];
    setRecommendations(mockRecommendations);
  }, [params.occasion]);

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (progressRef.current >= 100) {
        clearInterval(interval);
        return;
      }
      progressRef.current += Math.random() * 2;
      if (progressRef.current > 100) progressRef.current = 100;
      setProgress(progressRef.current);

      // Update status text
      if (progressRef.current > 30 && progressRef.current < 60) {
        setStatusText('分析配色原理中...');
      } else if (progressRef.current >= 60 && progressRef.current < 90) {
        setStatusText('生成搭配方案...');
      } else if (progressRef.current >= 90 && progressRef.current < 100) {
        setStatusText('即将完成...');
      } else if (progressRef.current >= 100) {
        setStatusText('生成完毕');
        if (!isComplete.current) {
          isComplete.current = true;
          // 800ms delay before navigation (per spec)
          setTimeout(() => {
            navigateToResults();
          }, 800);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [navigateToResults]);

  // Text streaming
  useEffect(() => {
    if (streamIndex >= TEXT_STREAM.length - 1) return;

    const timeout = setTimeout(() => {
      setStreamIndex((prev) => prev + 1);
    }, 600);

    return () => clearTimeout(timeout);
  }, [streamIndex]);

  return (
    <View style={styles.container}>
      {/* Hero with blur effect */}
      <HeroImage imageUrl={photoUrl} progress={progress} />

      {/* Floating header */}
      <FloatingHeader />

      {/* Content sheet */}
      <View style={styles.contentSheet}>
        <View style={styles.sheetHandle} />

        {/* Skeleton titles */}
        <View style={styles.skeletonArea}>
          <View style={[styles.skeletonTitle, { width: '60%' }]} />
          <View style={[styles.skeletonTitle, { width: '30%' }]} />
        </View>

        {/* Logic box with streaming text */}
        <View style={styles.logicBox}>
          <View style={styles.logicTitleRow}>
            <Text style={styles.logicTitle}>Thinking Stream</Text>
          </View>
          <StreamingText currentIndex={streamIndex} />
          <ProgressBar progress={progress} statusText={statusText} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Hero Section
  heroSection: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: '#2C2C2E',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.1 }],
  },

  // Purple overlay
  purpleOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  // Rendering status
  renderingStatus: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -10 }],
  },
  renderingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 40,
  },
  spinnerIcon: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
  },

  // Content sheet
  contentSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
    paddingHorizontal: 20,
    gap: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },

  // Skeleton
  skeletonArea: {
    gap: 8,
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
  },

  // Logic box
  logicBox: {
    flex: 1,
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  logicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 8,
  },
  logicTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },

  // Streaming text
  streamContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  streamText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#3A3A3C',
  },
  hlText: {
    color: colors.primary,
    fontWeight: '600',
  },
  cursor: {
    width: 2,
    height: 14,
    backgroundColor: colors.primary,
    marginLeft: 2,
  },

  // Progress
  progressArea: {
    marginTop: 'auto',
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
