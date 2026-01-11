/**
 * PreferencesReminderBanner Component
 * Displays reminder banner when preferences haven't been updated in 30+ days
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#9: Preferences Update Reminder
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius } from '@/constants';

interface PreferencesReminderBannerProps {
  onPress: () => void;
  onDismiss: () => void;
}

export function PreferencesReminderBanner({
  onPress,
  onDismiss,
}: PreferencesReminderBannerProps): React.ReactElement {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      testID="preferences-reminder-banner"
      accessibilityRole="button"
      accessibilityLabel="更新风格档案提醒"
      accessibilityHint="点击更新你的风格偏好"
    >
      <View style={styles.iconContainer}>
        <Ionicons name="color-palette" size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>更新你的风格档案</Text>
        <Text style={styles.subtitle}>你的偏好可能改变了，去更新吧</Text>
      </View>
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="关闭提醒"
      >
        <Ionicons name="close" size={20} color={colors.gray3} />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={20} color={colors.gray3} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.large,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray2,
  },
  dismissButton: {
    padding: spacing.xs,
    marginRight: spacing.s,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});
