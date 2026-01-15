/**
 * ProfileHeader Component
 * User profile header with avatar, nickname, bio, and settings button
 * Updated to match profile-page.html prototype
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see HTML Prototype: ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import type { UserProfile } from '@/types/user';
import { colors, spacing } from '@/constants';

interface ProfileHeaderProps {
  profile: UserProfile;
  onAvatarUpdated: (avatarUrl: string) => void;
  onNicknamePress: () => void;
  onSettingsPress: () => void;
}

export function ProfileHeader({
  profile,
  onAvatarUpdated,
  onNicknamePress,
  onSettingsPress,
}: ProfileHeaderProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleAvatarPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['取消', '从相册选择', '拍照'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await pickImageFromLibrary();
          } else if (buttonIndex === 2) {
            await takePicture();
          }
        }
      );
    } else {
      Alert.alert('选择照片', '请选择获取照片的方式', [
        { text: '取消', style: 'cancel' },
        { text: '从相册选择', onPress: pickImageFromLibrary },
        { text: '拍照', onPress: takePicture },
      ]);
    }
  };

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '需要相册权限才能选择照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setIsUploading(true);
      onAvatarUpdated(imageUri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('上传失败', '请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // Get user bio or use default
  const userBio = profile.bio || '穿搭新手 · 风格探索中';

  return (
    <LinearGradient
      colors={[colors.primary, '#8578FF']}
      style={[styles.container, { paddingTop: insets.top + 10 }]}
    >
      {/* Settings Button - glassmorphism style */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
        testID="settings-button"
      >
        <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Profile Info - Centered */}
      <View style={styles.profileInfo}>
        {/* Avatar with double glow effect */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={colors.primary} />
                </View>
              )}
            </View>
          </View>
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>上传中...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Username */}
        <TouchableOpacity
          onPress={onNicknamePress}
          activeOpacity={0.8}
          testID="nickname-button"
        >
          <Text style={styles.username}>{profile.nickname}</Text>
        </TouchableOpacity>

        {/* User Bio */}
        <Text style={styles.userBio}>{userBio}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 110, // Extra space for content card overlap
    position: 'relative',
  },

  // Settings button - glassmorphism
  settingsButton: {
    position: 'absolute',
    top: 59,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20,
  },

  // Profile info centered
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },

  // Avatar with double glow effect (96px as in prototype)
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarOuter: {
    width: 104, // 96 + 8 for outer glow
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    // Double shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  // Username
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  // User bio
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ProfileHeader;
