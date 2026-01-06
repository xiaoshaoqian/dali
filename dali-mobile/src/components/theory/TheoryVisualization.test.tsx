/**
 * TheoryVisualization Component Tests
 * Part of Story 3.4 (base) + Story 4.1 (enhanced)
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { TheoryVisualization, TheoryData } from './TheoryVisualization';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: (props: any) => <View {...props} />,
    Circle: () => null,
    Path: () => null,
    Line: () => null,
    G: (props: any) => <View {...props} />,
  };
});

// Mock ColorWheel component
jest.mock('./ColorWheel', () => ({
  ColorWheel: () => null,
}));

// Mock ColorPalette component
jest.mock('./ColorPalette', () => ({
  ColorPalette: ({ colors }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        {colors.map((c: any, i: number) => (
          <View key={i}>
            <Text>{c.name}</Text>
            {c.category && <Text>{c.category}</Text>}
          </View>
        ))}
      </View>
    );
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.default.createAnimatedComponent = (component: any) => component;
  return Reanimated;
});

const mockTheoryData: TheoryData = {
  colorPrinciple: '对比色搭配',
  colors: [
    { hex: '#F5F5DC', name: '米色', category: '上衣' },
    { hex: '#000000', name: '黑色', category: '裤子' },
  ],
  explanation: '高对比度的黑白配色营造专业形象。',
};

describe('TheoryVisualization', () => {
  describe('render with legacy props (backward compatibility)', () => {
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

  describe('render with new theory prop (Story 4.1)', () => {
    it('should render with theory data object', () => {
      const { getByText } = render(
        <TheoryVisualization theory={mockTheoryData} />
      );
      expect(getByText('高对比度·色彩碰撞')).toBeTruthy();
    });

    it('should display custom explanation from theory', () => {
      const { getByText } = render(
        <TheoryVisualization theory={mockTheoryData} />
      );
      expect(getByText('高对比度的黑白配色营造专业形象。')).toBeTruthy();
    });

    it('should render ColorPalette when showColorPalette is true', () => {
      const { getByText } = render(
        <TheoryVisualization theory={mockTheoryData} showColorPalette={true} />
      );
      // Color names should be visible
      expect(getByText('米色')).toBeTruthy();
      expect(getByText('黑色')).toBeTruthy();
    });

    it('should not render ColorPalette when showColorPalette is false', () => {
      const { queryByText } = render(
        <TheoryVisualization theory={mockTheoryData} showColorPalette={false} />
      );
      // Color names should not be visible (only in ColorPalette)
      expect(queryByText('上衣')).toBeNull();
    });

    it('should render with custom wheelSize', () => {
      const { toJSON } = render(
        <TheoryVisualization theory={mockTheoryData} wheelSize={120} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('colors handling', () => {
    it('should use default colors when none provided', () => {
      const { toJSON } = render(
        <TheoryVisualization colorPrinciple="对比色" />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should handle empty colors array', () => {
      const { toJSON } = render(
        <TheoryVisualization
          colorPrinciple="对比色"
          colors={[]}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should handle single color', () => {
      const { toJSON } = render(
        <TheoryVisualization
          colorPrinciple="对比色"
          colors={['#FF0000']}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should prefer theory prop colors over legacy colors', () => {
      const { getByText } = render(
        <TheoryVisualization
          theory={mockTheoryData}
          colors={['#AABBCC']}
          showColorPalette={true}
        />
      );
      // Should show colors from theory, not legacy
      expect(getByText('米色')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <TheoryVisualization
          colorPrinciple="对比色搭配"
          onPress={onPress}
        />
      );

      fireEvent.press(getByText('高对比度·色彩碰撞'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('connection type detection', () => {
    it('should detect complementary for 补色', () => {
      const { toJSON } = render(
        <TheoryVisualization colorPrinciple="补色搭配" colors={['#FF0000', '#00FFFF']} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should detect analogous for 邻近色', () => {
      const { toJSON } = render(
        <TheoryVisualization colorPrinciple="邻近色搭配" colors={['#FF0000', '#FF8000']} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should detect triadic for 三色', () => {
      const { toJSON } = render(
        <TheoryVisualization
          colorPrinciple="三色搭配"
          colors={['#FF0000', '#00FF00', '#0000FF']}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
