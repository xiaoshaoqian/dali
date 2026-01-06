/**
 * ColorWheel Component Tests
 * Part of Story 4.1: Color Theory Visualization Component
 *
 * Tests for the 12-color hue wheel with highlight markers and connection lines.
 * Note: SVG internals are mocked - tests verify component behavior and props.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import {
  ColorWheel,
  HUE_COLORS,
  isValidHex,
  hexToRgb,
  rgbToHue,
  hexToHue,
  findClosestHueAngle,
} from './ColorWheel';

// Mock react-native-svg - must return React elements, not objects
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => React.createElement(View, { testID: 'svg-root', ...props }, children),
    Svg: ({ children, ...props }: any) => React.createElement(View, { testID: 'svg-root', ...props }, children),
    Circle: (props: any) => React.createElement(View, { testID: 'svg-circle', ...props }),
    Path: (props: any) => React.createElement(View, { testID: 'svg-path', ...props }),
    Line: (props: any) => React.createElement(View, { testID: 'svg-line', ...props }),
    G: ({ children, ...props }: any) => React.createElement(View, { testID: 'svg-g', ...props }, children),
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.default.createAnimatedComponent = (component: any) => component;
  return Reanimated;
});

describe('ColorWheel', () => {
  describe('render', () => {
    it('should render with default props', () => {
      const { toJSON } = render(<ColorWheel />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with custom size', () => {
      const { toJSON } = render(<ColorWheel size={120} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with highlight colors', () => {
      const { toJSON } = render(
        <ColorWheel highlightColors={['#FF0000', '#00FF00']} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with empty highlight colors', () => {
      const { toJSON } = render(<ColorWheel highlightColors={[]} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('connection types', () => {
    it('should render with complementary connection type', () => {
      const { toJSON } = render(
        <ColorWheel
          highlightColors={['#FF0000', '#00FFFF']}
          connectionType="complementary"
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with analogous connection type', () => {
      const { toJSON } = render(
        <ColorWheel
          highlightColors={['#FF0000', '#FF8000']}
          connectionType="analogous"
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with triadic connection type', () => {
      const { toJSON } = render(
        <ColorWheel
          highlightColors={['#FF0000', '#00FF00', '#0000FF']}
          connectionType="triadic"
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with none connection type', () => {
      const { toJSON } = render(
        <ColorWheel
          highlightColors={['#FF0000', '#00FF00']}
          connectionType="none"
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('color validation', () => {
    it('should handle invalid hex colors gracefully', () => {
      // Should not throw with invalid colors
      const { toJSON } = render(
        <ColorWheel highlightColors={['#FF0000', 'invalid', '#GGG', '']} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should accept 3-character hex colors', () => {
      const { toJSON } = render(
        <ColorWheel highlightColors={['#F00', '#0F0']} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should accept 6-character hex colors', () => {
      const { toJSON } = render(
        <ColorWheel highlightColors={['#FF0000', '#00FF00']} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('exports', () => {
    it('should export ColorWheel component', () => {
      expect(ColorWheel).toBeDefined();
      expect(typeof ColorWheel).toBe('function');
    });

    it('should export ColorWheelProps type (compile-time check)', () => {
      // TypeScript compile-time check - if this file compiles, the type exists
      const props: import('./ColorWheel').ColorWheelProps = {
        size: 80,
        highlightColors: ['#FF0000'],
        connectionType: 'complementary',
        onPress: () => {},
      };
      expect(props.size).toBe(80);
    });

    it('should export ConnectionType type (compile-time check)', () => {
      const type: import('./ColorWheel').ConnectionType = 'complementary';
      expect(['complementary', 'analogous', 'triadic', 'none']).toContain(type);
    });
  });

  describe('props interface', () => {
    it('should accept size prop', () => {
      const sizes = [40, 80, 120, 200];
      sizes.forEach(size => {
        const { toJSON } = render(<ColorWheel size={size} />);
        expect(toJSON()).toBeTruthy();
      });
    });

    it('should accept onPress prop', () => {
      const onPress = jest.fn();
      const { toJSON } = render(<ColorWheel onPress={onPress} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should accept all props together', () => {
      const onPress = jest.fn();
      const { toJSON } = render(
        <ColorWheel
          size={100}
          highlightColors={['#FF0000', '#00FF00', '#0000FF']}
          connectionType="triadic"
          onPress={onPress}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  // ===============================================
  // Algorithm Tests - Verify actual color logic
  // ===============================================

  describe('HUE_COLORS constant', () => {
    it('should have 12 colors', () => {
      expect(HUE_COLORS).toHaveLength(12);
    });

    it('should cover 360 degrees in 30 degree increments', () => {
      const expectedAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      const actualAngles = HUE_COLORS.map(c => c.angle);
      expect(actualAngles).toEqual(expectedAngles);
    });

    it('should have valid hex colors', () => {
      HUE_COLORS.forEach(hue => {
        expect(isValidHex(hue.color)).toBe(true);
      });
    });
  });

  describe('isValidHex', () => {
    it('should validate 6-character hex colors', () => {
      expect(isValidHex('#FF0000')).toBe(true);
      expect(isValidHex('#00ff00')).toBe(true);
      expect(isValidHex('#0000FF')).toBe(true);
    });

    it('should validate 3-character hex colors', () => {
      expect(isValidHex('#F00')).toBe(true);
      expect(isValidHex('#0f0')).toBe(true);
      expect(isValidHex('#00F')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHex('FF0000')).toBe(false); // missing #
      expect(isValidHex('#GGG')).toBe(false); // invalid chars
      expect(isValidHex('#FF00')).toBe(false); // wrong length
      expect(isValidHex('')).toBe(false); // empty
      expect(isValidHex('red')).toBe(false); // color name
    });
  });

  describe('hexToRgb', () => {
    it('should convert red hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert green hex to RGB', () => {
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert blue hex to RGB', () => {
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should convert mixed color hex to RGB', () => {
      expect(hexToRgb('#F5F5DC')).toEqual({ r: 245, g: 245, b: 220 }); // beige
    });

    it('should return black for invalid hex', () => {
      expect(hexToRgb('invalid')).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('rgbToHue', () => {
    it('should return 0 for pure red', () => {
      expect(rgbToHue(255, 0, 0)).toBe(0);
    });

    it('should return 120 for pure green', () => {
      expect(rgbToHue(0, 255, 0)).toBe(120);
    });

    it('should return 240 for pure blue', () => {
      expect(rgbToHue(0, 0, 255)).toBe(240);
    });

    it('should return 60 for pure yellow', () => {
      expect(rgbToHue(255, 255, 0)).toBe(60);
    });

    it('should return 0 for achromatic (gray/white/black)', () => {
      expect(rgbToHue(128, 128, 128)).toBe(0); // gray
      expect(rgbToHue(255, 255, 255)).toBe(0); // white
      expect(rgbToHue(0, 0, 0)).toBe(0); // black
    });
  });

  describe('hexToHue', () => {
    it('should convert #FF0000 (red) to hue 0', () => {
      expect(hexToHue('#FF0000')).toBe(0);
    });

    it('should convert #00FF00 (green) to hue 120', () => {
      expect(hexToHue('#00FF00')).toBe(120);
    });

    it('should convert #0000FF (blue) to hue 240', () => {
      expect(hexToHue('#0000FF')).toBe(240);
    });

    it('should convert #FF8000 (orange) to approximately 30', () => {
      const hue = hexToHue('#FF8000');
      expect(hue).toBeGreaterThanOrEqual(28);
      expect(hue).toBeLessThanOrEqual(32);
    });
  });

  describe('findClosestHueAngle', () => {
    it('should return 0 for hue close to red (0)', () => {
      expect(findClosestHueAngle(5)).toBe(0);
      expect(findClosestHueAngle(355)).toBe(0); // wraps around
    });

    it('should return 30 for hue close to orange', () => {
      expect(findClosestHueAngle(25)).toBe(30);
      expect(findClosestHueAngle(35)).toBe(30);
    });

    it('should return 180 for hue close to cyan', () => {
      expect(findClosestHueAngle(175)).toBe(180);
      expect(findClosestHueAngle(185)).toBe(180);
    });

    it('should return exact angle when matching', () => {
      expect(findClosestHueAngle(0)).toBe(0);
      expect(findClosestHueAngle(60)).toBe(60);
      expect(findClosestHueAngle(120)).toBe(120);
      expect(findClosestHueAngle(240)).toBe(240);
    });

    it('should handle edge cases at 15 degrees (midpoint)', () => {
      // At 15 degrees (midpoint between 0 and 30), either 0 or 30 is valid
      const result = findClosestHueAngle(15);
      expect([0, 30]).toContain(result);
    });
  });
});
