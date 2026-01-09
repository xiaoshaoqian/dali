/**
 * Settings Screen
 * User settings and preferences
 *
 * @see Story 7.1 AC#8: 设置页面导航
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius } from '@/constants';
// TODO: Integrate actual auth when auth system is implemented
// import { useAuth } from '@/hooks/useAuth';

interface SettingsItemProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDestructive?: boolean;
  rightElement?: React.ReactNode;
}

function SettingsSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingsItem({
  label,
  value,
  onPress,
  showChevron = true,
  isDestructive = false,
  rightElement,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <Text style={[styles.itemLabel, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
      <View style={styles.itemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {rightElement}
        {showChevron && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  // const { signOut } = useAuth(); // TODO: Integrate actual auth

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出当前账号吗?', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // await signOut();
          router.replace('/(auth)/login'); // Assuming this route exists
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Security */}
      <SettingsSection title="账号安全">
        <SettingsItem
          label="修改手机号"
          value="138****8888"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
        <SettingsItem
          label="绑定微信"
          value="已绑定"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
      </SettingsSection>

      {/* Privacy Settings */}
      <SettingsSection title="隐私设置">
        <SettingsItem
          label="数据管理"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
        <SettingsItem
          label="权限管理"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
      </SettingsSection>

      {/* Help & Feedback */}
      <SettingsSection title="帮助反馈">
        <SettingsItem
          label="常见问题"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
        <SettingsItem
          label="问题反馈"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="关于我们">
        <SettingsItem
          label="版本信息"
          value="v1.0.0"
          showChevron={false}
        />
        <SettingsItem
          label="用户协议"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
         <SettingsItem
          label="隐私政策"
          onPress={() => Alert.alert('提示', '功能开发中')}
        />
      </SettingsSection>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Dali AI Wardrobe</Text>
        <Text style={styles.footerText}>Designed by BMad</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
    paddingVertical: spacing.l,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.gray2,
    marginLeft: spacing.l,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  itemLabel: {
    fontSize: 16,
    color: colors.gray1,
  },
  destructiveLabel: {
    color: colors.error,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  itemValue: {
    fontSize: 16,
    color: colors.gray3,
  },
  logoutSection: {
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  footerText: {
    fontSize: 12,
    color: colors.gray3,
    marginBottom: 4,
  },
});
