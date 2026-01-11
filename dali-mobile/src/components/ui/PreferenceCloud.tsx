/**
 * PreferenceCloud Component
 * Word cloud visualization for user style preferences
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#2: PreferenceCloud Word Cloud Rendering
 *
 * Features:
 * - Displays user preferences as a word cloud
 * - User-selected tags: 18pt Bold, purple (#6C63FF)
 * - AI-inferred tags: 14pt Regular, gray (#8E8E93)
 * - High weight tags are larger and positioned centrally
 * - Tags are clickable with haptic feedback
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, spacing } from '@/constants';

// =============================================================================
// Types
// =============================================================================

export interface PreferenceTag {
  /** Tag text */
  tag: string;
  /** Weight (0-1) determining size and position */
  weight: number;
  /** Tag type: user-selected or AI-inferred */
  type: 'user' | 'inferred';
}

export interface PreferenceCloudProps {
  /** Array of preference tags with weights */
  preferences: PreferenceTag[];
  /** Callback when a tag is pressed */
  onTagPress?: (tag: string) => void;
  /** Custom container style */
  style?: object;
}

// =============================================================================
// Constants
// =============================================================================

/** Font size range for tags (min-max in points) */
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 24;

/** Font sizes by type */
const USER_TAG_FONT_SIZE = 18;
const INFERRED_TAG_FONT_SIZE = 14;

/** Tag padding */
const TAG_PADDING_H = 12;
const TAG_PADDING_V = 6;

/** Layout constants */
const CLOUD_PADDING = 16;
const TAG_MARGIN = 6;
const MIN_CLOUD_HEIGHT = 200;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate font size based on weight
 * Linear interpolation between FONT_SIZE_MIN and FONT_SIZE_MAX
 */
function calculateFontSize(weight: number, type: 'user' | 'inferred'): number {
  // Base size by type
  const baseSize = type === 'user' ? USER_TAG_FONT_SIZE : INFERRED_TAG_FONT_SIZE;

  // Scale by weight (0.8 - 1.2 multiplier)
  const weightMultiplier = 0.8 + weight * 0.4;

  // Clamp to min/max
  const calculatedSize = baseSize * weightMultiplier;
  return Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, calculatedSize));
}

/**
 * Simple word cloud layout algorithm
 * Positions tags in rows, centered, with high-weight tags toward center
 */
interface PositionedTag extends PreferenceTag {
  fontSize: number;
  row: number;
  offsetX: number;
}

function layoutTags(
  preferences: PreferenceTag[],
  containerWidth: number
): PositionedTag[] {
  if (preferences.length === 0) return [];

  // Sort by weight (highest first) for central positioning
  const sortedTags = [...preferences].sort((a, b) => b.weight - a.weight);

  // Calculate font sizes
  const tagsWithSize = sortedTags.map((pref) => ({
    ...pref,
    fontSize: calculateFontSize(pref.weight, pref.type),
  }));

  // Available width for tags
  const availableWidth = containerWidth - CLOUD_PADDING * 2;

  // Layout in rows
  const rows: Array<Array<typeof tagsWithSize[0]>> = [];
  let currentRow: Array<typeof tagsWithSize[0]> = [];
  let currentRowWidth = 0;

  tagsWithSize.forEach((tag) => {
    // Estimate tag width (font size * characters + padding)
    const estimatedWidth = tag.fontSize * tag.tag.length * 0.6 + TAG_PADDING_H * 2;

    if (currentRowWidth + estimatedWidth + TAG_MARGIN > availableWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [tag];
      currentRowWidth = estimatedWidth;
    } else {
      currentRow.push(tag);
      currentRowWidth += estimatedWidth + TAG_MARGIN;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Convert to positioned tags
  const positionedTags: PositionedTag[] = [];

  rows.forEach((row, rowIndex) => {
    row.forEach((tag, tagIndex) => {
      positionedTags.push({
        ...tag,
        row: rowIndex,
        offsetX: tagIndex,
      });
    });
  });

  return positionedTags;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PreferenceCloud - Word cloud visualization for style preferences
 */
export function PreferenceCloud({
  preferences,
  onTagPress,
  style,
}: PreferenceCloudProps): React.ReactElement {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - spacing.l * 2;

  // Layout tags
  const positionedTags = useMemo(
    () => layoutTags(preferences, containerWidth),
    [preferences, containerWidth]
  );

  // Group by row for rendering
  const rows = useMemo(() => {
    const rowMap = new Map<number, PositionedTag[]>();
    positionedTags.forEach((tag) => {
      const existing = rowMap.get(tag.row) || [];
      rowMap.set(tag.row, [...existing, tag]);
    });
    return Array.from(rowMap.values());
  }, [positionedTags]);

  // Handle tag press with haptic feedback
  const handleTagPress = (tag: string) => {
    // Fire haptic feedback (non-blocking)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTagPress?.(tag);
  };

  return (
    <View
      style={[styles.container, style]}
      testID="preference-cloud"
      accessibilityRole="list"
      accessibilityLabel="风格偏好词云"
    >
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((tag) => (
            <TouchableOpacity
              key={tag.tag}
              testID={`tag-${tag.tag}`}
              style={[
                styles.tag,
                tag.type === 'user' ? styles.userTag : styles.inferredTag,
              ]}
              onPress={() => handleTagPress(tag.tag)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${tag.tag}, ${tag.type === 'user' ? '用户选择' : 'AI推断'}的偏好标签`}
            >
              <Text
                style={[
                  styles.tagText,
                  tag.type === 'user' ? styles.userTagText : styles.inferredTagText,
                  { fontSize: tag.fontSize },
                ]}
              >
                {tag.tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_CLOUD_HEIGHT,
    padding: CLOUD_PADDING,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: TAG_MARGIN / 2,
  },
  tag: {
    paddingHorizontal: TAG_PADDING_H,
    paddingVertical: TAG_PADDING_V,
    borderRadius: 16,
    marginHorizontal: TAG_MARGIN / 2,
    marginVertical: TAG_MARGIN / 2,
  },
  userTag: {
    backgroundColor: colors.primaryTransparent,
  },
  inferredTag: {
    backgroundColor: colors.gray4,
  },
  tagText: {
    fontWeight: '500',
  },
  userTagText: {
    color: colors.primary,
    fontWeight: '700',
  },
  inferredTagText: {
    color: '#8E8E93',
    fontWeight: '400',
  },
});

// Note: Only named export is used (via ui/index.ts barrel)
