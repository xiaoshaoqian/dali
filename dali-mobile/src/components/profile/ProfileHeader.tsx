/**
 * ProfileHeader Component
 * User profile header with avatar, nickname, and settings button
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see AC#1: 个人页面头部布局
 * @see AC#5: 头像编辑功能
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
      // Android: 直接显示Alert选择
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
      // Pass image URI to parent component which handles actual upload via useUploadAvatar hook
      onAvatarUpdated(imageUri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Error will be handled by parent component, display user-friendly message
      Alert.alert('上传失败', '请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.primary, '#8578FF']} style={styles.container}>
      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
        testID="settings-button"
      >
        <Ionicons name="settings" size={24} color="#FFFFFF" testID="settings-icon" />
      </TouchableOpacity>

      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        disabled={isUploading}
        activeOpacity={0.8}
      >
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={colors.gray3} />
          </View>
        )}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <Text style={styles.uploadingText}>上传中...</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nickname */}
      <TouchableOpacity
        style={styles.nicknameContainer}
        onPress={onNicknamePress}
        activeOpacity={0.8}
        testID="nickname-button"
      >
        <Text style={styles.nickname}>{profile.nickname}</Text>
        <Ionicons name="pencil" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60, // Space for status bar + margin
    paddingBottom: 100, // Extra space for floating stats card
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: spacing.l,
    padding: spacing.s,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: spacing.m,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nickname: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileHeader;
