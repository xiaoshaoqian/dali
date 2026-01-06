/**
 * Filter Store Tests
 * Tests for outfit filter state management
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

import { useFilterStore, OCCASION_OPTIONS, TIME_RANGE_OPTIONS } from '../filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    // Reset store state
    useFilterStore.setState({
      occasion: undefined,
      timeRange: undefined,
      likeFilter: 'all',
    });
  });

  describe('setOccasion', () => {
    it('should set occasion filter', () => {
      const { setOccasion } = useFilterStore.getState();

      setOccasion('浪漫约会');
      expect(useFilterStore.getState().occasion).toBe('浪漫约会');
    });

    it('should clear occasion filter when set to undefined', () => {
      const { setOccasion } = useFilterStore.getState();

      setOccasion('职场通勤');
      expect(useFilterStore.getState().occasion).toBe('职场通勤');

      setOccasion(undefined);
      expect(useFilterStore.getState().occasion).toBeUndefined();
    });
  });

  describe('setTimeRange', () => {
    it('should set time range filter', () => {
      const { setTimeRange } = useFilterStore.getState();

      setTimeRange(7);
      expect(useFilterStore.getState().timeRange).toBe(7);

      setTimeRange(30);
      expect(useFilterStore.getState().timeRange).toBe(30);
    });

    it('should clear time range filter when set to undefined', () => {
      const { setTimeRange } = useFilterStore.getState();

      setTimeRange(90);
      expect(useFilterStore.getState().timeRange).toBe(90);

      setTimeRange(undefined);
      expect(useFilterStore.getState().timeRange).toBeUndefined();
    });
  });

  describe('setLikeFilter', () => {
    it('should set like filter', () => {
      const { setLikeFilter } = useFilterStore.getState();

      setLikeFilter('favorited');
      expect(useFilterStore.getState().likeFilter).toBe('favorited');

      setLikeFilter('liked');
      expect(useFilterStore.getState().likeFilter).toBe('liked');
    });
  });

  describe('cycleLikeFilter', () => {
    it('should cycle through filter states: all -> favorited -> liked -> all', () => {
      const { cycleLikeFilter } = useFilterStore.getState();

      expect(useFilterStore.getState().likeFilter).toBe('all');

      cycleLikeFilter();
      expect(useFilterStore.getState().likeFilter).toBe('favorited');

      cycleLikeFilter();
      expect(useFilterStore.getState().likeFilter).toBe('liked');

      cycleLikeFilter();
      expect(useFilterStore.getState().likeFilter).toBe('all');
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to default', () => {
      const { setOccasion, setTimeRange, setLikeFilter, clearFilters } =
        useFilterStore.getState();

      setOccasion('商务会议');
      setTimeRange(30);
      setLikeFilter('liked');

      clearFilters();

      const state = useFilterStore.getState();
      expect(state.occasion).toBeUndefined();
      expect(state.timeRange).toBeUndefined();
      expect(state.likeFilter).toBe('all');
    });
  });

  describe('getQueryFilters', () => {
    it('should return empty object when no filters are set', () => {
      const { getQueryFilters } = useFilterStore.getState();
      const filters = getQueryFilters();

      expect(filters).toEqual({});
    });

    it('should include occasion in query filters', () => {
      const { setOccasion, getQueryFilters } = useFilterStore.getState();

      setOccasion('浪漫约会');
      const filters = getQueryFilters();

      expect(filters.occasion).toBe('浪漫约会');
    });

    it('should convert timeRange to startDate timestamp', () => {
      const { setTimeRange, getQueryFilters } = useFilterStore.getState();

      const now = Date.now();
      setTimeRange(7);
      const filters = getQueryFilters();

      // startDate should be approximately 7 days ago
      const expectedStartDate = now - 7 * 24 * 60 * 60 * 1000;
      expect(filters.startDate).toBeDefined();
      // Allow 1 second tolerance for test execution time
      expect(Math.abs(filters.startDate! - expectedStartDate)).toBeLessThan(1000);
    });

    it('should set isFavorited when likeFilter is favorited', () => {
      const { setLikeFilter, getQueryFilters } = useFilterStore.getState();

      setLikeFilter('favorited');
      const filters = getQueryFilters();

      expect(filters.isFavorited).toBe(true);
      expect(filters.isLiked).toBeUndefined();
    });

    it('should set isLiked when likeFilter is liked', () => {
      const { setLikeFilter, getQueryFilters } = useFilterStore.getState();

      setLikeFilter('liked');
      const filters = getQueryFilters();

      expect(filters.isLiked).toBe(true);
      expect(filters.isFavorited).toBeUndefined();
    });

    it('should combine multiple filters', () => {
      const { setOccasion, setTimeRange, setLikeFilter, getQueryFilters } =
        useFilterStore.getState();

      setOccasion('职场通勤');
      setTimeRange(7);
      setLikeFilter('favorited');

      const filters = getQueryFilters();

      expect(filters.occasion).toBe('职场通勤');
      expect(filters.startDate).toBeDefined();
      expect(filters.isFavorited).toBe(true);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are active', () => {
      const { hasActiveFilters } = useFilterStore.getState();
      expect(hasActiveFilters()).toBe(false);
    });

    it('should return true when occasion filter is set', () => {
      const { setOccasion, hasActiveFilters } = useFilterStore.getState();
      setOccasion('浪漫约会');
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return true when timeRange filter is set', () => {
      const { setTimeRange, hasActiveFilters } = useFilterStore.getState();
      setTimeRange(30);
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return true when likeFilter is not all', () => {
      const { setLikeFilter, hasActiveFilters } = useFilterStore.getState();
      setLikeFilter('liked');
      expect(hasActiveFilters()).toBe(true);
    });
  });

  describe('constants', () => {
    it('should have correct occasion options', () => {
      expect(OCCASION_OPTIONS).toHaveLength(7);
      expect(OCCASION_OPTIONS[0].value).toBeUndefined(); // "全部"
      expect(OCCASION_OPTIONS[1].value).toBe('浪漫约会');
    });

    it('should have correct time range options', () => {
      expect(TIME_RANGE_OPTIONS).toHaveLength(4);
      expect(TIME_RANGE_OPTIONS[0].value).toBeUndefined(); // "全部时间"
      expect(TIME_RANGE_OPTIONS[1].value).toBe(7);
      expect(TIME_RANGE_OPTIONS[2].value).toBe(30);
      expect(TIME_RANGE_OPTIONS[3].value).toBe(90);
    });
  });
});
