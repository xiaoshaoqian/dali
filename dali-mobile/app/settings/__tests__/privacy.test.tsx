/**
 * Privacy Settings Screen Tests
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import PrivacySettingsScreen from '../privacy';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('PrivacySettingsScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  describe('render', () => {
    it('should render privacy settings screen correctly', () => {
      const { getByText } = render(<PrivacySettingsScreen />);

      expect(getByText('隐私设置')).toBeTruthy();
    });

    it('should display all privacy options', () => {
      const { getByText } = render(<PrivacySettingsScreen />);

      expect(getByText('相机权限')).toBeTruthy();
      expect(getByText('照片访问')).toBeTruthy();
      expect(getByText('个性化推荐')).toBeTruthy();
    });

    it('should display system permissions group', () => {
      const { getByText } = render(<PrivacySettingsScreen />);

      expect(getByText('相机权限')).toBeTruthy();
      expect(getByText('照片访问')).toBeTruthy();
    });
  });

  describe('personalized recommendations toggle', () => {
    it('should toggle personalized recommendations setting', async () => {
      const { getAllByRole } = render(<PrivacySettingsScreen />);

      const switches = getAllByRole('switch');
      const recommendationsSwitch = switches[0];

      // Default is true
      expect(recommendationsSwitch.props.value).toBe(true);

      fireEvent(recommendationsSwitch, 'valueChange', false);

      await waitFor(() => {
        expect(recommendationsSwitch.props.value).toBe(false);
      });
    });
  });

  describe('permission interactions', () => {
    it('should show alert when camera permission pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<PrivacySettingsScreen />);

      fireEvent.press(getByText('相机权限'));

      expect(alertSpy).toHaveBeenCalledWith(
        '相机权限',
        expect.any(String)
      );
    });

    it('should show alert when photo permission pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<PrivacySettingsScreen />);

      fireEvent.press(getByText('照片访问'));

      expect(alertSpy).toHaveBeenCalledWith(
        '照片访问',
        expect.any(String)
      );
    });
  });
});
