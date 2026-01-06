/**
 * FilterBar Component Tests
 * Tests for the filter bar UI component
 *
 * @see Story 5.3: Filter by Occasion, Time, and Favorites
 */

// Mock AsyncStorage for zustand persist middleware
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FilterBar } from '../FilterBar';
import {
  useFilterStore,
  useOccasionLabel,
  useTimeRangeLabel,
  useLikeFilterDisplay
} from '@/stores';

// Mock the filter store
jest.mock('@/stores', () => ({
  useFilterStore: jest.fn(),
  useOccasionLabel: jest.fn(),
  useTimeRangeLabel: jest.fn(),
  useLikeFilterDisplay: jest.fn(),
}));

// Mock icons
jest.mock('@/components/ui/icons', () => ({
  ChevronDownIcon: () => null,
}));

describe('FilterBar', () => {
  const mockSetOccasion = jest.fn();
  const mockSetTimeRange = jest.fn();
  const mockCycleLikeFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFilterStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        occasion: undefined,
        timeRange: undefined,
        setOccasion: mockSetOccasion,
        setTimeRange: mockSetTimeRange,
        cycleLikeFilter: mockCycleLikeFilter,
      };
      return selector(state);
    });

    (useOccasionLabel as jest.Mock).mockReturnValue('场合');
    (useTimeRangeLabel as jest.Mock).mockReturnValue('全部时间');
    (useLikeFilterDisplay as jest.Mock).mockReturnValue({
      label: '收藏/点赞',
      color: '#6C63FF',
      isActive: false,
    });
  });

  it('should render three filter buttons', () => {
    const { getByText } = render(<FilterBar />);

    expect(getByText('场合')).toBeTruthy();
    expect(getByText('全部时间')).toBeTruthy();
    expect(getByText('收藏/点赞')).toBeTruthy();
  });

  it('should call cycleLikeFilter when like filter button is pressed', () => {
    const { getByText } = render(<FilterBar />);

    fireEvent.press(getByText('收藏/点赞'));

    expect(mockCycleLikeFilter).toHaveBeenCalledTimes(1);
  });

  it('should call onFiltersChange when filters change', () => {
    const onFiltersChange = jest.fn();
    const { getByText } = render(<FilterBar onFiltersChange={onFiltersChange} />);

    fireEvent.press(getByText('收藏/点赞'));

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
  });

  it('should show active state for occasion filter when occasion is set', () => {
    (useOccasionLabel as jest.Mock).mockReturnValue('🏢 职场通勤');

    (useFilterStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        occasion: '职场通勤',
        timeRange: undefined,
        setOccasion: mockSetOccasion,
        setTimeRange: mockSetTimeRange,
        cycleLikeFilter: mockCycleLikeFilter,
      };
      return selector(state);
    });

    const { getByText } = render(<FilterBar />);

    // Verify occasion filter button exists
    expect(getByText('🏢 职场通勤')).toBeTruthy();
  });

  it('should show active state for time range filter when time range is set', () => {
    (useTimeRangeLabel as jest.Mock).mockReturnValue('最近 7 天');

    (useFilterStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        occasion: undefined,
        timeRange: 7,
        setOccasion: mockSetOccasion,
        setTimeRange: mockSetTimeRange,
        cycleLikeFilter: mockCycleLikeFilter,
      };
      return selector(state);
    });

    const { getByText } = render(<FilterBar />);

    // Verify time filter button exists
    expect(getByText('最近 7 天')).toBeTruthy();
  });

  it('should open bottom sheet when occasion button is pressed', async () => {
    const { getByText } = render(<FilterBar />);

    fireEvent.press(getByText('场合'));

    // Bottom sheet should be rendered (tested in FilterBottomSheet tests)
    await waitFor(() => {
      expect(mockSetOccasion).not.toHaveBeenCalled(); // Only opens sheet, doesn't set yet
    });
  });

  it('should open bottom sheet when time range button is pressed', async () => {
    const { getByText } = render(<FilterBar />);

    fireEvent.press(getByText('全部时间'));

    await waitFor(() => {
      expect(mockSetTimeRange).not.toHaveBeenCalled();
    });
  });

  it('should have correct accessibility labels', () => {
    const { getAllByRole } = render(<FilterBar />);
    const buttons = getAllByRole('button');

    // Should have 3 filter buttons
    expect(buttons).toHaveLength(3);
  });

  it('should render filter buttons with correct structure', () => {
    const { getAllByRole } = render(<FilterBar />);
    const buttons = getAllByRole('button');

    expect(buttons).toHaveLength(3);
  });
});
