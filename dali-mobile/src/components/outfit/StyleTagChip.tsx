/**
 * StyleTagChip Component
 * Renders style or occasion tag chips with press animation
 * Part of Story 4.2: Style Tag and Occasion Icon Display
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/02-outfit-results/outfit-results-page.html
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@/constants';

/**
 * Props for StyleTagChip component
 */
export interface StyleTagChipProps {
  /** Array of tag labels to display */
  tags: string[];
  /** Visual style variant */
  variant?: 'style' | 'occasion';
  /** Size variant: default (13pt) or compact (12pt) */
  size?: 'default' | 'compact';
  /** Callback when a tag is pressed */
  onTagPress?: (tag: string) => void;
}

/**
 * Single tag chip component with press animation
 */
interface SingleChipProps {
  label: string;
  variant: 'style' | 'occasion';
  size: 'default' | 'compact';
  onPress?: () => void;
}

function SingleChip({ label, variant, size, onPress }: SingleChipProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isStyle = variant === 'style';
  const isCompact = size === 'compact';
  const fontSize = isCompact ? 12 : 13;

  const accessibilityLabel = isStyle
    ? `风格标签：${label}`
    : `场合标签：${label}`;

  const chipContent = (
    <Text
      style={[
        styles.tagText,
        isStyle ? styles.styleText : styles.occasionText,
        { fontSize },
      ]}
    >
      {label}
    </Text>
  );

  if (isStyle) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={['#F0EFFF', '#E8E6FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tag}
          >
            {chipContent}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.tag, styles.occasionTag, animatedStyle]}>
        {chipContent}
      </Animated.View>
    </Pressable>
  );
}

/**
 * StyleTagChip - Displays an array of style or occasion tags
 *
 * @example
 * ```tsx
 * <StyleTagChip
 *   tags={['简约', '通勤', '知性']}
 *   variant="style"
 *   size="default"
 *   onTagPress={(tag) => console.log('Pressed:', tag)}
 * />
 * ```
 */
export function StyleTagChip({
  tags,
  variant = 'style',
  size = 'default',
  onTagPress,
}: StyleTagChipProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Limit to 3 tags per AC requirement
  const displayTags = tags.slice(0, 3);

  return (
    <View
      style={styles.container}
      accessibilityRole="list"
      accessibilityLabel={variant === 'style' ? '风格标签列表' : '场合标签列表'}
    >
      {displayTags.map((tag, index) => (
        <SingleChip
          key={`${tag}-${index}`}
          label={tag}
          variant={variant}
          size={size}
          onPress={onTagPress ? () => onTagPress(tag) : undefined}
        />
      ))}
    </View>
  );
}

/**
 * Legacy single-tag interface for backward compatibility
 * @deprecated Use StyleTagChip with tags array instead
 */
export interface LegacyStyleTagChipProps {
  label: string;
  variant?: 'style' | 'occasion';
  size?: 'small' | 'medium';
}

/**
 * Legacy StyleTagChip for backward compatibility
 * @deprecated Use StyleTagChip with tags array instead
 */
export function LegacyStyleTagChip({
  label,
  variant = 'style',
  size = 'medium',
}: LegacyStyleTagChipProps) {
  // Map legacy sizes to new sizes
  const newSize = size === 'small' ? 'compact' : 'default';

  return (
    <SingleChip
      label={label}
      variant={variant}
      size={newSize}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  occasionTag: {
    backgroundColor: '#F2F2F7',
  },
  tagText: {
    fontWeight: '600',
  },
  styleText: {
    color: colors.primary, // #6C63FF
  },
  occasionText: {
    color: '#3A3A3C',
  },
});
