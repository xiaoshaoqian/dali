/**
 * SelectableChip Component
 * Reusable chip component for style and occasion selection
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface SelectableChipProps {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function SelectableChip({
  label,
  icon,
  selected,
  onPress,
  disabled = false,
}: SelectableChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray5,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.gray1,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
