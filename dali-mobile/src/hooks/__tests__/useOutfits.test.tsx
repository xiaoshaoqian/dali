/**
 * useOutfits Hook Tests
 * @see Story 5.2: Outfit History Grid View
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useOutfits,
  useOutfitsInfinite,
  useOutfitCount,
  useOutfit,
  formatRelativeDate,
  flattenOutfitPages,
  outfitKeys,
} from '../useOutfits';
import type { LocalOutfitRecord } from '@/utils/storage';

// Mock storage functions
jest.mock('@/utils/storage', () => ({
  getOutfits: jest.fn(),
  getOutfitCount: jest.fn(),
  getOutfitById: jest.fn(),
}));

const mockGetOutfits = require('@/utils/storage').getOutfits;
const mockGetOutfitCount = require('@/utils/storage').getOutfitCount;
const mockGetOutfitById = require('@/utils/storage').getOutfitById;

// Test data
const mockOutfit: LocalOutfitRecord = {
  id: 'test-outfit-1',
  userId: 'user-123',
  name: '职场优雅风',
  occasion: '职场通勤',
  garmentImageUrl: 'https://example.com/garment.jpg',
  itemsJson: '[]',
  theoryJson: '{}',
  styleTagsJson: '["简约", "通勤"]',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isLiked: false,
  isFavorited: true,
  isDeleted: false,
  syncStatus: 'pending',
};

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useOutfits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOutfits hook', () => {
    it('should fetch outfits successfully', async () => {
      mockGetOutfits.mockResolvedValue([mockOutfit]);

      const { result } = renderHook(() => useOutfits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockOutfit]);
      expect(mockGetOutfits).toHaveBeenCalledWith(undefined);
    });

    it('should fetch outfits with filters', async () => {
      mockGetOutfits.mockResolvedValue([mockOutfit]);

      const filters = { occasion: '职场通勤', isLiked: true };
      const { result } = renderHook(() => useOutfits(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetOutfits).toHaveBeenCalledWith(filters);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Database error');
      mockGetOutfits.mockRejectedValue(error);

      const { result } = renderHook(() => useOutfits(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });
  });

  describe('useOutfitsInfinite hook', () => {
    it('should fetch first page of outfits', async () => {
      mockGetOutfits.mockResolvedValue([mockOutfit]);

      const { result } = renderHook(() => useOutfitsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.data?.pages[0]).toEqual([mockOutfit]);
    });

    it('should pass filters with pagination params', async () => {
      mockGetOutfits.mockResolvedValue([mockOutfit]);

      const filters = { occasion: '职场通勤' };
      const { result } = renderHook(() => useOutfitsInfinite(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetOutfits).toHaveBeenCalledWith({
        ...filters,
        limit: 20,
        offset: 0,
      });
    });

    it('should have next page when page is full', async () => {
      // Return 20 items (full page)
      const fullPage = Array(20).fill(mockOutfit);
      mockGetOutfits.mockResolvedValue(fullPage);

      const { result } = renderHook(() => useOutfitsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasNextPage).toBe(true);
    });

    it('should not have next page when page is partial', async () => {
      // Return less than 20 items
      const partialPage = [mockOutfit, mockOutfit];
      mockGetOutfits.mockResolvedValue(partialPage);

      const { result } = renderHook(() => useOutfitsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe('useOutfitCount hook', () => {
    it('should fetch outfit count', async () => {
      mockGetOutfitCount.mockResolvedValue(42);

      const { result } = renderHook(() => useOutfitCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(42);
    });

    it('should fetch count with filters', async () => {
      mockGetOutfitCount.mockResolvedValue(10);

      const filters = { occasion: '职场通勤' };
      const { result } = renderHook(() => useOutfitCount(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetOutfitCount).toHaveBeenCalledWith(filters);
    });
  });

  describe('useOutfit hook', () => {
    it('should fetch single outfit by ID', async () => {
      mockGetOutfitById.mockResolvedValue(mockOutfit);

      const { result } = renderHook(() => useOutfit('test-outfit-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOutfit);
      expect(mockGetOutfitById).toHaveBeenCalledWith('test-outfit-1');
    });

    it('should not fetch when ID is empty', async () => {
      const { result } = renderHook(() => useOutfit(''), {
        wrapper: createWrapper(),
      });

      // Should not be loading or fetch
      expect(result.current.isFetching).toBe(false);
      expect(mockGetOutfitById).not.toHaveBeenCalled();
    });

    it('should return null when outfit not found', async () => {
      mockGetOutfitById.mockResolvedValue(null);

      const { result } = renderHook(() => useOutfit('non-existent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });
  });
});

describe('Query Keys', () => {
  it('should generate correct query keys', () => {
    expect(outfitKeys.all).toEqual(['outfits']);
    expect(outfitKeys.local()).toEqual(['outfits', 'local']);
    expect(outfitKeys.lists()).toEqual(['outfits', 'local', 'list']);
    expect(outfitKeys.list({ occasion: '职场通勤' })).toEqual([
      'outfits',
      'local',
      'list',
      { occasion: '职场通勤' },
    ]);
    expect(outfitKeys.infinite({ isLiked: true })).toEqual([
      'outfits',
      'local',
      'infinite',
      { isLiked: true },
    ]);
    expect(outfitKeys.count()).toEqual(['outfits', 'local', 'count', undefined]);
    expect(outfitKeys.detail('123')).toEqual(['outfits', 'local', 'detail', '123']);
  });
});

describe('Utility Functions', () => {
  describe('formatRelativeDate', () => {
    it('should return "今天" for today', () => {
      const now = Date.now();
      expect(formatRelativeDate(now)).toBe('今天');
    });

    it('should return "今天" for earlier today', () => {
      const today = Date.now() - 10 * 60 * 60 * 1000; // 10 hours ago
      expect(formatRelativeDate(today)).toBe('今天');
    });

    it('should return "昨天" for yesterday', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(formatRelativeDate(yesterday)).toBe('昨天');
    });

    it('should return "X天前" for days within a week', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(formatRelativeDate(threeDaysAgo)).toBe('3天前');
    });

    it('should return "X月X日" for dates older than a week', () => {
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const date = new Date(twoWeeksAgo);
      const expected = `${date.getMonth() + 1}月${date.getDate()}日`;
      expect(formatRelativeDate(twoWeeksAgo)).toBe(expected);
    });
  });

  describe('flattenOutfitPages', () => {
    it('should return empty array for undefined pages', () => {
      expect(flattenOutfitPages(undefined)).toEqual([]);
    });

    it('should return empty array for empty pages', () => {
      expect(flattenOutfitPages([])).toEqual([]);
    });

    it('should flatten single page', () => {
      const pages = [[mockOutfit]];
      expect(flattenOutfitPages(pages)).toEqual([mockOutfit]);
    });

    it('should flatten multiple pages', () => {
      const outfit2 = { ...mockOutfit, id: 'test-outfit-2' };
      const pages = [[mockOutfit], [outfit2]];
      expect(flattenOutfitPages(pages)).toEqual([mockOutfit, outfit2]);
    });
  });
});
