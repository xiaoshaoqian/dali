/**
 * BodyTypeCard Component
 * Selectable card for body type selection in onboarding
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

import type { BodyTypeOption } from './types';

interface BodyTypeCardProps {
  option: BodyTypeOption;
  selected: boolean;
  onPress: () => void;
}

export function BodyTypeCard({ option, selected, onPress }: BodyTypeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{option.icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
      <Text style={styles.description}>{option.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.gray5,
    borderRadius: borderRadius.large,
    padding: spacing.m,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: spacing.m,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.s,
  },
  label: {
    ...typography.headline,
    color: colors.gray1,
    marginBottom: spacing.xs,
  },
  labelSelected: {
    color: colors.primary,
  },
  description: {
    ...typography.caption1,
    color: colors.gray2,
    textAlign: 'center',
  },
});
