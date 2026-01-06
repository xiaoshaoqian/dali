/**
 * Filter Store
 * Zustand store for managing outfit filter state with persistence
 *
 * @see Story 5.3: Filter by Occasion, Time, and Favorites
 * @see AC #8: Filter state persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OutfitFilters } from '@/utils/storage';

// =============================================================================
// Types
// =============================================================================

/** Like filter state: all | favorited | liked */
export type LikeFilterState = 'all' | 'favorited' | 'liked';

/** Time range filter in days (undefined = all time) */
export type TimeRangeValue = undefined | 7 | 30 | 90;

/** Occasion filter option */
export interface OccasionOption {
  value: string | undefined;
  label: string;
  emoji: string;
}

/** Time range filter option */
export interface TimeRangeOption {
  value: TimeRangeValue;
  label: string;
  days: number;
}

/** Filter store state */
export interface FilterState {
  /** Selected occasion filter (undefined = all) */
  occasion: string | undefined;
  /** Selected time range in days (undefined = all time) */
  timeRange: TimeRangeValue;
  /** Like/favorite filter state */
  likeFilter: LikeFilterState;
}

/** Filter store actions */
export interface FilterActions {
  /** Set occasion filter */
  setOccasion: (occasion: string | undefined) => void;
  /** Set time range filter */
  setTimeRange: (timeRange: TimeRangeValue) => void;
  /** Set like/favorite filter */
  setLikeFilter: (filter: LikeFilterState) => void;
  /** Cycle through like filter states: all -> favorited -> liked -> all */
  cycleLikeFilter: () => void;
  /** Clear all filters to default */
  clearFilters: () => void;
  /** Get filters formatted for query */
  getQueryFilters: () => Omit<OutfitFilters, 'limit' | 'offset' | 'userId'>;
  /** Check if any filter is active */
  hasActiveFilters: () => boolean;
}

// =============================================================================
// Constants
// =============================================================================

/** Occasion filter options with emoji */
export const OCCASION_OPTIONS: OccasionOption[] = [
  { value: undefined, label: '全部', emoji: '' },
  { value: '浪漫约会', label: '浪漫约会', emoji: '💕' },
  { value: '商务会议', label: '商务会议', emoji: '💼' },
  { value: '职场通勤', label: '职场通勤', emoji: '🏢' },
  { value: '朋友聚会', label: '朋友聚会', emoji: '🎉' },
  { value: '日常出行', label: '日常出行', emoji: '☕' },
  { value: '居家休闲', label: '居家休闲', emoji: '🏠' },
];

/** Time range filter options */
export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: undefined, label: '全部时间', days: 0 },
  { value: 7, label: '最近 7 天', days: 7 },
  { value: 30, label: '最近 30 天', days: 30 },
  { value: 90, label: '最近 3 个月', days: 90 },
];

/** Default filter state */
const DEFAULT_FILTER_STATE: FilterState = {
  occasion: undefined,
  timeRange: undefined,
  likeFilter: 'all',
};

// =============================================================================
// Store
// =============================================================================

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_FILTER_STATE,

      // Actions
      setOccasion: (occasion) => set({ occasion }),

      setTimeRange: (timeRange) => set({ timeRange }),

      setLikeFilter: (likeFilter) => set({ likeFilter }),

      cycleLikeFilter: () => {
        const current = get().likeFilter;
        const next: LikeFilterState =
          current === 'all'
            ? 'favorited'
            : current === 'favorited'
              ? 'liked'
              : 'all';
        set({ likeFilter: next });
      },

      clearFilters: () => set(DEFAULT_FILTER_STATE),

      getQueryFilters: () => {
        const { occasion, timeRange, likeFilter } = get();

        const filters: Omit<OutfitFilters, 'limit' | 'offset' | 'userId'> = {};

        // Add occasion filter
        if (occasion !== undefined) {
          filters.occasion = occasion;
        }

        // Add time range filter (convert days to startDate timestamp)
        if (timeRange !== undefined) {
          const now = Date.now();
          const msPerDay = 24 * 60 * 60 * 1000;
          filters.startDate = now - timeRange * msPerDay;
        }

        // Add like/favorite filter
        if (likeFilter === 'favorited') {
          filters.isFavorited = true;
        } else if (likeFilter === 'liked') {
          filters.isLiked = true;
        }

        return filters;
      },

      hasActiveFilters: () => {
        const { occasion, timeRange, likeFilter } = get();
        return (
          occasion !== undefined ||
          timeRange !== undefined ||
          likeFilter !== 'all'
        );
      },
    }),
    {
      name: 'dali-outfit-filters',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        occasion: state.occasion,
        timeRange: state.timeRange,
        likeFilter: state.likeFilter,
      }),
    }
  )
);

// =============================================================================
// Selector Hooks
// =============================================================================

/** Get current occasion filter label */
export function useOccasionLabel(): string {
  const occasion = useFilterStore((state) => state.occasion);
  const option = OCCASION_OPTIONS.find((opt) => opt.value === occasion);
  return option ? `${option.emoji} ${option.label}`.trim() : '场合';
}

/** Get current time range filter label */
export function useTimeRangeLabel(): string {
  const timeRange = useFilterStore((state) => state.timeRange);
  const option = TIME_RANGE_OPTIONS.find((opt) => opt.value === timeRange);
  return option?.label || '时间';
}

/** Get like filter button label and color */
export function useLikeFilterDisplay(): {
  label: string;
  color: string;
  isActive: boolean;
} {
  const likeFilter = useFilterStore((state) => state.likeFilter);

  switch (likeFilter) {
    case 'favorited':
      return { label: '仅收藏', color: '#FF9500', isActive: true };
    case 'liked':
      return { label: '仅点赞', color: '#FF6B9D', isActive: true };
    default:
      return { label: '收藏/点赞', color: '#6C63FF', isActive: false };
  }
}
