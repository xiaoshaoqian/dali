/**
 * OccasionIcon Component
 * Renders occasion icons with optional text labels
 * Part of Story 4.2: Style Tag and Occasion Icon Display
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/03-outfit-detail/outfit-detail-page.html
 */
import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';

import { colors } from '@/constants';
import {
  HeartIcon,
  BriefcaseIcon,
  BuildingIcon,
  PeopleIcon,
  CoffeeIcon,
  HouseIcon,
} from './icons';

/**
 * Supported occasion types
 */
export type OccasionType =
  | '浪漫约会'
  | '商务会议'
  | '职场通勤'
  | '朋友聚会'
  | '日常出行'
  | '居家休闲';

/**
 * Props for OccasionIcon component
 */
export interface OccasionIconProps {
  /** The occasion type to display */
  occasion: OccasionType;
  /** Icon size in points (default: 20) */
  size?: number;
  /** Icon color (default: #6C63FF Primary Purple) */
  color?: string;
  /** Whether to show the occasion text label */
  showLabel?: boolean;
  /** Custom style for the label text */
  labelStyle?: TextStyle;
}

/**
 * Icon component mapping for each occasion type
 */
const OCCASION_ICONS: Record<OccasionType, React.ComponentType<{ size: number; color: string }>> = {
  '浪漫约会': HeartIcon,
  '商务会议': BriefcaseIcon,
  '职场通勤': BuildingIcon,
  '朋友聚会': PeopleIcon,
  '日常出行': CoffeeIcon,
  '居家休闲': HouseIcon,
};

/**
 * Accessibility labels for each occasion type
 */
const OCCASION_ACCESSIBILITY_LABELS: Record<OccasionType, string> = {
  '浪漫约会': '浪漫约会场合，心形图标',
  '商务会议': '商务会议场合，公文包图标',
  '职场通勤': '职场通勤场合，建筑图标',
  '朋友聚会': '朋友聚会场合，多人图标',
  '日常出行': '日常出行场合，咖啡杯图标',
  '居家休闲': '居家休闲场合，房屋图标',
};

/**
 * Check if a string is a valid OccasionType
 */
export function isValidOccasionType(value: string): value is OccasionType {
  return value in OCCASION_ICONS;
}

/**
 * OccasionIcon - Displays an occasion type icon with optional label
 *
 * @example
 * ```tsx
 * // Icon only
 * <OccasionIcon occasion="职场通勤" />
 *
 * // Icon with label
 * <OccasionIcon
 *   occasion="浪漫约会"
 *   showLabel
 *   size={24}
 *   color="#FF6B9D"
 * />
 * ```
 */
export function OccasionIcon({
  occasion,
  size = 20,
  color = colors.primary, // #6C63FF
  showLabel = false,
  labelStyle,
}: OccasionIconProps) {
  const IconComponent = OCCASION_ICONS[occasion];

  if (!IconComponent) {
    // Fallback for unknown occasion types - return null silently
    return null;
  }

  const accessibilityLabel = OCCASION_ACCESSIBILITY_LABELS[occasion];

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <IconComponent size={size} color={color} />
      {showLabel && (
        <Text
          style={[styles.label, { color }, labelStyle]}
          accessibilityRole="text"
        >
          {occasion}
        </Text>
      )}
    </View>
  );
}

/**
 * Get all supported occasion types
 */
export function getAllOccasionTypes(): OccasionType[] {
  return Object.keys(OCCASION_ICONS) as OccasionType[];
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
