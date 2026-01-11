/**
 * AILearningModal Component Tests
 * Tests for the AI learning tips modal
 *
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 * @see AC#7: Tap to Show Details Modal
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

import { AILearningModal } from './AILearningModal';
import * as Haptics from 'expo-haptics';

describe('AILearningModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when visible is true', () => {
      render(<AILearningModal visible={true} onClose={jest.fn()} />);
      expect(screen.getByText('如何提升 AI 准确度？')).toBeTruthy();
    });

    it('should not render modal when visible is false', () => {
      render(<AILearningModal visible={false} onClose={jest.fn()} />);
      expect(screen.queryByText('如何提升 AI 准确度？')).toBeNull();
    });

    it('should render modal title correctly', () => {
      render(<AILearningModal visible={true} onClose={jest.fn()} />);
      expect(screen.getByText('如何提升 AI 准确度？')).toBeTruthy();
    });

    it('should render all three tips', () => {
      render(<AILearningModal visible={true} onClose={jest.fn()} />);
      expect(screen.getByText('多生成搭配——AI 学习更多案例')).toBeTruthy();
      expect(screen.getByText('点赞你喜欢的方案——AI 会记住你的偏好')).toBeTruthy();
      expect(screen.getByText('收藏最爱的搭配——AI 优先推荐类似风格')).toBeTruthy();
    });

    it('should render close button with correct text', () => {
      render(<AILearningModal visible={true} onClose={jest.fn()} />);
      expect(screen.getByText('知道了')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is pressed', async () => {
      const onClose = jest.fn();
      render(<AILearningModal visible={true} onClose={onClose} />);

      fireEvent.press(screen.getByText('知道了'));
      // Wait for async handler
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback when close button is pressed', async () => {
      const onClose = jest.fn();
      render(<AILearningModal visible={true} onClose={onClose} />);

      fireEvent.press(screen.getByText('知道了'));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should call onClose when backdrop is pressed', async () => {
      const onClose = jest.fn();
      render(<AILearningModal visible={true} onClose={onClose} />);

      // The backdrop is the outer Pressable
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.press(backdrop);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have accessible close button', () => {
      render(<AILearningModal visible={true} onClose={jest.fn()} />);
      const closeButton = screen.getByText('知道了');
      expect(closeButton).toBeTruthy();
    });
  });
});
