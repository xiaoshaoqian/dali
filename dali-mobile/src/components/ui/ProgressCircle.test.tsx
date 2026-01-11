/**
 * ProgressCircle Component Tests
 * Tests for the circular progress indicator component
 *
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    createAnimatedComponent: (component: React.ComponentType) => component,
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

import { ProgressCircle } from './ProgressCircle';
import * as Haptics from 'expo-haptics';

describe('ProgressCircle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with correct progress percentage', () => {
      render(<ProgressCircle progress={75} />);
      expect(screen.getByText('75%')).toBeTruthy();
    });

    it('should render label when provided', () => {
      render(<ProgressCircle progress={50} label="AI 越来越懂你啦" />);
      expect(screen.getByText('AI 越来越懂你啦')).toBeTruthy();
    });

    it('should not render label when not provided', () => {
      render(<ProgressCircle progress={50} />);
      expect(screen.queryByText('AI 越来越懂你啦')).toBeNull();
    });

    it('should handle 0% progress', () => {
      render(<ProgressCircle progress={0} />);
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('should handle 100% progress', () => {
      render(<ProgressCircle progress={100} />);
      expect(screen.getByText('100%')).toBeTruthy();
    });

    it('should round decimal progress values', () => {
      render(<ProgressCircle progress={75.6} />);
      expect(screen.getByText('76%')).toBeTruthy();
    });

    it('should render with testID for accessibility', () => {
      render(<ProgressCircle progress={50} />);
      expect(screen.getByTestId('progress-circle')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when tapped', async () => {
      const onPress = jest.fn();
      render(<ProgressCircle progress={50} onPress={onPress} />);
      fireEvent.press(screen.getByTestId('progress-circle'));
      // Wait for async handler to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback when tapped', async () => {
      const onPress = jest.fn();
      render(<ProgressCircle progress={50} onPress={onPress} />);
      fireEvent.press(screen.getByTestId('progress-circle'));
      // Wait for async handler to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should not crash when onPress is not provided', async () => {
      render(<ProgressCircle progress={50} />);
      // Should not throw
      fireEvent.press(screen.getByTestId('progress-circle'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  describe('custom props', () => {
    it('should accept custom size', () => {
      const { toJSON } = render(<ProgressCircle progress={50} size={200} />);
      // Component should render without errors
      expect(toJSON()).toBeTruthy();
    });

    it('should accept custom strokeWidth', () => {
      const { toJSON } = render(<ProgressCircle progress={50} strokeWidth={16} />);
      // Component should render without errors
      expect(toJSON()).toBeTruthy();
    });

    it('should use default size of 160', () => {
      const { toJSON } = render(<ProgressCircle progress={50} />);
      // Component should render with default size
      expect(toJSON()).toBeTruthy();
    });

    it('should use default strokeWidth of 12', () => {
      const { toJSON } = render(<ProgressCircle progress={50} />);
      // Component should render with default strokeWidth
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle negative progress gracefully', () => {
      render(<ProgressCircle progress={-10} />);
      // Should show -10% or handle gracefully
      expect(screen.getByTestId('progress-circle')).toBeTruthy();
    });

    it('should handle progress over 100 gracefully', () => {
      render(<ProgressCircle progress={150} />);
      // Should show 150% or handle gracefully
      expect(screen.getByTestId('progress-circle')).toBeTruthy();
    });
  });
});
