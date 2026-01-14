/**
 * Help Settings Screen Tests
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import HelpSettingsScreen from '../help';

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

describe('HelpSettingsScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  describe('render', () => {
    it('should render help screen correctly', () => {
      const { getByText } = render(<HelpSettingsScreen />);

      expect(getByText('帮助与反馈')).toBeTruthy();
    });

    it('should display all FAQ items', () => {
      const { getByText } = render(<HelpSettingsScreen />);

      expect(getByText('AI试穿不准确怎么办?')).toBeTruthy();
      expect(getByText('搭配建议不符合我的风格?')).toBeTruthy();
      expect(getByText('如何修改身材数据?')).toBeTruthy();
    });

    it('should display feedback option', () => {
      const { getByText } = render(<HelpSettingsScreen />);

      expect(getByText('联系我们 / 问题反馈')).toBeTruthy();
    });
  });

  describe('FAQ interactions', () => {
    it('should show answer alert when FAQ item pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<HelpSettingsScreen />);

      fireEvent.press(getByText('AI试穿不准确怎么办?'));

      expect(alertSpy).toHaveBeenCalled();
    });

    it('should show style answer when style FAQ pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<HelpSettingsScreen />);

      fireEvent.press(getByText('搭配建议不符合我的风格?'));

      expect(alertSpy).toHaveBeenCalled();
    });

    it('should show body data answer when body FAQ pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<HelpSettingsScreen />);

      fireEvent.press(getByText('如何修改身材数据?'));

      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('feedback interaction', () => {
    it('should show feedback form when contact pressed', () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const { getByText } = render(<HelpSettingsScreen />);

      fireEvent.press(getByText('联系我们 / 问题反馈'));

      expect(alertSpy).toHaveBeenCalledWith(
        '联系我们',
        expect.any(String)
      );
    });
  });
});
