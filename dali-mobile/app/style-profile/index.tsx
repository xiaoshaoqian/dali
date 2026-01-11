/**
 * Style Profile Screen (风格档案)
 * Displays user's style preferences in a word cloud visualization
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#1: Style Profile Page Entry
 * @see AC#2: PreferenceCloud Word Cloud Rendering
 * @see AC#6: Tag Click to View Related Outfits
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { PreferenceCloud } from '@/components/ui';
import { usePreferences, transformToCloudTags } from '@/hooks';
import { colors, spacing } from '@/constants';

export default function StyleProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch user preferences
  const { data: preferences, isLoading } = usePreferences();

  // Transform preferences to cloud tags format
  const cloudTags = transformToCloudTags(preferences);

  // Handle back button press
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle edit button press (AC#1)
  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/edit-preferences');
  };

  // Handle tag press - navigate to filtered outfits (AC#6)
  const handleTagPress = (tag: string) => {
    router.push({
      pathname: '/(tabs)/history',
      params: { filter: tag },
    });
  };

  return (
    <View style={styles.container} testID="style-profile-screen">
      <StatusBar barStyle="light-content" />

      {/* Purple Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        {/* Header Navigation */}
        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleBack}
            testID="back-button"
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
            accessibilityRole="header"
          >
            我的风格档案
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleEdit}
            testID="edit-button"
            accessibilityRole="button"
            accessibilityLabel="编辑风格偏好"
          >
            <Text style={styles.editButtonText}>编辑</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer} testID="loading-indicator">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <View style={styles.cloudContainer}>
            {/* Section Title */}
            <Text style={styles.sectionTitle}>我的风格偏好</Text>
            <Text style={styles.sectionSubtitle}>
              点击标签查看相关搭配，大字为你主动选择，小字为 AI 推断
            </Text>

            {/* Preference Cloud */}
            <PreferenceCloud
              preferences={cloudTags}
              onTagPress={handleTagPress}
            />

            {/* Body Type Card */}
            {preferences?.bodyType && (
              <View style={styles.bodyTypeCard}>
                <Text style={styles.bodyTypeLabel}>我的身材类型</Text>
                <Text style={styles.bodyTypeValue}>{preferences.bodyType}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },
  header: {
    paddingBottom: spacing.l,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.l,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 14,
    color: colors.gray3,
  },
  cloudContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.gray3,
    marginBottom: spacing.l,
    lineHeight: 18,
  },
  bodyTypeCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.l,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  bodyTypeLabel: {
    fontSize: 13,
    color: colors.gray2,
    marginBottom: spacing.xs,
  },
  bodyTypeValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
});
