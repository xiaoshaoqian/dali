/**
 * ProfileMenuItem Component
 * Single menu item with icon, label, and chevron
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see AC#4: 快捷功能入口列表
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@/constants';

export interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

export function ProfileMenuItem({
  icon,
  label,
  onPress,
  isLast = false,
}: ProfileMenuItemProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[styles.container, isLast && styles.containerLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={colors.primary} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  containerLast: {
    borderBottomWidth: 0,
  },
  icon: {
    marginRight: spacing.m,
  },
  label: {
    flex: 1,
    fontSize: 17,
    color: colors.gray1,
  },
});

export default ProfileMenuItem;
