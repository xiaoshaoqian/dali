/**
 * StyleTagChip Component
 * Renders a style or occasion tag chip
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants';

interface StyleTagChipProps {
  label: string;
  variant?: 'style' | 'occasion';
  size?: 'small' | 'medium';
}

export function StyleTagChip({
  label,
  variant = 'style',
  size = 'medium',
}: StyleTagChipProps) {
  const isStyle = variant === 'style';
  const isSmall = size === 'small';

  if (isStyle) {
    return (
      <LinearGradient
        colors={['#F0EFFF', '#E8E6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tag, isSmall && styles.tagSmall]}
      >
        <Text style={[styles.tagText, styles.styleText, isSmall && styles.tagTextSmall]}>
          {label}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.tag, styles.occasionTag, isSmall && styles.tagSmall]}>
      <Text style={[styles.tagText, styles.occasionText, isSmall && styles.tagTextSmall]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tagSmall: {
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  occasionTag: {
    backgroundColor: '#F2F2F7',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagTextSmall: {
    fontSize: 11,
  },
  styleText: {
    color: colors.primary,
  },
  occasionText: {
    color: '#3A3A3C',
  },
});
