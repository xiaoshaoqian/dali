/**
 * Help & Feedback Screen
 * FAQ and feedback submission
 *
 * @see HTML Prototype: ux-design/pages/05-profile/settings-help.html
 * @see Story 7.1: Correction Task #5
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
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function SettingsItem({ label, onPress }: SettingsItemProps) {
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
        <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
      </View>
    </TouchableOpacity>
  );
}

export default function HelpSettingsScreen() {
  const router = useRouter();

  const handleAITryOn = () => {
    Alert.alert(
      '如何使用 AI 试穿？',
      '1. 上传您的单品照片\n2. 选择适合的场合\n3. 等待 AI 生成搭配方案\n4. 查看推荐的搭配效果'
    );
  };

  const handleInaccurateRecommendations = () => {
    Alert.alert(
      '搭配建议不准确怎么办？',
      '您可以：\n1. 更新您的身材类型和风格偏好\n2. 对搭配方案进行点赞或收藏，AI 会学习您的喜好\n3. 重新生成搭配方案\n4. 联系我们反馈问题'
    );
  };

  const handleModifyBodyData = () => {
    Alert.alert(
      '如何修改身材数据？',
      '进入"我的" → "设置" → "身体数据"，即可更新您的身材类型、身高、体重等信息。'
    );
  };

  const handleFeedback = () => {
    Alert.alert('意见反馈', '功能开发中\n\n您可以通过邮箱联系我们：feedback@dali.com');
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
        <Text style={styles.headerTitle}>帮助与反馈</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ */}
        <Text style={styles.sectionHeader}>常见问题</Text>
        <SettingsGroup>
          <SettingsItem
            label="如何使用 AI 试穿？"
            onPress={handleAITryOn}
          />
          <SettingsItem
            label="搭配建议不准确怎么办？"
            onPress={handleInaccurateRecommendations}
          />
          <SettingsItem
            label="如何修改身材数据？"
            onPress={handleModifyBodyData}
          />
        </SettingsGroup>

        {/* Contact Us */}
        <Text style={styles.sectionHeader}>联系我们</Text>
        <SettingsGroup>
          <SettingsItem
            label="意见反馈"
            onPress={handleFeedback}
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
  sectionHeader: {
    fontSize: 13,
    color: colors.gray2,
    marginLeft: 4,
    marginBottom: spacing.xs,
    marginTop: spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});
