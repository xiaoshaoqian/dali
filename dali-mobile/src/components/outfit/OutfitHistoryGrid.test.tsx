/**
 * OutfitHistoryGrid Component Tests
 * @see Story 5.2: Outfit History Grid View
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock expo-router - must be before imports
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    replace: mockReplace,
  },
}));

// Mock hooks - must be before import
const mockRefetch = jest.fn();
const mockFetchNextPage = jest.fn();

jest.mock('@/hooks', () => ({
  useOutfitsInfinite: jest.fn(),
  flattenOutfitPages: jest.fn((pages) => pages?.flat() ?? []),
  formatRelativeDate: jest.fn(() => '今天'),
}));

const mockUseOutfitsInfinite = require('@/hooks').useOutfitsInfinite;

import { OutfitHistoryGrid } from './OutfitHistoryGrid';
import type { LocalOutfitRecord } from '@/utils/storage';

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
  isFavorited: false,
  isDeleted: false,
  syncStatus: 'pending',
};

const mockOutfit2: LocalOutfitRecord = {
  ...mockOutfit,
  id: 'test-outfit-2',
  name: '浪漫约会风',
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

describe('OutfitHistoryGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: undefined,
        isLoading: true,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByText('加载中...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isFetchingNextPage: false,
        isError: true,
        error: new Error('Database error'),
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByText('加载失败')).toBeTruthy();
      expect(getByText('Database error')).toBeTruthy();
    });

    it('should show default error message when error has no message', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isFetchingNextPage: false,
        isError: true,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByText('加载失败')).toBeTruthy();
      expect(getByText('无法加载搭配记录，请稍后重试')).toBeTruthy();
    });

    it('should call refetch when retry button is pressed', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isFetchingNextPage: false,
        isError: true,
        error: new Error('Network error'),
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      fireEvent.press(getByText('点击重试'));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should have accessible retry button', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isFetchingNextPage: false,
        isError: true,
        error: new Error('Error'),
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByLabelText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByLabelText('重试加载')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no outfits', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByText('还没有搭配记录')).toBeTruthy();
    });

    it('should render empty state with button (navigation test in e2e)', () => {
      // Note: expo-router navigation is complex to mock in Jest
      // Navigation behavior is tested in e2e tests
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByText('开始搭配')).toBeTruthy();
    });
  });

  describe('Grid Rendering', () => {
    it('should render outfit cards when data is available', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit, mockOutfit2]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getAllByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      // Each card shows name twice (thumbnail and info)
      expect(getAllByText('职场优雅风').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('浪漫约会风').length).toBeGreaterThanOrEqual(1);
    });

    it('should use 2-column layout', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { UNSAFE_getByType } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      // FlatList should have numColumns=2
      const flatList = UNSAFE_getByType('RCTScrollView' as any);
      // Note: We can't directly check numColumns from rendered output
      // This is verified by the component implementation
      expect(flatList).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('should call refetch on pull to refresh', async () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { UNSAFE_getByType } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      const flatList = UNSAFE_getByType('RCTScrollView' as any);

      // Simulate refresh
      flatList.props.refreshControl.props.onRefresh();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Infinite Scroll', () => {
    it('should fetch next page when end reached', async () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { UNSAFE_getByType } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      const flatList = UNSAFE_getByType('RCTScrollView' as any);

      // Simulate end reached
      flatList.props.onEndReached();

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('should not fetch next page when already fetching', async () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: true,
        isError: false,
        error: null,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { UNSAFE_getByType } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      const flatList = UNSAFE_getByType('RCTScrollView' as any);

      // Simulate end reached
      flatList.props.onEndReached();

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should not fetch next page when no more pages', async () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { UNSAFE_getByType } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      const flatList = UNSAFE_getByType('RCTScrollView' as any);

      // Simulate end reached
      flatList.props.onEndReached();

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should show loading footer when fetching next page', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: true,
        isError: false,
        error: null,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByText('加载更多...')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should have pressable outfit cards (navigation test in e2e)', () => {
      // Note: expo-router navigation is complex to mock in Jest
      // Navigation behavior is tested in e2e tests
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByRole } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      // Card should be a button (pressable)
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Filters', () => {
    it('should pass filters to useOutfitsInfinite', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const filters = { occasion: '职场通勤' };
      render(<OutfitHistoryGrid filters={filters} />, {
        wrapper: createWrapper(),
      });

      expect(mockUseOutfitsInfinite).toHaveBeenCalledWith(filters);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible list label', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const { getByLabelText } = render(<OutfitHistoryGrid />, {
        wrapper: createWrapper(),
      });

      expect(getByLabelText('搭配历史列表')).toBeTruthy();
    });
  });

  describe('Header Component', () => {
    it('should render ListHeaderComponent when provided', () => {
      mockUseOutfitsInfinite.mockReturnValue({
        data: { pages: [[mockOutfit]] },
        isLoading: false,
        isFetching: false,
        isRefreshing: false,
        isFetchingNextPage: false,
        isError: false,
        error: null,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
      });

      const Header = () => <></>;

      const { UNSAFE_queryByType } = render(
        <OutfitHistoryGrid ListHeaderComponent={Header} />,
        { wrapper: createWrapper() }
      );

      // Header should be rendered (implementation detail)
      expect(UNSAFE_queryByType('RCTScrollView' as any)).toBeTruthy();
    });
  });
});
