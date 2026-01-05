/**
 * Outfit Results Screen
 * Displays AI-generated outfit recommendations with horizontal scrolling cards
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/02-outfit-results/outfit-results-page.html
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/constants';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import type { OutfitRecommendation } from '@/services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 353;
const CARD_GAP = 16;
const CARD_WITH_GAP = CARD_WIDTH + CARD_GAP;
const HORIZONTAL_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

// Scroll indicator dot component
function ScrollDot({ active }: { active: boolean }) {
  return (
    <Animated.View
      style={[
        styles.dot,
        active && styles.dotActive,
      ]}
    />
  );
}

// Success banner component
function SuccessBanner({ count }: { count: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.successBanner}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <View style={styles.successText}>
        <Text style={styles.successTitle}>生成成功</Text>
        <Text style={styles.successSubtitle}>AI 为你精心挑选了 {count} 套方案</Text>
      </View>
    </Animated.View>
  );
}

// Header with back and share buttons
function Header({
  onBack,
  onShare,
}: {
  onBack: () => void;
  onShare: () => void;
}) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.7}>
        <Text style={styles.navButtonIcon}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.navTitle}>搭配方案</Text>
      <TouchableOpacity style={styles.navButton} onPress={onShare} activeOpacity={0.7}>
        <Text style={styles.shareIcon}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OutfitResultsScreen() {
  const params = useLocalSearchParams<{
    recommendations: string;
    occasion: string;
    photoUrl: string;
  }>();

  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Parse recommendations from params
  const recommendations: OutfitRecommendation[] = React.useMemo(() => {
    try {
      return params.recommendations ? JSON.parse(params.recommendations) : [];
    } catch {
      return [];
    }
  }, [params.recommendations]);

  // Handle scroll event to update active indicator
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / CARD_WITH_GAP);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < recommendations.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, recommendations.length]);

  // Navigate to card on dot tap
  const handleDotPress = useCallback((index: number) => {
    scrollRef.current?.scrollTo({
      x: index * CARD_WITH_GAP,
      animated: true,
    });
    setActiveIndex(index);
  }, []);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
  }, []);

  const handleCardPress = useCallback((recommendation: OutfitRecommendation) => {
    router.push({
      pathname: '/outfit/[id]',
      params: {
        id: recommendation.id,
        recommendation: JSON.stringify(recommendation),
      },
    });
  }, []);

  const handleLike = useCallback((_id: string) => {
    // TODO: Implement like functionality with API call
  }, []);

  const handleSave = useCallback((_id: string) => {
    // TODO: Implement save functionality with API call
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with gradient and inverse radius cap */}
      <LinearGradient
        colors={['#6C63FF', '#8B7FFF', '#9D94FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Header onBack={handleBack} onShare={handleShare} />
        <SuccessBanner count={recommendations.length || 3} />

        {/* Inverse radius cap */}
        <View style={styles.headerCap} />
      </LinearGradient>

      {/* Scroll Indicator */}
      <View style={styles.scrollIndicator}>
        {(recommendations.length > 0 ? recommendations : [1, 2, 3]).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDotPress(index)}
            activeOpacity={0.7}
          >
            <ScrollDot active={index === activeIndex} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Horizontal scrolling cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WITH_GAP}
        snapToAlignment="center"
        contentContainerStyle={[
          styles.cardsContainer,
          { paddingHorizontal: HORIZONTAL_PADDING },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {recommendations.map((recommendation, index) => (
          <Animated.View
            key={recommendation.id}
            entering={FadeInUp.delay(100 + index * 100).duration(600)}
            style={styles.cardWrapper}
          >
            <OutfitCard
              recommendation={recommendation}
              index={index}
              onPress={() => handleCardPress(recommendation)}
              onLike={() => handleLike(recommendation.id)}
              onSave={() => handleSave(recommendation.id)}
            />
          </Animated.View>
        ))}

        {/* Empty state */}
        {recommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无推荐方案</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>返回重试</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    position: 'relative',
    zIndex: 100,
  },
  headerCap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: colors.gray4,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // Top Navigation
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  shareIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Success Banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
    zIndex: 10,
  },
  successIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  successSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Scroll Indicator
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D1D6',
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },

  // Cards Container
  cardsContainer: {
    paddingBottom: 40,
    gap: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },

  // Empty State
  emptyState: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
