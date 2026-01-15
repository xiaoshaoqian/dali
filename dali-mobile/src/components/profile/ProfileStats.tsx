/**
 * ProfileStats Component
 * User statistics grid with outfit count and favorites
 * Updated to match profile-page.html prototype - 2x1 grid layout
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see HTML Prototype: ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { UserStats } from '@/types/user';
import { colors, spacing } from '@/constants';

interface ProfileStatsProps {
  stats: UserStats;
}

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  iconBgColor: string;
  iconColor: string;
}

function StatItem({ icon, value, label, iconBgColor, iconColor }: StatItemProps): React.ReactElement {
  return (
    <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
      <View style={[styles.iconBg, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ProfileStats({ stats }: ProfileStatsProps): React.ReactElement {
  return (
    <View style={styles.container}>
      {/* 搭配总数 */}
      <StatItem
        icon="shirt-outline"
        value={stats.totalOutfits}
        label="搭配"
        iconBgColor="rgba(108, 99, 255, 0.1)"
        iconColor="#6C63FF"
      />
      {/* 收藏喜爱 */}
      <StatItem
        icon="heart-outline"
        value={stats.favoriteCount}
        label="收藏"
        iconBgColor="rgba(255, 149, 0, 0.1)"
        iconColor="#FF9500"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
});

export default ProfileStats;
