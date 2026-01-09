/**
 * ProfileStats Component
 * User statistics card with outfit count, favorites, and shares
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see AC#2: 统计数据卡片
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { UserStats } from '@/types/user';
import { colors, spacing, borderRadius, shadows } from '@/constants';

interface ProfileStatsProps {
  stats: UserStats;
}

interface StatItemProps {
  icon: string;
  value: number;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps): React.ReactElement {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProfileStats({ stats }: ProfileStatsProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <StatItem icon="✨" value={stats.totalOutfits} label="生成次数" />
      <StatItem icon="⭐" value={stats.favoriteCount} label="收藏数量" />
      <StatItem icon="↗️" value={stats.shareCount} label="分享次数" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -80, // Float above header
    left: spacing.l,
    right: spacing.l,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xlarge,
    padding: spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...shadows.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray3,
  },
});

export default ProfileStats;
