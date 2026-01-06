/**
 * History Screen (搭配)
 * Shows outfit generation history in grid layout with filtering
 * Uses SQLite local storage via useOutfits hooks
 *
 * @see Story 5.2: Outfit History Grid View
 * @see Story 5.3: Filter by Occasion, Time, and Favorites
 * @see _bmad-output/planning-artifacts/ux-design/pages/04-wardrobe/outfit-page.html
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchIcon, FilterIcon, ChevronDownIcon } from '@/components/ui/icons';
import { OutfitHistoryGrid } from '@/components/outfit';
import { FilterBar } from '@/components/filter';
import { useOutfitCount } from '@/hooks';
import { useFilterStore } from '@/stores';
import { colors } from '@/constants';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  // Filter state from store
  const getQueryFilters = useFilterStore((state) => state.getQueryFilters);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const clearFilters = useFilterStore((state) => state.clearFilters);

  // Get current filters for queries
  const filters = useMemo(() => getQueryFilters(), [getQueryFilters]);

  // Get outfit count with current filters
  const { data: outfitCount = 0 } = useOutfitCount(filters);

  // Check if any filters are active
  const filtersActive = hasActiveFilters();

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Header component to be rendered inside FlatList
  const ListHeader = useCallback(
    () => (
      <View style={styles.contentHeader}>
        <Text style={styles.countText}>
          {filtersActive
            ? `筛选结果: ${outfitCount} 套搭配`
            : `共 ${outfitCount} 套搭配方案`}
        </Text>
        <TouchableOpacity style={styles.sortButton} activeOpacity={0.7}>
          <Text style={styles.sortButtonText}>最新</Text>
          <ChevronDownIcon size={14} color="#3A3A3C" />
        </TouchableOpacity>
      </View>
    ),
    [outfitCount, filtersActive]
  );

  // Empty state component when filters yield no results
  const EmptyFilterResult = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>😔</Text>
        <Text style={styles.emptyTitle}>没有找到符合条件的搭配</Text>
        <Text style={styles.emptySubtitle}>
          可能您还没有保存过这类场合的搭配{'\n'}试试调整筛选条件或去首页生成新搭配吧
        </Text>
        <View style={styles.emptyButtonRow}>
          <TouchableOpacity
            style={[styles.clearFiltersButton, styles.secondaryButton]}
            onPress={handleClearFilters}
            activeOpacity={0.7}
          >
            <Text style={[styles.clearFiltersText, styles.secondaryButtonText]}>
              清除筛选
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              // Navigate to home tab
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (global as any).router?.push('/');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFiltersText}>去生成</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleClearFilters]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Purple Header with Search */}
      <LinearGradient
        colors={[colors.primary, '#8578FF']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>搭配</Text>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filtersActive && styles.filterButtonActive,
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="筛选"
            onPress={handleClearFilters}
            disabled={!filtersActive}
          >
            <FilterIcon size={20} color="#FFFFFF" />
            {filtersActive && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <SearchIcon size={18} color="rgba(255, 255, 255, 0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索搭配方案..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            accessibilityLabel="搜索搭配"
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
      </LinearGradient>

      {/* Content Sheet with rounded top */}
      <View style={styles.contentSheet}>
        {/* Filter Bar */}
        <FilterBar />

        {/* Outfit History Grid with infinite scroll */}
        <OutfitHistoryGrid
          filters={filters}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={filtersActive ? EmptyFilterResult : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B9D',
  },
  searchBox: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  contentSheet: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 0,
    overflow: 'hidden',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  countText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3A3A3C',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  clearFiltersButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
  },
  secondaryButtonText: {
    color: '#6C63FF',
  },
});
