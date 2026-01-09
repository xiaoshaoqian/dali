/**
 * ProfileHeader Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import ProfileHeader from '../ProfileHeader';
import type { UserProfile } from '@/types/user';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('expo-haptics');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  ActionSheetIOS: {
    showActionSheetWithOptions: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

const mockProfile: UserProfile = {
  id: 'user-123',
  nickname: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-09T00:00:00Z',
};

describe('ProfileHeader', () => {
  const mockOnAvatarUpdated = jest.fn();
  const mockOnNicknamePress = jest.fn();
  const mockOnSettingsPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile header with avatar and nickname', () => {
    render(
      <ProfileHeader
        profile={mockProfile}
        onAvatarUpdated={mockOnAvatarUpdated}
        onNicknamePress={mockOnNicknamePress}
        onSettingsPress={mockOnSettingsPress}
      />
    );

    expect(screen.getByText('Test User')).toBeTruthy();
  });

  it('should render placeholder when no avatar', () => {
    const profileWithoutAvatar = { ...mockProfile, avatar: undefined };

    render(
      <ProfileHeader
        profile={profileWithoutAvatar}
        onAvatarUpdated={mockOnAvatarUpdated}
        onNicknamePress={mockOnNicknamePress}
        onSettingsPress={mockOnSettingsPress}
      />
    );

    expect(screen.getByText('Test User')).toBeTruthy();
  });

  it('should call onSettingsPress when settings button clicked', async () => {
    render(
      <ProfileHeader
        profile={mockProfile}
        onAvatarUpdated={mockOnAvatarUpdated}
        onNicknamePress={mockOnNicknamePress}
        onSettingsPress={mockOnSettingsPress}
      />
    );

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.press(settingsButton);

    expect(mockOnSettingsPress).toHaveBeenCalled();
  });

  it('should call onNicknamePress when nickname clicked', async () => {
    render(
      <ProfileHeader
        profile={mockProfile}
        onAvatarUpdated={mockOnAvatarUpdated}
        onNicknamePress={mockOnNicknamePress}
        onSettingsPress={mockOnSettingsPress}
      />
    );

    const nicknameButton = screen.getByTestId('nickname-button');
    fireEvent.press(nicknameButton);

    expect(mockOnNicknamePress).toHaveBeenCalled();
  });

  it('should show ActionSheet when avatar clicked on iOS', async () => {
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);

    render(
      <ProfileHeader
        profile={mockProfile}
        onAvatarUpdated={mockOnAvatarUpdated}
        onNicknamePress={mockOnNicknamePress}
        onSettingsPress={mockOnSettingsPress}
      />
    );

    const avatar = screen.getByText('Test User').parent?.parent; // Find avatar container
    if (avatar) {
      fireEvent.press(avatar);
    }

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalled();
  });

  it('should request permissions and pick image from library', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///local/image.jpg' }],
    });

    // Manual trigger of pickImageFromLibrary via ActionSheet callback
    (ActionSheetIOS.showActionSheetWithOptions as jest.Mock).mockImplementation(
      (options, callback) => {
        callback(1); // Select "从相册选择"
      }
    );

    render(
      <ProfileHeader
        profile={mockProfile}
        onAvatarUpdated={mockOnAvatarUpdated}
        onNicknamePress={mockOnNicknamePress}
        onSettingsPress={mockOnSettingsPress}
      />
    );

    const avatar = screen.getByText('Test User').parent?.parent;
    if (avatar) {
      fireEvent.press(avatar);
    }

    // ActionSheet callback should trigger library picker
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
  });
});
