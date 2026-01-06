/**
 * ColorPalette Component Tests
 * Part of Story 4.1: Color Theory Visualization Component
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { ColorPalette, ColorItem } from './ColorPalette';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.default.createAnimatedComponent = (component: any) => component;
  return Reanimated;
});

const mockColors: ColorItem[] = [
  { hex: '#F5F5DC', name: '米色', category: '上衣' },
  { hex: '#000000', name: '黑色', category: '裤子' },
  { hex: '#8B4513', name: '棕色', category: '配饰' },
];

describe('ColorPalette', () => {
  describe('render', () => {
    it('should render with colors', () => {
      const { getByText } = render(<ColorPalette colors={mockColors} />);

      expect(getByText('米色')).toBeTruthy();
      expect(getByText('黑色')).toBeTruthy();
      expect(getByText('棕色')).toBeTruthy();
    });

    it('should render with category labels when showCategory is true', () => {
      const { getByText } = render(
        <ColorPalette colors={mockColors} showCategory={true} />
      );

      expect(getByText('上衣')).toBeTruthy();
      expect(getByText('裤子')).toBeTruthy();
      expect(getByText('配饰')).toBeTruthy();
    });

    it('should hide category labels when showCategory is false', () => {
      const { queryByText } = render(
        <ColorPalette colors={mockColors} showCategory={false} />
      );

      expect(queryByText('上衣')).toBeNull();
      expect(queryByText('裤子')).toBeNull();
      expect(queryByText('配饰')).toBeNull();
    });

    it('should render hex values when showHex is true', () => {
      const { getByText } = render(
        <ColorPalette colors={mockColors} showHex={true} />
      );

      expect(getByText('#F5F5DC')).toBeTruthy();
      expect(getByText('#000000')).toBeTruthy();
    });

    it('should return null when colors array is empty', () => {
      const { toJSON } = render(<ColorPalette colors={[]} />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onColorPress when a color swatch is pressed', () => {
      const onColorPress = jest.fn();
      const { getByText } = render(
        <ColorPalette colors={mockColors} onColorPress={onColorPress} />
      );

      fireEvent.press(getByText('米色'));

      expect(onColorPress).toHaveBeenCalledWith('#F5F5DC');
    });

    it('should call onColorPress with correct hex for each color', () => {
      const onColorPress = jest.fn();
      const { getByText } = render(
        <ColorPalette colors={mockColors} onColorPress={onColorPress} />
      );

      fireEvent.press(getByText('黑色'));
      expect(onColorPress).toHaveBeenCalledWith('#000000');

      fireEvent.press(getByText('棕色'));
      expect(onColorPress).toHaveBeenCalledWith('#8B4513');
    });
  });
});
