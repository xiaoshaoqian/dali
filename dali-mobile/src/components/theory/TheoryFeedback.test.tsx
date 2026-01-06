/**
 * TheoryFeedback Component Tests
 * Part of Story 4.3: Theory Explanation Text Generation and Display
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import { TheoryFeedback } from './TheoryFeedback';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('TheoryFeedback', () => {
  const mockOutfitId = 'test-outfit-123';

  describe('render', () => {
    it('should render feedback question and buttons', () => {
      const { getByText, getByTestId } = render(
        <TheoryFeedback outfitId={mockOutfitId} testID="theory-feedback" />
      );

      expect(getByText('这个解析有帮助吗？')).toBeTruthy();
      expect(getByTestId('theory-feedback-helpful')).toBeTruthy();
      expect(getByTestId('theory-feedback-not-helpful')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} visible={false} />
      );

      expect(queryByText('这个解析有帮助吗？')).toBeNull();
    });

    it('should render when visible is true (default)', () => {
      const { getByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} visible={true} />
      );

      expect(getByText('这个解析有帮助吗？')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onFeedback with true when helpful button pressed', () => {
      const mockOnFeedback = jest.fn();
      const { getByTestId } = render(
        <TheoryFeedback
          outfitId={mockOutfitId}
          onFeedback={mockOnFeedback}
          testID="theory-feedback"
        />
      );

      fireEvent.press(getByTestId('theory-feedback-helpful'));

      expect(mockOnFeedback).toHaveBeenCalledWith(true);
    });

    it('should call onFeedback with false when not helpful button pressed', () => {
      const mockOnFeedback = jest.fn();
      const { getByTestId } = render(
        <TheoryFeedback
          outfitId={mockOutfitId}
          onFeedback={mockOnFeedback}
          testID="theory-feedback"
        />
      );

      fireEvent.press(getByTestId('theory-feedback-not-helpful'));

      expect(mockOnFeedback).toHaveBeenCalledWith(false);
    });

    it('should show positive thank you message after helpful feedback', async () => {
      const { getByTestId, getByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} testID="theory-feedback" />
      );

      fireEvent.press(getByTestId('theory-feedback-helpful'));

      await waitFor(() => {
        expect(getByText(/感谢你的反馈/)).toBeTruthy();
        expect(getByText(/很高兴对你有帮助/)).toBeTruthy();
      });
    });

    it('should show improvement message after not helpful feedback', async () => {
      const { getByTestId, getByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} testID="theory-feedback" />
      );

      fireEvent.press(getByTestId('theory-feedback-not-helpful'));

      await waitFor(() => {
        expect(getByText(/感谢反馈/)).toBeTruthy();
        expect(getByText(/继续优化/)).toBeTruthy();
      });
    });

    it('should hide buttons after feedback submitted', async () => {
      const { getByTestId, queryByTestId, queryByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} testID="theory-feedback" />
      );

      fireEvent.press(getByTestId('theory-feedback-helpful'));

      await waitFor(() => {
        expect(queryByTestId('theory-feedback-helpful')).toBeNull();
        expect(queryByTestId('theory-feedback-not-helpful')).toBeNull();
        expect(queryByText('这个解析有帮助吗？')).toBeNull();
      });
    });

    it('should only allow one feedback submission', async () => {
      const mockOnFeedback = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <TheoryFeedback
          outfitId={mockOutfitId}
          onFeedback={mockOnFeedback}
          testID="theory-feedback"
        />
      );

      // First press
      fireEvent.press(getByTestId('theory-feedback-helpful'));
      expect(mockOnFeedback).toHaveBeenCalledTimes(1);

      // After submission, buttons should be gone
      await waitFor(() => {
        expect(queryByTestId('theory-feedback-helpful')).toBeNull();
      });
    });
  });

  describe('emoji buttons', () => {
    it('should display thumbs up emoji', () => {
      const { getByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} />
      );

      expect(getByText('👍')).toBeTruthy();
    });

    it('should display thumbs down emoji', () => {
      const { getByText } = render(
        <TheoryFeedback outfitId={mockOutfitId} />
      );

      expect(getByText('👎')).toBeTruthy();
    });
  });
});
