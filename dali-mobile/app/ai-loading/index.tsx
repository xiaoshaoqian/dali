/**
 * AI Loading Screen
 * Shows skeleton loading animation during AI outfit generation
 * Calls outfit generation API and navigates to results
 * Part of Story 3.2 & 3.3
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants';
import { outfitService, type OutfitRecommendation } from '@/services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 200;

// Loading messages that rotate
const LOADING_MESSAGES = [
  'AI 正在为你挑选最佳搭配...',
  '分析配色原理中...',
  '匹配你的风格偏好...',
  '马上就好，请稍等~',
];

// Skeleton card component with shimmer effect
function SkeletonCard({ delay }: { delay: number }) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonTags}>
          <View style={styles.skeletonTag} />
          <View style={styles.skeletonTag} />
        </View>
      </View>
    </Animated.View>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <LinearGradient
          colors={['#6C63FF', '#9D94FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
}

export default function AILoadingScreen() {
  const params = useLocalSearchParams<{
    photoUrl: string;
    occasionId: string;
    occasionName: string;
    garmentType: string;
    styleTags: string;
    colors: string;
  }>();

  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const generationRef = useRef(false);

  // Generate outfits on mount
  useEffect(() => {
    if (generationRef.current) return;
    generationRef.current = true;

    generateOutfits();
  }, []);

  const generateOutfits = async () => {
    try {
      // Parse garment data from params
      const garmentData = {
        garmentType: params.garmentType || '上衣',
        primaryColors: params.colors ? JSON.parse(params.colors) : [],
        styleTags: params.styleTags ? params.styleTags.split(',') : [],
      };

      // Call the outfit generation API
      const response = await outfitService.generateOutfits({
        photoUrl: params.photoUrl || '',
        occasion: params.occasionName || '日常出行',
        garmentData,
      });

      if (response.success && response.recommendations.length > 0) {
        // Set progress to 100% when done
        setProgress(100);
        setIsGenerating(false);

        // Navigate to results screen with recommendations
        setTimeout(() => {
          router.replace({
            pathname: '/outfit-results' as never,
            params: {
              recommendations: JSON.stringify(response.recommendations),
              occasion: response.occasion,
              photoUrl: params.photoUrl,
            },
          });
        }, 500);
      } else {
        throw new Error('No recommendations received');
      }
    } catch (error) {
      console.error('Outfit generation failed:', error);
      setIsGenerating(false);
      Alert.alert(
        '生成失败',
        'AI 正在学习中，请稍后重试',
        [{ text: '返回', onPress: () => router.replace('/(tabs)' as never) }]
      );
    }
  };

  // Simulate progress while API is loading
  useEffect(() => {
    if (!isGenerating) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev; // Cap at 90% until API returns
        }
        // Slow down as we approach 90%
        const increment = prev < 60 ? 3 : prev < 80 ? 1.5 : 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isGenerating]);

  // Rotate loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <LinearGradient
      colors={['#6C63FF', '#9D94FF', '#B8B4FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>生成搭配中</Text>
          <Text style={styles.headerSubtitle}>{params.occasionName || '场合'}</Text>
        </View>

        {/* Skeleton Cards */}
        <View style={styles.cardsContainer}>
          <SkeletonCard delay={0} />
          <SkeletonCard delay={500} />
          <SkeletonCard delay={1000} />
        </View>

        {/* Progress Section */}
        <View style={[styles.progressSection, { paddingBottom: insets.bottom + 40 }]}>
          <ProgressBar progress={progress} />
          <Text style={styles.loadingMessage}>{LOADING_MESSAGES[messageIndex]}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Skeleton Cards
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTags: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonTag: {
    height: 24,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },

  // Progress Section
  progressSection: {
    alignItems: 'center',
    paddingTop: 24,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 40,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
