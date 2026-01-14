/**
 * Security Settings Screen
 * Account security and authentication management
 *
 * @see HTML Prototype: ux-design/pages/05-profile/settings-security.html
 * @see Story 7.1: Correction Task #3
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '@/constants';

interface SettingsItemProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDestructive?: boolean;
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function SettingsItem({
  label,
  value,
  onPress,
  showChevron = true,
  isDestructive = false,
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
      <Text style={[styles.itemLabel, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
      <View style={styles.itemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SecuritySettingsScreen() {
  const router = useRouter();

  const handleChangePassword = () => {
    Alert.alert('修改密码', '功能开发中');
  };

  const handlePhoneNumber = () => {
    Alert.alert('手机号码', '功能开发中');
  };

  const handleWeChatBinding = () => {
    Alert.alert('微信绑定', '功能开发中');
  };

  const handleDeviceManagement = () => {
    Alert.alert('登录设备管理', '功能开发中');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '注销账号',
      '注销账号后，您的所有数据将被永久删除且无法恢复。确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认注销',
          style: 'destructive',
          onPress: () => {
            Alert.alert('提示', '功能开发中');
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>账号安全</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Change Password */}
        <SettingsGroup>
          <SettingsItem
            label="修改密码"
            onPress={handleChangePassword}
          />
        </SettingsGroup>

        {/* Phone & WeChat */}
        <SettingsGroup>
          <SettingsItem
            label="手机号码"
            value="138****8888"
            onPress={handlePhoneNumber}
          />
          <SettingsItem
            label="微信绑定"
            value="已绑定"
            onPress={handleWeChatBinding}
          />
        </SettingsGroup>

        {/* Device Management & Account Deletion */}
        <SettingsGroup>
          <SettingsItem
            label="登录设备管理"
            value="iPhone 15 Pro"
            onPress={handleDeviceManagement}
          />
          <SettingsItem
            label="注销账号"
            onPress={handleDeleteAccount}
            showChevron={true}
          />
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
  itemLabel: {
    fontSize: 16,
    color: colors.gray1,
    fontWeight: '500',
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
    fontSize: 15,
    color: colors.gray3,
  },
});
