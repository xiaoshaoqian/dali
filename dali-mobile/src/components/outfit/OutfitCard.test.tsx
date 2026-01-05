/**
 * OutfitCard Component Tests
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OutfitCard } from '../OutfitCard';
import type { OutfitRecommendation } from '@/services';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.createAnimatedComponent = (component: React.ComponentType) => component;
  return Reanimated;
});

const mockRecommendation: OutfitRecommendation = {
  id: 'test-outfit-1',
  name: '职场优雅风',
  items: [
    { itemType: '上装', name: '真丝衬衫', color: '白色', colorHex: '#FFFFFF', styleTip: '职场必备' },
    { itemType: '下装', name: '西装裤', color: '黑色', colorHex: '#000000', styleTip: '拉长腿型' },
    { itemType: '配饰', name: '手提包', color: '棕色', colorHex: '#8B4513', styleTip: '点缀色彩' },
  ],
  theory: {
    colorPrinciple: '黑白配',
    styleAnalysis: '简约通勤风格',
    bodyTypeAdvice: '阔腿裤版型能有效优化腿部线条',
    occasionFit: '正式程度 ★★★★★，完美应对周一例会',
    fullExplanation: '米色 + 黑白配色营造通勤专业感',
  },
  styleTags: ['简约', '通勤'],
  confidence: 0.95,
};

describe('OutfitCard', () => {
  describe('render', () => {
    it('should render outfit name correctly', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />
      );
      expect(getByText('职场优雅风')).toBeTruthy();
    });

    it('should render style tags', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />
      );
      expect(getByText('简约')).toBeTruthy();
      expect(getByText('通勤')).toBeTruthy();
    });

    it('should render AI badge', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />
      );
      expect(getByText('AI 推荐')).toBeTruthy();
    });

    it('should render outfit items', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />
      );
      expect(getByText('真丝衬衫')).toBeTruthy();
      expect(getByText('西装裤')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />
      );
      expect(getByText('点赞')).toBeTruthy();
      expect(getByText('收藏')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <OutfitCard
          recommendation={mockRecommendation}
          index={0}
          onPress={onPress}
        />
      );

      // Find and press the main look area
      fireEvent.press(getByText('查看详情'));
      expect(onPress).toHaveBeenCalled();
    });

    it('should call onLike when like button is pressed', () => {
      const onLike = jest.fn();
      const { getByText } = render(
        <OutfitCard
          recommendation={mockRecommendation}
          index={0}
          onLike={onLike}
        />
      );

      fireEvent.press(getByText('点赞'));
      expect(onLike).toHaveBeenCalled();
    });

    it('should toggle like state when like button is pressed', () => {
      const { getByText, queryByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />
      );

      const likeButton = getByText('点赞');
      fireEvent.press(likeButton);
      expect(queryByText('已点赞')).toBeTruthy();
    });

    it('should call onSave when save button is pressed', () => {
      const onSave = jest.fn();
      const { getByText } = render(
        <OutfitCard
          recommendation={mockRecommendation}
          index={0}
          onSave={onSave}
        />
      );

      fireEvent.press(getByText('收藏'));
      expect(onSave).toHaveBeenCalled();
    });
  });
});
