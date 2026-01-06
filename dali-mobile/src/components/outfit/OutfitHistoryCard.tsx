/**
 * OutfitHistoryCard Component
 * Compact card for displaying outfit in history grid view
 *
 * @see Story 5.2: Outfit History Grid View
 * @see _bmad-output/planning-artifacts/ux-design/pages/04-wardrobe/outfit-page.html
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { LocalOutfitRecord } from '@/utils/storage';
import { formatRelativeDate } from '@/hooks';

// =============================================================================
// Types
// =============================================================================

export interface OutfitHistoryCardProps {
  /** Outfit record from SQLite */
  outfit: LocalOutfitRecord;
  /** Card width (calculated based on screen width) */
  width: number;
  /** Style index for gradient background (0-3) */
  styleIndex?: number;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Callback when card is long-pressed (for action menu) */
  onLongPress?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

/** Gradient color sets for thumbnail backgrounds */
const GRADIENT_STYLES: [string, string][] = [
  ['#FFE5E5', '#FFD6D6'], // style1 - Pink
  ['#E5F0FF', '#D6E7FF'], // style2 - Blue
  ['#FFF5E5', '#FFE5CC'], // style3 - Orange
  ['#F0EFFF', '#E8E6FF'], // style4 - Purple
];

/** Bookmark icon color when saved */
const SAVED_COLOR = '#FF6B9D';

// =============================================================================
// Component
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OutfitHistoryCard({
  outfit,
  width,
  styleIndex = 0,
  onPress,
  onLongPress,
}: OutfitHistoryCardProps) {
  const scale = useSharedValue(1);

  // Parse style tags from JSON
  const styleTags: string[] = (() => {
    try {
      return JSON.parse(outfit.styleTagsJson) || [];
    } catch {
      return [];
    }
  })();

  // Get gradient colors based on style index
  const gradientColors = GRADIENT_STYLES[styleIndex % GRADIENT_STYLES.length];

  // Calculate thumbnail height (3:4 aspect ratio)
  const thumbnailHeight = (width * 4) / 3;

  // Press animation handlers
  const handlePressIn = () => {
    scale.value = withTiming(0.96, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, { width }, animatedStyle]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${outfit.name}，${outfit.occasion || '搭配方案'}，${formatRelativeDate(outfit.createdAt)}`}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { height: thumbnailHeight }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thumbnailGradient}
        >
          <Text style={styles.thumbnailText}>{outfit.name}</Text>
        </LinearGradient>

        {/* Saved Badge */}
        {outfit.isFavorited && (
          <View style={styles.savedBadge}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill={SAVED_COLOR}>
              <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </Svg>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.infoTop}>
          <Text style={styles.title} numberOfLines={1}>
            {outfit.name}
          </Text>
          <Text style={styles.date}>{formatRelativeDate(outfit.createdAt)}</Text>
        </View>

        {/* Mini Tags */}
        {styleTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {styleTags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.miniTag}>
                <Text style={styles.miniTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Thumbnail
  thumbnail: {
    width: '100%',
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },

  // Saved Badge
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info
  info: {
    padding: 12,
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  date: {
    fontSize: 11,
    color: '#8E8E93',
  },

  // Mini Tags
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  miniTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  miniTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3A3A3C',
  },
});
