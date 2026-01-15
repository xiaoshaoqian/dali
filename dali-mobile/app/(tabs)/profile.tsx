/**
 * Profile Screen (我的)
 * User profile with stats and grouped menu
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see HTML Prototype: ux-design/pages/05-profile/profile-page.html
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
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile();

  const {
    data: stats,
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
    } catch {
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
    } catch {
      Alert.alert('更新失败', '请重试');
    }
  };

  // Settings handler
  const handleSettings = () => {
    router.push('/settings');
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

  // Error state
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
        {/* Purple Gradient Header with Avatar */}
        <ProfileHeader
          profile={profile}
          onAvatarUpdated={handleAvatarUpdated}
          onNicknamePress={() => setIsNicknameModalVisible(true)}
          onSettingsPress={handleSettings}
        />

        {/* White Content Card - overlaps header */}
        <View style={styles.contentCard}>
          {/* Stats Grid 2x1 */}
          {stats && <ProfileStats stats={stats} />}

          {/* Grouped Menu List */}
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -100, // Overlap with header as in prototype
    paddingTop: 24,
    paddingHorizontal: spacing.l,
    paddingBottom: 100,
    position: 'relative',
    // Match prototype shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 5,
  },
  menuSection: {
    marginTop: spacing.xl,
  },
});
