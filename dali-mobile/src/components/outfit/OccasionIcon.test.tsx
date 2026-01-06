/**
 * OccasionIcon Component Tests
 * Part of Story 4.2: Style Tag and Occasion Icon Display
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { OccasionIcon, isValidOccasionType, getAllOccasionTypes } from './OccasionIcon';
import type { OccasionType } from './OccasionIcon';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'svg-root', ...props }, children),
    Svg: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'svg-root', ...props }, children),
    Path: (props: any) => React.createElement(View, { testID: 'svg-path', ...props }),
    Circle: (props: any) => React.createElement(View, { testID: 'svg-circle', ...props }),
    Rect: (props: any) => React.createElement(View, { testID: 'svg-rect', ...props }),
    Ellipse: (props: any) => React.createElement(View, { testID: 'svg-ellipse', ...props }),
    G: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'svg-g', ...props }, children),
  };
});

describe('OccasionIcon', () => {
  describe('render', () => {
    it('should render all 6 occasion types', () => {
      const occasions: OccasionType[] = [
        '浪漫约会',
        '商务会议',
        '职场通勤',
        '朋友聚会',
        '日常出行',
        '居家休闲',
      ];

      occasions.forEach((occasion) => {
        const { toJSON } = render(<OccasionIcon occasion={occasion} />);
        expect(toJSON()).toBeTruthy();
      });
    });

    it('should render with default size 20pt and pass it to SVG', () => {
      const { getByTestId } = render(<OccasionIcon occasion="职场通勤" />);
      const svgRoot = getByTestId('svg-root');
      // Verify default size (20) is passed to SVG per AC #4
      expect(svgRoot.props.width).toBe(20);
      expect(svgRoot.props.height).toBe(20);
    });

    it('should render with custom size and pass it to SVG', () => {
      const { getByTestId } = render(<OccasionIcon occasion="职场通勤" size={32} />);
      const svgRoot = getByTestId('svg-root');
      expect(svgRoot.props.width).toBe(32);
      expect(svgRoot.props.height).toBe(32);
    });

    it('should render with default color #6C63FF and pass it to SVG', () => {
      const { getByTestId } = render(<OccasionIcon occasion="浪漫约会" />);
      const svgRoot = getByTestId('svg-root');
      // Verify default color (#6C63FF Primary Purple) per AC #4
      expect(svgRoot.props.fill).toBe('#6C63FF');
    });

    it('should render with custom color and pass it to SVG', () => {
      const { getByTestId } = render(
        <OccasionIcon occasion="浪漫约会" color="#FF6B9D" />
      );
      const svgRoot = getByTestId('svg-root');
      expect(svgRoot.props.fill).toBe('#FF6B9D');
    });

    it('should return null for unknown occasion type', () => {
      const { toJSON } = render(
        <OccasionIcon occasion={'未知场合' as OccasionType} />
      );
      expect(toJSON()).toBeNull();
    });
  });

  describe('showLabel', () => {
    it('should not show label by default', () => {
      const { queryByText } = render(<OccasionIcon occasion="职场通勤" />);
      expect(queryByText('职场通勤')).toBeNull();
    });

    it('should show label when showLabel is true', () => {
      const { getByText } = render(
        <OccasionIcon occasion="职场通勤" showLabel={true} />
      );
      expect(getByText('职场通勤')).toBeTruthy();
    });

    it('should show all occasion labels correctly', () => {
      const occasions: OccasionType[] = [
        '浪漫约会',
        '商务会议',
        '职场通勤',
        '朋友聚会',
        '日常出行',
        '居家休闲',
      ];

      occasions.forEach((occasion) => {
        const { getByText } = render(
          <OccasionIcon occasion={occasion} showLabel={true} />
        );
        expect(getByText(occasion)).toBeTruthy();
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessibility label for container', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="职场通勤" />);
      expect(getByLabelText('职场通勤场合，建筑图标')).toBeTruthy();
    });

    it('should have correct accessibility label for 浪漫约会', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="浪漫约会" />);
      expect(getByLabelText('浪漫约会场合，心形图标')).toBeTruthy();
    });

    it('should have correct accessibility label for 商务会议', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="商务会议" />);
      expect(getByLabelText('商务会议场合，公文包图标')).toBeTruthy();
    });

    it('should have correct accessibility label for 职场通勤', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="职场通勤" />);
      expect(getByLabelText('职场通勤场合，建筑图标')).toBeTruthy();
    });

    it('should have correct accessibility label for 朋友聚会', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="朋友聚会" />);
      expect(getByLabelText('朋友聚会场合，多人图标')).toBeTruthy();
    });

    it('should have correct accessibility label for 日常出行', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="日常出行" />);
      expect(getByLabelText('日常出行场合，咖啡杯图标')).toBeTruthy();
    });

    it('should have correct accessibility label for 居家休闲', () => {
      const { getByLabelText } = render(<OccasionIcon occasion="居家休闲" />);
      expect(getByLabelText('居家休闲场合，房屋图标')).toBeTruthy();
    });
  });
});

describe('isValidOccasionType', () => {
  it('should return true for valid occasion types', () => {
    expect(isValidOccasionType('浪漫约会')).toBe(true);
    expect(isValidOccasionType('商务会议')).toBe(true);
    expect(isValidOccasionType('职场通勤')).toBe(true);
    expect(isValidOccasionType('朋友聚会')).toBe(true);
    expect(isValidOccasionType('日常出行')).toBe(true);
    expect(isValidOccasionType('居家休闲')).toBe(true);
  });

  it('should return false for invalid occasion types', () => {
    expect(isValidOccasionType('未知场合')).toBe(false);
    expect(isValidOccasionType('')).toBe(false);
    expect(isValidOccasionType('random')).toBe(false);
  });
});

describe('getAllOccasionTypes', () => {
  it('should return all 6 occasion types', () => {
    const types = getAllOccasionTypes();
    expect(types).toHaveLength(6);
    expect(types).toContain('浪漫约会');
    expect(types).toContain('商务会议');
    expect(types).toContain('职场通勤');
    expect(types).toContain('朋友聚会');
    expect(types).toContain('日常出行');
    expect(types).toContain('居家休闲');
  });
});

describe('exports', () => {
  it('should export OccasionIcon component', () => {
    expect(OccasionIcon).toBeDefined();
    expect(typeof OccasionIcon).toBe('function');
  });

  it('should export isValidOccasionType function', () => {
    expect(isValidOccasionType).toBeDefined();
    expect(typeof isValidOccasionType).toBe('function');
  });

  it('should export getAllOccasionTypes function', () => {
    expect(getAllOccasionTypes).toBeDefined();
    expect(typeof getAllOccasionTypes).toBe('function');
  });

  it('should export OccasionType type (compile-time check)', () => {
    // TypeScript compile-time check
    const type: OccasionType = '职场通勤';
    expect(type).toBe('职场通勤');
  });
});
