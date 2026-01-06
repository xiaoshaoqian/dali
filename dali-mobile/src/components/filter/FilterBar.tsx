/**
 * FilterBar Component
 * Horizontal filter bar with occasion, time, and like/favorite buttons
 *
 * @see Story 5.3: Filter by Occasion, Time, and Favorites
 * @see AC #1: 3 filter buttons displayed horizontally
 * @see AC #6: Like/favorite toggle with color indicators
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  useFilterStore,
  useOccasionLabel,
  useTimeRangeLabel,
  useLikeFilterDisplay,
} from '@/stores';
import { ChevronDownIcon } from '@/components/ui/icons';
import { FilterBottomSheet, type FilterType } from './FilterBottomSheet';

// =============================================================================
// Types
// =============================================================================

interface FilterBarProps {
  /** Called when filters change (optional, for parent awareness) */
  onFiltersChange?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<FilterType>('occasion');

  // Store state and actions
  const occasion = useFilterStore((state) => state.occasion);
  const timeRange = useFilterStore((state) => state.timeRange);
  const setOccasion = useFilterStore((state) => state.setOccasion);
  const setTimeRange = useFilterStore((state) => state.setTimeRange);
  const cycleLikeFilter = useFilterStore((state) => state.cycleLikeFilter);

  // Computed labels
  const occasionLabel = useOccasionLabel();
  const timeRangeLabel = useTimeRangeLabel();
  const { label: likeLabel, color: likeColor, isActive: isLikeActive } = useLikeFilterDisplay();

  // Check if occasion or time filters are active
  const isOccasionActive = occasion !== undefined;
  const isTimeRangeActive = timeRange !== undefined;

  // Handlers
  const handleOccasionPress = useCallback(() => {
    setBottomSheetType('occasion');
    setBottomSheetVisible(true);
  }, []);

  const handleTimeRangePress = useCallback(() => {
    setBottomSheetType('timeRange');
    setBottomSheetVisible(true);
  }, []);

  const handleLikePress = useCallback(() => {
    cycleLikeFilter();
    onFiltersChange?.();
  }, [cycleLikeFilter, onFiltersChange]);

  const handleBottomSheetClose = useCallback(() => {
    setBottomSheetVisible(false);
  }, []);

  const handleOccasionSelect = useCallback(
    (value: string | undefined) => {
      setOccasion(value);
      onFiltersChange?.();
    },
    [setOccasion, onFiltersChange]
  );

  const handleTimeRangeSelect = useCallback(
    (value: typeof timeRange) => {
      setTimeRange(value);
      onFiltersChange?.();
    },
    [setTimeRange, onFiltersChange]
  );

  return (
    <View style={styles.container}>
      {/* Occasion Filter Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          isOccasionActive && styles.filterButtonActive,
        ]}
        onPress={handleOccasionPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`场合筛选: ${occasionLabel}`}
        accessibilityHint="点击选择场合"
      >
        <Text
          style={[
            styles.filterButtonText,
            isOccasionActive && styles.filterButtonTextActive,
          ]}
          numberOfLines={1}
        >
          {occasionLabel}
        </Text>
        <ChevronDownIcon
          size={14}
          color={isOccasionActive ? '#FFFFFF' : '#3A3A3C'}
        />
      </TouchableOpacity>

      {/* Time Range Filter Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          isTimeRangeActive && styles.filterButtonActive,
        ]}
        onPress={handleTimeRangePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`时间筛选: ${timeRangeLabel}`}
        accessibilityHint="点击选择时间范围"
      >
        <Text
          style={[
            styles.filterButtonText,
            isTimeRangeActive && styles.filterButtonTextActive,
          ]}
          numberOfLines={1}
        >
          {timeRangeLabel}
        </Text>
        <ChevronDownIcon
          size={14}
          color={isTimeRangeActive ? '#FFFFFF' : '#3A3A3C'}
        />
      </TouchableOpacity>

      {/* Like/Favorite Toggle Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          isLikeActive && { backgroundColor: likeColor },
        ]}
        onPress={handleLikePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`收藏筛选: ${likeLabel}`}
        accessibilityHint="点击切换收藏/点赞筛选"
      >
        <Text
          style={[
            styles.filterButtonText,
            isLikeActive && styles.filterButtonTextActive,
          ]}
          numberOfLines={1}
        >
          {likeLabel}
        </Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <FilterBottomSheet
        visible={bottomSheetVisible}
        filterType={bottomSheetType}
        selectedOccasion={occasion}
        selectedTimeRange={timeRange}
        onSelectOccasion={handleOccasionSelect}
        onSelectTimeRange={handleTimeRangeSelect}
        onClose={handleBottomSheetClose}
      />
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3A3A3C',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default FilterBar;
