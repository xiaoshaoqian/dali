/**
 * About Screen
 * App information, version, and legal documents
 *
 * @see HTML Prototype: ux-design/pages/05-profile/settings-about.html
 * @see Story 7.1: Correction Task #6
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
  onPress?: () => void;
  showBadge?: boolean;
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function SettingsItem({ label, onPress, showBadge }: SettingsItemProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={styles.itemRight}>
        {showBadge && <View style={styles.badge} />}
        <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
      </View>
    </TouchableOpacity>
  );
}

export default function AboutSettingsScreen() {
  const router = useRouter();

  const handleFeatureIntro = () => {
    Alert.alert(
      '功能介绍',
      '搭理 Dali - AI 智能穿搭助手\n\n• 拍照即可生成搭配方案\n• 基于身材和风格的个性化推荐\n• 搭配理论知识学习\n• 穿搭历史管理\n• 一键分享到社交平台'
    );
  };

  const handleCheckUpdate = () => {
    Alert.alert('检查更新', '当前已是最新版本 v1.0.2');
  };

  const handleUserAgreement = () => {
    Alert.alert('用户协议', '功能开发中\n\n用户协议文档将在此展示');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('隐私政策', '功能开发中\n\n隐私政策文档将在此展示');
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
        <Text style={styles.headerTitle}>关于我们</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.brandLogo}>
            <Ionicons name="shirt-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>搭理 Dali</Text>
          <Text style={styles.appVersion}>Version 1.0.2</Text>
        </View>

        {/* Features & Updates */}
        <SettingsGroup>
          <SettingsItem
            label="功能介绍"
            onPress={handleFeatureIntro}
          />
          <SettingsItem
            label="检查更新"
            onPress={handleCheckUpdate}
            showBadge={false} // Set to true when update available
          />
        </SettingsGroup>

        {/* Legal Documents */}
        <SettingsGroup>
          <SettingsItem
            label="用户协议"
            onPress={handleUserAgreement}
          />
          <SettingsItem
            label="隐私政策"
            onPress={handlePrivacyPolicy}
          />
        </SettingsGroup>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2026 Dali Inc.</Text>
          <Text style={styles.footerText}>Designed by BMad</Text>
        </View>
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
  brandSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: 15,
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
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.l,
  },
  copyright: {
    fontSize: 13,
    color: colors.gray3,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.gray3,
  },
});
