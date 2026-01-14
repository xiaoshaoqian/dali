/**
 * About Settings Screen Tests
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import AboutSettingsScreen from '../about';

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

describe('AboutSettingsScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  describe('render', () => {
    it('should render about screen correctly', () => {
      const { getByText } = render(<AboutSettingsScreen />);

      expect(getByText('关于我们')).toBeTruthy();
    });

    it('should display app branding', () => {
      const { getByText } = render(<AboutSettingsScreen />);

      expect(getByText('搭理 Dali')).toBeTruthy();
      expect(getByText('Version 1.0.2')).toBeTruthy();
    });

    it('should display features and updates section', () => {
      const { getByText } = render(<AboutSettingsScreen />);

      expect(getByText('功能介绍')).toBeTruthy();
      expect(getByText('检查更新')).toBeTruthy();
    });

    it('should display legal documents section', () => {
      const { getByText } = render(<AboutSettingsScreen />);

      expect(getByText('用户协议')).toBeTruthy();
      expect(getByText('隐私政策')).toBeTruthy();
    });

    it('should display copyright information', () => {
      const { getByText } = render(<AboutSettingsScreen />);

      expect(getByText('© 2026 Dali Inc.')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should show feature intro when pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<AboutSettingsScreen />);

      fireEvent.press(getByText('功能介绍'));

      expect(alertSpy).toHaveBeenCalled();
    });

    it('should check for updates when pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<AboutSettingsScreen />);

      fireEvent.press(getByText('检查更新'));

      expect(alertSpy).toHaveBeenCalledWith(
        '检查更新',
        expect.any(String)
      );
    });

    it('should show user agreement when pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<AboutSettingsScreen />);

      fireEvent.press(getByText('用户协议'));

      expect(alertSpy).toHaveBeenCalled();
    });

    it('should show privacy policy when pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<AboutSettingsScreen />);

      fireEvent.press(getByText('隐私政策'));

      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
