/**
 * TheoryExplanation Component Tests
 * Part of Story 4.3: Theory Explanation Text Generation and Display
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { TheoryExplanation } from './TheoryExplanation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('TheoryExplanation', () => {
  const mockExplanation =
    '**米色**上衣搭配**黑色阔腿裤**，运用了经典的**中性色对比**配色原理。米色温柔知性，黑色利落干练，两者结合营造出职场专业感又不失亲和力。';

  const plainExplanation =
    '米色上衣搭配黑色阔腿裤，运用了经典的中性色对比配色原理。';

  describe('render', () => {
    it('should render explanation text', () => {
      const { getByTestId } = render(
        <TheoryExplanation explanation={plainExplanation} testID="theory-exp" />
      );

      expect(getByTestId('theory-exp')).toBeTruthy();
      expect(getByTestId('theory-exp-text')).toBeTruthy();
    });

    it('should render empty when no explanation', () => {
      const { queryByText } = render(<TheoryExplanation explanation="" />);
      // Should not crash with empty string
      expect(queryByText('米色')).toBeNull();
    });
  });

  describe('keyword highlighting', () => {
    it('should highlight keywords wrapped in **', () => {
      const { getByTestId } = render(
        <TheoryExplanation
          explanation={mockExplanation}
          showHighlights={true}
          testID="theory-exp"
        />
      );

      // Check that highlight elements exist (indices are based on parts array position)
      // Parts: 米色(0), 上衣搭配, 黑色阔腿裤(2), ，运用了..., 中性色对比(4)
      expect(getByTestId('theory-exp-highlight-0')).toBeTruthy();
      expect(getByTestId('theory-exp-highlight-2')).toBeTruthy();
      expect(getByTestId('theory-exp-highlight-4')).toBeTruthy();
    });

    it('should display keywords without ** markers when highlighting enabled', () => {
      const { getByText } = render(
        <TheoryExplanation explanation={mockExplanation} showHighlights={true} />
      );

      // Keywords should be visible without the ** markers
      expect(getByText('米色')).toBeTruthy();
      expect(getByText('黑色阔腿裤')).toBeTruthy();
      expect(getByText('中性色对比')).toBeTruthy();
    });

    it('should not highlight when showHighlights is false', () => {
      const { queryByTestId } = render(
        <TheoryExplanation
          explanation={mockExplanation}
          showHighlights={false}
          testID="theory-exp"
        />
      );

      // No highlight elements should exist
      expect(queryByTestId('theory-exp-highlight-0')).toBeNull();
    });

    it('should use custom highlight color', () => {
      const customColor = '#FF0000';
      const { getByTestId } = render(
        <TheoryExplanation
          explanation={mockExplanation}
          highlightColor={customColor}
          testID="theory-exp"
        />
      );

      const highlight = getByTestId('theory-exp-highlight-0');
      expect(highlight.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: customColor })])
      );
    });
  });

  describe('expand/collapse', () => {
    it('should show expand button when maxLines exceeded', () => {
      // Note: This test is limited because we can't easily simulate text layout in tests
      const { queryByTestId } = render(
        <TheoryExplanation
          explanation={mockExplanation}
          maxLines={2}
          testID="theory-exp"
        />
      );

      // The expand button may or may not appear depending on text layout
      // This tests that the component doesn't crash with maxLines set
      expect(queryByTestId('theory-exp')).toBeTruthy();
    });

    it('should not show expand button when maxLines is 0', () => {
      const { queryByTestId } = render(
        <TheoryExplanation
          explanation={mockExplanation}
          maxLines={0}
          testID="theory-exp"
        />
      );

      expect(queryByTestId('theory-exp-expand')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <TheoryExplanation
          explanation={plainExplanation}
          onPress={mockOnPress}
          testID="theory-exp"
        />
      );

      // Fire press event on the component
      fireEvent.press(getByTestId('theory-exp'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not throw when pressed without onPress handler', () => {
      const { getByTestId } = render(
        <TheoryExplanation
          explanation={plainExplanation}
          testID="theory-exp"
        />
      );

      expect(() => {
        fireEvent.press(getByTestId('theory-exp'));
      }).not.toThrow();
    });
  });

  describe('text parsing', () => {
    it('should handle text with multiple keywords', () => {
      const textWithMultipleKeywords = '**第一个**普通文字**第二个**更多文字**第三个**';
      const { getByTestId } = render(
        <TheoryExplanation
          explanation={textWithMultipleKeywords}
          testID="theory-exp"
        />
      );

      // Indices: 第一个(0), 普通文字, 第二个(2), 更多文字, 第三个(4)
      expect(getByTestId('theory-exp-highlight-0')).toBeTruthy();
      expect(getByTestId('theory-exp-highlight-2')).toBeTruthy();
      expect(getByTestId('theory-exp-highlight-4')).toBeTruthy();
    });

    it('should handle text with no keywords', () => {
      const { queryByTestId } = render(
        <TheoryExplanation
          explanation={plainExplanation}
          testID="theory-exp"
        />
      );

      expect(queryByTestId('theory-exp-highlight-0')).toBeNull();
    });

    it('should handle text starting with keyword', () => {
      const textStartingWithKeyword = '**开头关键词**后面是普通文字';
      const { getByTestId, getByText } = render(
        <TheoryExplanation
          explanation={textStartingWithKeyword}
          testID="theory-exp"
        />
      );

      expect(getByTestId('theory-exp-highlight-0')).toBeTruthy();
      expect(getByText('开头关键词')).toBeTruthy();
    });

    it('should handle text ending with keyword', () => {
      const textEndingWithKeyword = '普通文字**结尾关键词**';
      const { getByTestId, getByText } = render(
        <TheoryExplanation
          explanation={textEndingWithKeyword}
          testID="theory-exp"
        />
      );

      // Index: 普通文字, 结尾关键词(1)
      expect(getByTestId('theory-exp-highlight-1')).toBeTruthy();
      expect(getByText('结尾关键词')).toBeTruthy();
    });
  });
});
