/**
 * useAIProgress Hook Tests
 * Tests for AI learning progress calculation and stage messages
 *
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 */
import { renderHook } from '@testing-library/react-native';
import { useAIProgress } from '../useAIProgress';

describe('useAIProgress', () => {
  describe('progress calculation', () => {
    it('should return correct progress from aiAccuracy', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.82, totalOutfits: 45, favoriteCount: 12 })
      );
      expect(result.current.progress).toBe(82);
    });

    it('should cap progress at 100%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 1.5, totalOutfits: 100, favoriteCount: 50 })
      );
      expect(result.current.progress).toBeLessThanOrEqual(100);
    });

    it('should handle 0 aiAccuracy', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0, totalOutfits: 0, favoriteCount: 0 })
      );
      expect(result.current.progress).toBe(0);
    });

    it('should calculate fallback progress from outfits and favorites when aiAccuracy is 0', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0, totalOutfits: 20, favoriteCount: 10 })
      );
      // outfitScore = (20/20) * 30 = 30
      // favoriteScore = (10/10) * 40 = 40
      // Total = 70
      expect(result.current.progress).toBe(70);
    });

    it('should cap individual scores in fallback calculation', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0, totalOutfits: 100, favoriteCount: 50 })
      );
      // outfitScore capped at 30
      // favoriteScore capped at 40
      // Total capped at 70 (without aiAccuracy component)
      expect(result.current.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('stage messages', () => {
    it('should return stage 1 message for 0-20%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.15, totalOutfits: 2, favoriteCount: 0 })
      );
      expect(result.current.stageMessage).toBe('AI 正在学习你的风格...');
    });

    it('should return stage 1 message for exactly 20%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.20, totalOutfits: 5, favoriteCount: 1 })
      );
      expect(result.current.stageMessage).toBe('AI 正在学习你的风格...');
    });

    it('should return stage 2 message for 21-50%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.35, totalOutfits: 10, favoriteCount: 3 })
      );
      expect(result.current.stageMessage).toBe('AI 开始了解你的喜好了');
    });

    it('should return stage 2 message for exactly 50%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.50, totalOutfits: 15, favoriteCount: 5 })
      );
      expect(result.current.stageMessage).toBe('AI 开始了解你的喜好了');
    });

    it('should return stage 3 message for 51-80%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.65, totalOutfits: 30, favoriteCount: 8 })
      );
      expect(result.current.stageMessage).toBe('AI 越来越懂你啦');
    });

    it('should return stage 3 message for exactly 80%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.80, totalOutfits: 40, favoriteCount: 10 })
      );
      expect(result.current.stageMessage).toBe('AI 越来越懂你啦');
    });

    it('should return stage 4 message for 81-100%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0.90, totalOutfits: 50, favoriteCount: 20 })
      );
      expect(result.current.stageMessage).toBe('AI 已经很懂你的风格了！');
    });

    it('should return stage 4 message for 100%', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 1.0, totalOutfits: 100, favoriteCount: 50 })
      );
      expect(result.current.stageMessage).toBe('AI 已经很懂你的风格了！');
    });
  });

  describe('edge cases', () => {
    it('should handle negative aiAccuracy', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: -0.5, totalOutfits: 10, favoriteCount: 5 })
      );
      // Negative should be treated as 0 and use fallback
      expect(result.current.progress).toBeGreaterThanOrEqual(0);
    });

    it('should handle undefined-like values gracefully', () => {
      const { result } = renderHook(() =>
        useAIProgress({ aiAccuracy: 0, totalOutfits: 0, favoriteCount: 0 })
      );
      expect(result.current.progress).toBe(0);
      expect(result.current.stageMessage).toBe('AI 正在学习你的风格...');
    });
  });
});
