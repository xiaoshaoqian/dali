/**
 * AILearningSection Component Tests
 * Tests for the AI Learning section wrapper
 *
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 * @see AC#8: Progress Improvement Notification
 * @see AC#9: Integration with Profile Screen
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage (required by import chain)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

import { AILearningSection } from './AILearningSection';
import * as Haptics from 'expo-haptics';

describe('AILearningSection', () => {
  const defaultProps = {
    aiAccuracy: 0.65,
    totalOutfits: 30,
    favoriteCount: 8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear AsyncStorage before each test
    AsyncStorage.clear();
  });

  describe('rendering', () => {
    it('should render section title', () => {
      render(<AILearningSection {...defaultProps} />);
      expect(screen.getByText('AI 学习进度')).toBeTruthy();
    });

    it('should render ProgressCircle with correct progress', () => {
      render(<AILearningSection {...defaultProps} />);
      // 65% aiAccuracy = 65% progress
      expect(screen.getByText('65%')).toBeTruthy();
    });

    it('should render correct stage message for 51-80%', () => {
      render(<AILearningSection {...defaultProps} />);
      expect(screen.getByText('AI 越来越懂你啦')).toBeTruthy();
    });

    it('should render stage 1 message for low progress', () => {
      render(<AILearningSection aiAccuracy={0.15} totalOutfits={2} favoriteCount={0} />);
      expect(screen.getByText('15%')).toBeTruthy();
      expect(screen.getByText('AI 正在学习你的风格...')).toBeTruthy();
    });

    it('should render stage 4 message for high progress', () => {
      render(<AILearningSection aiAccuracy={0.90} totalOutfits={50} favoriteCount={20} />);
      expect(screen.getByText('90%')).toBeTruthy();
      expect(screen.getByText('AI 已经很懂你的风格了！')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should open modal when ProgressCircle is tapped', async () => {
      render(<AILearningSection {...defaultProps} />);

      fireEvent.press(screen.getByTestId('progress-circle'));
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Modal should now be visible
      expect(screen.getByText('如何提升 AI 准确度？')).toBeTruthy();
    });

    it('should close modal when close button is pressed', async () => {
      render(<AILearningSection {...defaultProps} />);

      // Open modal
      fireEvent.press(screen.getByTestId('progress-circle'));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(screen.getByText('如何提升 AI 准确度？')).toBeTruthy();

      // Close modal
      fireEvent.press(screen.getByText('知道了'));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(screen.queryByText('如何提升 AI 准确度？')).toBeNull();
    });
  });

  describe('progress improvement callback (AC#8)', () => {
    it('should call onProgressImprovement when progress increases by >= 5%', async () => {
      // Set previous progress to 60%
      await AsyncStorage.setItem('ai_learning_last_progress', '60');

      const onProgressImprovement = jest.fn();
      // Render with 65% progress (5% increase)
      render(<AILearningSection {...defaultProps} onProgressImprovement={onProgressImprovement} />);

      // Wait for async effect
      await waitFor(() => {
        expect(onProgressImprovement).toHaveBeenCalledTimes(1);
      });
    });

    it('should trigger success haptic feedback when progress improves', async () => {
      // Set previous progress to 55%
      await AsyncStorage.setItem('ai_learning_last_progress', '55');

      const onProgressImprovement = jest.fn();
      // Render with 65% progress (10% increase)
      render(<AILearningSection {...defaultProps} onProgressImprovement={onProgressImprovement} />);

      // Wait for async effect
      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success
        );
      });
    });

    it('should not call onProgressImprovement when progress increases by < 5%', async () => {
      // Set previous progress to 62%
      await AsyncStorage.setItem('ai_learning_last_progress', '62');

      const onProgressImprovement = jest.fn();
      // Render with 65% progress (3% increase, below threshold)
      render(<AILearningSection {...defaultProps} onProgressImprovement={onProgressImprovement} />);

      // Wait a bit for potential async effects
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Callback should not be called
      expect(onProgressImprovement).not.toHaveBeenCalled();
    });

    it('should only call onProgressImprovement once per session', async () => {
      // Set previous progress to 50%
      await AsyncStorage.setItem('ai_learning_last_progress', '50');

      const onProgressImprovement = jest.fn();
      const { rerender } = render(<AILearningSection {...defaultProps} onProgressImprovement={onProgressImprovement} />);

      // Wait for callback to be called
      await waitFor(() => {
        expect(onProgressImprovement).toHaveBeenCalledTimes(1);
      });

      // Rerender with higher progress
      rerender(<AILearningSection aiAccuracy={0.80} totalOutfits={40} favoriteCount={15} onProgressImprovement={onProgressImprovement} />);

      // Haptic should only be called once (first time)
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    });

    it('should save current progress to storage', async () => {
      // Clear storage
      await AsyncStorage.clear();

      // Render with 65% progress
      render(<AILearningSection {...defaultProps} />);

      // Wait for async effect
      await waitFor(async () => {
        const savedProgress = await AsyncStorage.getItem('ai_learning_last_progress');
        expect(savedProgress).toBe('65');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle 0 progress', () => {
      render(<AILearningSection aiAccuracy={0} totalOutfits={0} favoriteCount={0} />);
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('should handle 100% progress', () => {
      render(<AILearningSection aiAccuracy={1} totalOutfits={100} favoriteCount={50} />);
      expect(screen.getByText('100%')).toBeTruthy();
    });

    it('should call onProgressImprovement for first time user (no previous progress)', async () => {
      // Clear storage - simulates first time user
      await AsyncStorage.clear();

      const onProgressImprovement = jest.fn();
      // Render with high progress (should trigger callback since first time)
      render(<AILearningSection aiAccuracy={0.65} totalOutfits={30} favoriteCount={8} onProgressImprovement={onProgressImprovement} />);

      // Wait for async effect
      await waitFor(() => {
        expect(onProgressImprovement).toHaveBeenCalledTimes(1);
      });
    });
  });
});
