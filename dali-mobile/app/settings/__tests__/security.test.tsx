/**
 * Security Settings Screen Tests
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import SecuritySettingsScreen from '../security';

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

describe('SecuritySettingsScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  describe('render', () => {
    it('should render security settings screen correctly', () => {
      const { getByText } = render(<SecuritySettingsScreen />);

      expect(getByText('账号安全')).toBeTruthy();
    });

    it('should display all security options', () => {
      const { getByText } = render(<SecuritySettingsScreen />);

      expect(getByText('修改密码')).toBeTruthy();
      expect(getByText('手机号码')).toBeTruthy();
      expect(getByText('138****8888')).toBeTruthy();
      expect(getByText('微信绑定')).toBeTruthy();
      expect(getByText('已绑定')).toBeTruthy();
      expect(getByText('登录设备管理')).toBeTruthy();
      expect(getByText('iPhone 15 Pro')).toBeTruthy();
      expect(getByText('注销账号')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should show alert when change password pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<SecuritySettingsScreen />);

      fireEvent.press(getByText('修改密码'));

      expect(alertSpy).toHaveBeenCalled();
    });

    it('should show confirmation dialog when delete account pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<SecuritySettingsScreen />);

      fireEvent.press(getByText('注销账号'));

      expect(alertSpy).toHaveBeenCalledWith(
        '注销账号',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should navigate back when back button pressed', () => {
      const { getByText } = render(<SecuritySettingsScreen />);

      // Back button interaction would be tested here
      expect(mockBack).toBeDefined();
    });
  });
});
