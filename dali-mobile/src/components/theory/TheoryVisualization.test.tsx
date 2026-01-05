/**
 * TheoryVisualization Component Tests
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { TheoryVisualization } from '../TheoryVisualization';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View, Text } = require('react-native');
  return {
    Svg: (props: React.PropsWithChildren<{}>) => <View {...props}>{props.children}</View>,
    Circle: () => null,
    Path: () => null,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return Reanimated;
});

describe('TheoryVisualization', () => {
  describe('render', () => {
    it('should render color principle description for 对比色', () => {
      const { getByText } = render(
        <TheoryVisualization
          colorPrinciple="对比色搭配"
          colors={['#000000', '#FFFFFF']}
        />
      );
      expect(getByText('高对比度·色彩碰撞')).toBeTruthy();
    });

    it('should render color principle description for 互补色', () => {
      const { getByText } = render(
        <TheoryVisualization
          colorPrinciple="互补色"
          colors={['#FF0000', '#00FF00']}
        />
      );
      expect(getByText('互补和谐·平衡之美')).toBeTruthy();
    });

    it('should render color principle description for 同色系', () => {
      const { getByText } = render(
        <TheoryVisualization
          colorPrinciple="同色系搭配"
          colors={['#6C63FF', '#9D94FF']}
        />
      );
      expect(getByText('同色渐变·优雅统一')).toBeTruthy();
    });

    it('should render color principle description for 黑白配', () => {
      const { getByText } = render(
        <TheoryVisualization
          colorPrinciple="黑白配"
          colors={['#000000', '#FFFFFF']}
        />
      );
      expect(getByText('高对比度·黑白经典')).toBeTruthy();
    });

    it('should render default description for unknown principle', () => {
      const { getByText } = render(
        <TheoryVisualization
          colorPrinciple="未知原理"
          colors={['#FF0000', '#00FF00']}
        />
      );
      expect(getByText('配色原理')).toBeTruthy();
    });
  });

  describe('colors', () => {
    it('should use default colors when none provided', () => {
      const { toJSON } = render(
        <TheoryVisualization colorPrinciple="对比色" />
      );
      // Component should render without crashing
      expect(toJSON()).toBeTruthy();
    });

    it('should handle empty colors array', () => {
      const { toJSON } = render(
        <TheoryVisualization
          colorPrinciple="对比色"
          colors={[]}
        />
      );
      // Component should render without crashing
      expect(toJSON()).toBeTruthy();
    });

    it('should handle single color', () => {
      const { toJSON } = render(
        <TheoryVisualization
          colorPrinciple="对比色"
          colors={['#FF0000']}
        />
      );
      // Component should render without crashing
      expect(toJSON()).toBeTruthy();
    });
  });
});
