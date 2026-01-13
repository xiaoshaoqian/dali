/**
 * Profile Screen (我的)
 * User profile with stats and quick action menu
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see Story 8.3: Network Reconnection and Auto-Sync (AC#12)
 * @see ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  ProfileHeader,
  ProfileStats,
  ProfileMenuList,
  EditNicknameModal,
  AILearningSection,
  PreferencesReminderBanner,
  SyncStatusSection,
} from '@/components/profile';
import { Toast } from '@/components/ui';
import {
  useUserProfile,
  useUserStats,
  useUpdateUserProfile,
  useUploadAvatar,
  usePreferences,
  usePreferencesNeedUpdate,
  useNetworkSync,
} from '@/hooks';
import { colors, spacing } from '@/constants';

/** Toast duration for progress improvement notification (AC#8) */
const PROGRESS_TOAST_DURATION = 3000;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isNicknameModalVisible, setIsNicknameModalVisible] = React.useState(false);
  const [isProgressToastVisible, setIsProgressToastVisible] = React.useState(false);
  const [isReminderDismissed, setIsReminderDismissed] = React.useState(false);

  // Fetch profile and stats
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile();

  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useUserStats();

  // Fetch preferences for reminder check (AC#9)
  const { data: preferences } = usePreferences();
  const showPreferencesReminder = usePreferencesNeedUpdate(preferences?.updatedAt) && !isReminderDismissed;

  // Sync status hook (Story 8.3: AC#12)
  const { triggerSync } = useNetworkSync();

  // Mutations
  const updateProfileMutation = useUpdateUserProfile();
  const uploadAvatarMutation = useUploadAvatar();

  // Refresh control
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProfile(), refetchStats()]);
    setIsRefreshing(false);
  };

  // Avatar upload handler
  const handleAvatarUpdated = async (imageUri: string) => {
    try {
      await uploadAvatarMutation.mutateAsync(imageUri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('成功', '头像已更新');
    } catch (error) {
      // Error handled by Alert, can be logged to Sentry in production
      Alert.alert('上传失败', '请重试');
    }
  };

  // Nickname update handler
  const handleNicknameSave = async (nickname: string) => {
    try {
      await updateProfileMutation.mutateAsync({ nickname });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsNicknameModalVisible(false);
      Alert.alert('成功', '昵称已更新');
    } catch (error) {
      // Error handled by Alert, can be logged to Sentry in production
      Alert.alert('更新失败', '请重试');
    }
  };

  // Settings handler
  const handleSettings = () => {
    router.push('/settings');
  };

  // Progress improvement handler (AC#8)
  const handleProgressImprovement = () => {
    setIsProgressToastVisible(true);
  };

  // Toast dismiss handler
  const handleProgressToastDismiss = () => {
    setIsProgressToastVisible(false);
  };

  // Preferences reminder handlers (AC#9)
  const handlePreferencesReminderPress = () => {
    router.push('/edit-preferences');
  };

  const handlePreferencesReminderDismiss = () => {
    setIsReminderDismissed(true);
  };

  // Manual sync handler (Story 8.3: AC#12)
  const handleManualSync = async () => {
    await triggerSync();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Loading state
  if (isProfileLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  // Error state - show error message with retry button
  if (profileError || !profile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>无法加载个人信息</Text>
          <Text style={styles.errorMessage}>
            {profileError ? String(profileError) : '请确认您已登录'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={[colors.primary]}
          />
        }
      >
        {/* Purple Header with Avatar */}
        <ProfileHeader
          profile={profile}
          onAvatarUpdated={handleAvatarUpdated}
          onNicknamePress={() => setIsNicknameModalVisible(true)}
          onSettingsPress={handleSettings}
        />

        {/* White Content Card */}
        <View style={styles.contentCard}>
          {/* Stats Card - Floating above */}
          {stats && <ProfileStats stats={stats} />}

          {/* AI Learning Progress Section */}
          {stats && (
            <AILearningSection
              aiAccuracy={stats.aiAccuracy}
              totalOutfits={stats.totalOutfits}
              favoriteCount={stats.favoriteCount}
              onProgressImprovement={handleProgressImprovement}
            />
          )}

          {/* Preferences Update Reminder (AC#9) */}
          {showPreferencesReminder && (
            <PreferencesReminderBanner
              onPress={handlePreferencesReminderPress}
              onDismiss={handlePreferencesReminderDismiss}
            />
          )}

          {/* Sync Status Section (Story 8.3: AC#12) */}
          <SyncStatusSection onSyncPress={handleManualSync} />

          {/* Menu List */}
          <View style={styles.menuSection}>
            <ProfileMenuList />
          </View>
        </View>
      </ScrollView>

      {/* Edit Nickname Modal */}
      <EditNicknameModal
        visible={isNicknameModalVisible}
        currentNickname={profile.nickname}
        onSave={handleNicknameSave}
        onCancel={() => setIsNicknameModalVisible(false)}
        isLoading={updateProfileMutation.isPending}
      />

      {/* Progress Improvement Toast (AC#8) */}
      <Toast
        message="你的风格档案更完善了 🎉"
        type="success"
        duration={PROGRESS_TOAST_DURATION}
        visible={isProgressToastVisible}
        onDismiss={handleProgressToastDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: spacing.m,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.gray2,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -60,
    paddingTop: 100, // Space for floating stats card
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    position: 'relative',
  },
  menuSection: {
    marginTop: spacing.l,
  },
});
