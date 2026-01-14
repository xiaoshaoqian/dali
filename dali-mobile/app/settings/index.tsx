/**
 * Settings Screen
 * Main settings page with hierarchical navigation
 *
 * @see HTML Prototype: ux-design/pages/05-profile/settings-page.html
 * @see Story 7.1: Correction Task #2
 */
import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, spacing } from '@/constants';
import { useAuthStore } from '@/stores';
import { useUserProfile } from '@/hooks';

// Storage keys for settings persistence
const STORAGE_KEYS = {
  NOTIFICATIONS: '@settings/notifications_enabled',
  DARK_MODE: '@settings/dark_mode_enabled',
};

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
}: SettingsItemProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        {icon}
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {typeof value === 'string' ? (
          <Text style={styles.itemValue}>{value}</Text>
        ) : (
          value
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function IconBox({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <View style={[styles.iconBox, { backgroundColor: color }]}>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { data: profile } = useUserProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [notifications, darkMode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
      ]);

      if (notifications !== null) {
        setNotificationsEnabled(notifications === 'true');
      }
      if (darkMode !== null) {
        setDarkModeEnabled(darkMode === 'true');
      }
    } catch {
      // Silently fail - use defaults
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(value);
    // Persist to storage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, value.toString());
    } catch {
      // Silently fail
    }
  };

  const handleToggleDarkMode = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDarkModeEnabled(value);
    // Persist to storage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, value.toString());
    } catch {
      // Silently fail
    }
    // TODO: Apply theme changes globally when theme system is implemented
  };

  const handleProfileEdit = () => {
    Alert.alert('账号与资料设置', '将跳转到个人资料编辑页面');
  };

  const handleBodyData = () => {
    Alert.alert('我的身材数据', '将跳转到身体数据管理页面\n\n您可以在此更新身材类型和测量数据');
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出当前账号吗?', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Clear authentication state
          logout();
          // Navigate to login
          router.replace('/(auth)/phone-login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#6C63FF', '#8578FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Edit Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={handleProfileEdit}
          activeOpacity={0.7}
        >
          <View style={styles.miniAvatar}>
            <Ionicons name="person" size={30} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.nickname || '用户'}</Text>
            <Text style={styles.profileDesc}>账号与资料设置</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
        </TouchableOpacity>

        {/* Group 1: Account & Body */}
        <SettingsGroup>
          <SettingsItem
            icon={
              <IconBox color="#e736fe">
                <Ionicons name="shirt-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="我的身材数据"
            value="165cm / 48kg"
            onPress={handleBodyData}
          />
          <SettingsItem
            icon={
              <IconBox color="#007AFF">
                <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="账号安全"
            onPress={() => router.push('./security')}
          />
          <SettingsItem
            icon={
              <IconBox color="#34C759">
                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="隐私设置"
            onPress={() => router.push('./privacy')}
          />
        </SettingsGroup>

        {/* Group 2: Preferences */}
        <SettingsGroup>
          <SettingsItem
            icon={
              <IconBox color="#FF9500">
                <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="新消息通知"
            value={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5EA"
              />
            }
            showChevron={false}
          />
          <SettingsItem
            icon={
              <IconBox color="#1C1C1E">
                <Ionicons name="moon-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="深色模式"
            value={
              <Switch
                value={darkModeEnabled}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5EA"
              />
            }
            showChevron={false}
          />
        </SettingsGroup>

        {/* Group 3: Support */}
        <SettingsGroup>
          <SettingsItem
            icon={
              <IconBox color="#5856D6">
                <Ionicons name="help-circle-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="帮助与反馈"
            onPress={() => router.push('./help')}
          />
          <SettingsItem
            icon={
              <IconBox color="#8E8E93">
                <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" />
              </IconBox>
            }
            label="关于我们"
            value="v1.0.2"
            onPress={() => router.push('./about')}
          />
        </SettingsGroup>

        {/* Logout */}
        <SettingsGroup>
          <TouchableOpacity
            style={styles.logoutItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },
  header: {
    paddingTop: 59,
    paddingBottom: 16,
    paddingHorizontal: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: spacing.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
    elevation: 2,
  },
  miniAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.1)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: 4,
  },
  profileDesc: {
    fontSize: 13,
    color: colors.gray3,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: colors.gray1,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  itemValue: {
    fontSize: 15,
    color: colors.gray3,
  },
  logoutItem: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
