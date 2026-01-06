/**
 * StyleTagChip Component Tests
 * Part of Story 4.2: Style Tag and Occasion Icon Display
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleTagChip, LegacyStyleTagChip } from './StyleTagChip';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.default.createAnimatedComponent = (component: any) => component;
  return Reanimated;
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

describe('StyleTagChip', () => {
  describe('render', () => {
    it('should render with style tags', () => {
      const { getByText } = render(
        <StyleTagChip tags={['简约', '通勤', '知性']} variant="style" />
      );

      expect(getByText('简约')).toBeTruthy();
      expect(getByText('通勤')).toBeTruthy();
      expect(getByText('知性')).toBeTruthy();
    });

    it('should render with occasion tags', () => {
      const { getByText } = render(
        <StyleTagChip tags={['职场', '商务']} variant="occasion" />
      );

      expect(getByText('职场')).toBeTruthy();
      expect(getByText('商务')).toBeTruthy();
    });

    it('should limit to 3 tags per AC requirement', () => {
      const { getByText, queryByText } = render(
        <StyleTagChip tags={['A', 'B', 'C', 'D', 'E']} variant="style" />
      );

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
      expect(queryByText('D')).toBeNull();
      expect(queryByText('E')).toBeNull();
    });

    it('should return null for empty tags', () => {
      const { toJSON } = render(<StyleTagChip tags={[]} variant="style" />);
      expect(toJSON()).toBeNull();
    });

    it('should return null for undefined tags', () => {
      const { toJSON } = render(
        <StyleTagChip tags={undefined as any} variant="style" />
      );
      expect(toJSON()).toBeNull();
    });
  });

  describe('sizes', () => {
    it('should render with default size (13pt font)', () => {
      const { getByText } = render(
        <StyleTagChip tags={['测试']} variant="style" size="default" />
      );
      const textElement = getByText('测试');
      expect(textElement).toBeTruthy();
      // Verify fontSize is applied - default size uses 13pt per AC #2
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 13 }),
        ])
      );
    });

    it('should render with compact size (12pt font)', () => {
      const { getByText } = render(
        <StyleTagChip tags={['测试']} variant="style" size="compact" />
      );
      const textElement = getByText('测试');
      expect(textElement).toBeTruthy();
      // Verify fontSize is applied - compact size uses 12pt per AC #2
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 12 }),
        ])
      );
    });

    it('should default to default size when size prop not provided', () => {
      const { getByText } = render(
        <StyleTagChip tags={['测试']} variant="style" />
      );
      const textElement = getByText('测试');
      // Should use default size (13pt)
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 13 }),
        ])
      );
    });
  });

  describe('interactions', () => {
    it('should call onTagPress when tag is pressed', () => {
      const onTagPress = jest.fn();
      const { getByText } = render(
        <StyleTagChip
          tags={['简约', '通勤']}
          variant="style"
          onTagPress={onTagPress}
        />
      );

      fireEvent.press(getByText('简约'));
      expect(onTagPress).toHaveBeenCalledWith('简约');

      fireEvent.press(getByText('通勤'));
      expect(onTagPress).toHaveBeenCalledWith('通勤');
    });

    it('should not throw if onTagPress is not provided', () => {
      const { getByText } = render(
        <StyleTagChip tags={['测试']} variant="style" />
      );

      expect(() => {
        fireEvent.press(getByText('测试'));
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have accessibility label for container', () => {
      const { getByLabelText } = render(
        <StyleTagChip tags={['简约']} variant="style" />
      );

      expect(getByLabelText('风格标签列表')).toBeTruthy();
    });

    it('should have accessibility labels for individual tags', () => {
      const { getByLabelText } = render(
        <StyleTagChip tags={['简约']} variant="style" />
      );

      expect(getByLabelText('风格标签：简约')).toBeTruthy();
    });

    it('should have correct accessibility label for occasion tags', () => {
      const { getByLabelText } = render(
        <StyleTagChip tags={['通勤']} variant="occasion" />
      );

      expect(getByLabelText('场合标签：通勤')).toBeTruthy();
    });

    it('should have occasion tags container label', () => {
      const { getByLabelText } = render(
        <StyleTagChip tags={['通勤']} variant="occasion" />
      );

      expect(getByLabelText('场合标签列表')).toBeTruthy();
    });
  });
});

describe('LegacyStyleTagChip', () => {
  it('should render single tag with legacy interface', () => {
    const { getByText } = render(
      <LegacyStyleTagChip label="简约" variant="style" />
    );

    expect(getByText('简约')).toBeTruthy();
  });

  it('should render occasion variant', () => {
    const { getByText } = render(
      <LegacyStyleTagChip label="通勤" variant="occasion" />
    );

    expect(getByText('通勤')).toBeTruthy();
  });

  it('should map small size to compact', () => {
    const { getByText } = render(
      <LegacyStyleTagChip label="测试" variant="style" size="small" />
    );

    expect(getByText('测试')).toBeTruthy();
  });

  it('should map medium size to default', () => {
    const { getByText } = render(
      <LegacyStyleTagChip label="测试" variant="style" size="medium" />
    );

    expect(getByText('测试')).toBeTruthy();
  });
});
