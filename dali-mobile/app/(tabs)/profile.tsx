/**
 * Profile Screen (我的)
 * User profile with stats and quick action menu
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import {
  View,
  ScrollView,
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
} from '@/components/profile';
import {
  useUserProfile,
  useUserStats,
  useUpdateUserProfile,
  useUploadAvatar,
} from '@/hooks';
import { colors, spacing } from '@/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isNicknameModalVisible, setIsNicknameModalVisible] = React.useState(false);

  // Fetch profile and stats
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useUserProfile();

  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useUserStats();

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

  // Loading state
  if (isProfileLoading || !profile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
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
