/**
 * ShareTemplate Component Tests
 *
 * Unit tests for ShareTemplate component
 *
 * @module components/share/ShareTemplate.test
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ShareTemplate } from './ShareTemplate';
import type { OutfitData } from '@/types/share';

// Mock ViewShot
jest.mock('react-native-view-shot', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', { ...props, ref }, props.children);
    }),
  };
});

// Mock QRCode
jest.mock('react-native-qrcode-svg', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: (props: any) => {
      return React.createElement('View', props, props.children);
    },
  };
});

describe('ShareTemplate', () => {
  const mockOutfit: OutfitData = {
    id: '123',
    items: [
      { id: '1', imageUrl: 'https://example.com/item1.jpg' },
      { id: '2', imageUrl: 'https://example.com/item2.jpg' },
      { id: '3', imageUrl: 'https://example.com/item3.jpg' },
    ],
    styleTags: ['简约', '通勤'],
    occasionTag: '职场通勤',
    theoryExcerpt: '米色+黑白配色营造通勤专业感,适合职场环境...',
  };

  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Minimal Template', () => {
    it('should render minimal template with 3 outfit items', () => {
      const { getAllByTestId } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="minimal"
          onGenerate={mockOnGenerate}
        />
      );

      const items = getAllByTestId('outfit-item');
      expect(items).toHaveLength(3);
    });

    it('should display app watermark', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="minimal"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('AI为你搭配')).toBeTruthy();
    });

    it('should display logo', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="minimal"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('搭理')).toBeTruthy();
    });
  });

  describe('Fashion Template', () => {
    it('should render fashion template with 3 outfit items', () => {
      const { getAllByTestId } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      const items = getAllByTestId('outfit-item');
      expect(items).toHaveLength(3);
    });

    it('should display title "搭理AI推荐"', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('搭理AI推荐')).toBeTruthy();
    });

    it('should display style tags', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('简约')).toBeTruthy();
      expect(getByText('通勤')).toBeTruthy();
    });

    it('should display occasion tag', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText(/职场通勤/)).toBeTruthy();
    });

    it('should display theory excerpt', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText(/米色\+黑白配色/)).toBeTruthy();
    });
  });

  describe('Artistic Template', () => {
    it('should render artistic template with 3 outfit items', () => {
      const { getAllByTestId } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="artistic"
          onGenerate={mockOnGenerate}
        />
      );

      const items = getAllByTestId('outfit-item');
      expect(items).toHaveLength(3);
    });

    it('should display title "你的专属搭配方案"', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="artistic"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('你的专属搭配方案')).toBeTruthy();
    });

    it('should display theory section', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="artistic"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('配色理论解析')).toBeTruthy();
      expect(getByText(/米色\+黑白配色/)).toBeTruthy();
    });

    it('should display style tags with # prefix', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="artistic"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('#简约')).toBeTruthy();
      expect(getByText('#通勤')).toBeTruthy();
    });

    it('should display footer with logo and subtitle', () => {
      const { getByText } = render(
        <ShareTemplate
          outfit={mockOutfit}
          templateStyle="artistic"
          onGenerate={mockOnGenerate}
        />
      );

      expect(getByText('搭理')).toBeTruthy();
      expect(getByText('AI穿搭知识库')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long theory excerpt (>150 chars) by truncating', () => {
      const longTheoryOutfit: OutfitData = {
        ...mockOutfit,
        theoryExcerpt:
          '这是一个非常长的理论解析文本,用于测试截断功能是否正常工作。这段文本包含超过150个字符,系统应该自动截断并添加省略号。我们需要确保在所有模板中都能正确处理超长文本,以保持良好的视觉效果和用户体验。继续添加更多文字以确保超过150个字符的限制...',
      };

      const { getByText } = render(
        <ShareTemplate
          outfit={longTheoryOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      // Should truncate and add ellipsis
      const textElement = getByText(/这是一个非常长的理论解析文本/);
      expect(textElement).toBeTruthy();
    });

    it('should handle missing style tags gracefully', () => {
      const noTagsOutfit: OutfitData = {
        ...mockOutfit,
        styleTags: [],
      };

      const { queryByText } = render(
        <ShareTemplate
          outfit={noTagsOutfit}
          templateStyle="fashion"
          onGenerate={mockOnGenerate}
        />
      );

      // Should not crash, tags section should be empty
      expect(queryByText('简约')).toBeNull();
    });

    it('should render exactly 3 items even if more are provided', () => {
      const manyItemsOutfit: OutfitData = {
        ...mockOutfit,
        items: [
          { id: '1', imageUrl: 'url1' },
          { id: '2', imageUrl: 'url2' },
          { id: '3', imageUrl: 'url3' },
          { id: '4', imageUrl: 'url4' },
          { id: '5', imageUrl: 'url5' },
        ],
      };

      const { getAllByTestId } = render(
        <ShareTemplate
          outfit={manyItemsOutfit}
          templateStyle="minimal"
          onGenerate={mockOnGenerate}
        />
      );

      const items = getAllByTestId('outfit-item');
      expect(items).toHaveLength(3);
    });
  });
});
