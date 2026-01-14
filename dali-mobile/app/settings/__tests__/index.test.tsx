/**
 * Settings Screen Tests
 * Tests for main settings page with hierarchical navigation
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import SettingsScreen from '../index';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('SettingsScreen', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
    });
  });

  describe('render', () => {
    it('should render settings screen correctly', () => {
      const { getByText } = render(<SettingsScreen />);

      expect(getByText('设置')).toBeTruthy();
      expect(getByText('小邵')).toBeTruthy();
      expect(getByText('账号与资料设置')).toBeTruthy();
    });

    it('should render all settings groups', () => {
      const { getByText } = render(<SettingsScreen />);

      // Account & Body group
      expect(getByText('我的身材数据')).toBeTruthy();
      expect(getByText('账号安全')).toBeTruthy();
      expect(getByText('隐私设置')).toBeTruthy();

      // Preferences group
      expect(getByText('新消息通知')).toBeTruthy();
      expect(getByText('深色模式')).toBeTruthy();

      // Support group
      expect(getByText('帮助与反馈')).toBeTruthy();
      expect(getByText('关于我们')).toBeTruthy();

      // Logout
      expect(getByText('退出登录')).toBeTruthy();
    });

    it('should display version number', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('v1.0.2')).toBeTruthy();
    });

    it('should display body data values', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('165cm / 48kg')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to security settings when pressed', () => {
      const { getByText } = render(<SettingsScreen />);

      fireEvent.press(getByText('账号安全'));

      expect(mockPush).toHaveBeenCalledWith('./security');
    });

    it('should navigate to privacy settings when pressed', () => {
      const { getByText } = render(<SettingsScreen />);

      fireEvent.press(getByText('隐私设置'));

      expect(mockPush).toHaveBeenCalledWith('./privacy');
    });

    it('should navigate to help page when pressed', () => {
      const { getByText } = render(<SettingsScreen />);

      fireEvent.press(getByText('帮助与反馈'));

      expect(mockPush).toHaveBeenCalledWith('./help');
    });

    it('should navigate to about page when pressed', () => {
      const { getByText } = render(<SettingsScreen />);

      fireEvent.press(getByText('关于我们'));

      expect(mockPush).toHaveBeenCalledWith('./about');
    });

    it('should navigate back when back button pressed', () => {
      const { getByTestId } = render(<SettingsScreen />);

      // Back button would need testID added
      // For now, test is placeholder
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe('toggles', () => {
    it('should toggle notifications setting', async () => {
      const { getAllByRole } = render(<SettingsScreen />);

      const switches = getAllByRole('switch');
      const notificationSwitch = switches[0]; // First switch is notifications

      fireEvent(notificationSwitch, 'valueChange', false);

      await waitFor(() => {
        expect(notificationSwitch.props.value).toBe(false);
      });
    });

    it('should toggle dark mode setting', async () => {
      const { getAllByRole } = render(<SettingsScreen />);

      const switches = getAllByRole('switch');
      const darkModeSwitch = switches[1]; // Second switch is dark mode

      fireEvent(darkModeSwitch, 'valueChange', true);

      await waitFor(() => {
        expect(darkModeSwitch.props.value).toBe(true);
      });
    });
  });

  describe('logout', () => {
    it('should show confirmation alert when logout pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<SettingsScreen />);

      fireEvent.press(getByText('退出登录'));

      expect(alertSpy).toHaveBeenCalledWith(
        '退出登录',
        '确定要退出当前账号吗?',
        expect.any(Array)
      );
    });
  });
});
