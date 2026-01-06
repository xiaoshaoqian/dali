/**
 * OutfitCard Component Tests
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 * Updated for Story 4.2: Uses new StyleTagChip component
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OutfitCard } from './OutfitCard';
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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

// Mock expo-sqlite for offline store
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(() => []),
  })),
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(() => []),
  })),
}));

// Mock storage utils to prevent actual database operations
jest.mock('@/utils/storage', () => ({
  getDb: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(() => []),
  })),
  initDatabase: jest.fn(() => Promise.resolve()),
  updateOutfitLikeStatus: jest.fn(() => Promise.resolve()),
  updateOutfitSaveStatus: jest.fn(() => Promise.resolve()),
  getOutfitById: jest.fn(() => Promise.resolve(null)),
  getPendingSyncOutfits: jest.fn(() => Promise.resolve([])),
  markOutfitAsSynced: jest.fn(() => Promise.resolve()),
  saveOutfitToLocal: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      Tap: () => ({
        numberOfTaps: () => ({ onEnd: () => ({}) }),
        onEnd: () => ({}),
      }),
      LongPress: () => ({
        minDuration: () => ({ onEnd: () => ({}) }),
        onEnd: () => ({}),
      }),
      Exclusive: () => ({}),
    },
  };
});

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

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
        <OutfitCard recommendation={mockRecommendation} index={0} />,
        { wrapper: createWrapper() }
      );
      expect(getByText('职场优雅风')).toBeTruthy();
    });

    it('should render style tags', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />,
        { wrapper: createWrapper() }
      );
      expect(getByText('简约')).toBeTruthy();
      expect(getByText('通勤')).toBeTruthy();
    });

    it('should render AI badge', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />,
        { wrapper: createWrapper() }
      );
      expect(getByText('AI 推荐')).toBeTruthy();
    });

    it('should render outfit items', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />,
        { wrapper: createWrapper() }
      );
      expect(getByText('真丝衬衫')).toBeTruthy();
      expect(getByText('西装裤')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const { getByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />,
        { wrapper: createWrapper() }
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
        />,
        { wrapper: createWrapper() }
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
        />,
        { wrapper: createWrapper() }
      );

      fireEvent.press(getByText('点赞'));
      expect(onLike).toHaveBeenCalled();
    });

    it('should toggle like state when like button is pressed', () => {
      const { getByText, queryByText } = render(
        <OutfitCard recommendation={mockRecommendation} index={0} />,
        { wrapper: createWrapper() }
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
        />,
        { wrapper: createWrapper() }
      );

      fireEvent.press(getByText('收藏'));
      expect(onSave).toHaveBeenCalled();
    });
  });
});
