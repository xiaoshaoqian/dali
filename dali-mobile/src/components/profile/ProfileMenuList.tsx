/**
 * ProfileMenuList Component
 * List of profile menu items (favorites, shares, style profile, settings)
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see AC#4: 快捷功能入口列表
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ProfileMenuItem from './ProfileMenuItem';
import { spacing } from '@/constants';

export function ProfileMenuList(): React.ReactElement {
  const router = useRouter();

  const handleMyFavorites = () => {
    // Navigate to history with favorite filter
    router.push('/(tabs)/history?filter=favorites');
  };

  const handleShareHistory = () => {
    // TODO: Navigate to share history page (Story 7.2)
    alert('提示: 分享记录功能即将上线');
  };

  const handleStyleProfile = () => {
    // Navigate to style profile page (Story 7.3)
    router.push('/style-profile');
  };

  const handleSettings = () => {
    // Navigate to settings page (app/settings/index.tsx)
    router.push('/settings/');
  };

  return (
    <View style={styles.container}>
      <ProfileMenuItem icon="star" label="我的收藏" onPress={handleMyFavorites} />
      <ProfileMenuItem
        icon="share-social-outline"
        label="分享记录"
        onPress={handleShareHistory}
      />
      <ProfileMenuItem
        icon="color-palette-outline"
        label="风格档案"
        onPress={handleStyleProfile}
      />
      <ProfileMenuItem
        icon="settings-outline"
        label="设置"
        onPress={handleSettings}
        isLast
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.l,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default ProfileMenuList;
