/**
 * ProfileMenuList Component
 * Grouped menu list for profile page (我的档案 + 账户)
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see HTML Prototype: ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, spacing } from '@/constants';

interface MenuItemData {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconBgColor: string;
  iconColor: string;
  route: string;
}

interface MenuGroupProps {
  title: string;
  items: MenuItemData[];
}

function MenuGroup({ title, items }: MenuGroupProps): React.ReactElement {
  const router = useRouter();

  const handlePress = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  };

  return (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.group}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              index === items.length - 1 && styles.menuItemLast,
            ]}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.iconBgColor }]}>
              <Ionicons name={item.icon} size={20} color={item.iconColor} />
            </View>
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function ProfileMenuList(): React.ReactElement {
  // Group 1: 我的档案
  const archiveItems: MenuItemData[] = [
    {
      icon: 'person-outline',
      label: '身材档案',
      iconBgColor: 'rgba(108, 99, 255, 0.1)',
      iconColor: '#6C63FF',
      route: '/body-profile',
    },
    {
      icon: 'star-outline',
      label: '风格档案',
      iconBgColor: 'rgba(255, 45, 85, 0.1)',
      iconColor: '#FF2D55',
      route: '/style-profile',
    },
  ];

  // Group 2: 账户
  const accountItems: MenuItemData[] = [
    {
      icon: 'settings-outline',
      label: '设置',
      iconBgColor: 'rgba(142, 142, 147, 0.1)',
      iconColor: '#8E8E93',
      route: '/settings',
    },
  ];

  return (
    <View style={styles.container}>
      <MenuGroup title="我的档案" items={archiveItems} />
      <MenuGroup title="账户" items={accountItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  groupContainer: {
    gap: spacing.s,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray3,
    paddingLeft: 12,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray1,
  },
});

export default ProfileMenuList;
