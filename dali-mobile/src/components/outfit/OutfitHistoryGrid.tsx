/**
 * OutfitHistoryGrid Component
 * 2-column grid view for displaying outfit history with infinite scroll
 *
 * @see Story 5.2: Outfit History Grid View
 * @see _bmad-output/planning-artifacts/ux-design/pages/04-wardrobe/outfit-page.html
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { router } from 'expo-router';

import { useOutfitsInfinite, flattenOutfitPages, useInvalidateOutfits } from '@/hooks';
import type { LocalOutfitRecord, OutfitFilters } from '@/utils/storage';
import { deleteOutfit } from '@/utils/storage';
import { OutfitHistoryCard } from './OutfitHistoryCard';
import { OutfitEmptyState } from './OutfitEmptyState';

// =============================================================================
// Types
// =============================================================================

export interface OutfitHistoryGridProps {
  /** Optional filters for the outfit query */
  filters?: Omit<OutfitFilters, 'limit' | 'offset'>;
  /** Optional header component */
  ListHeaderComponent?: React.ComponentType<object> | React.ReactElement | null;
  /** Optional custom empty state component (overrides default) */
  ListEmptyComponent?: React.ComponentType<object> | React.ReactElement | null;
}

// =============================================================================
// Constants
// =============================================================================

/** Horizontal padding (left + right) */
const HORIZONTAL_PADDING = 40; // 20px each side

/** Gap between columns */
const COLUMN_GAP = 12;

/** Number of columns */
const NUM_COLUMNS = 2;

/** Primary color for refresh indicator */
const PRIMARY_COLOR = '#6C63FF';

// =============================================================================
// Component
// =============================================================================

export function OutfitHistoryGrid({
  filters,
  ListHeaderComponent,
  ListEmptyComponent: CustomEmptyComponent,
}: OutfitHistoryGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { invalidateLists, invalidateCounts } = useInvalidateOutfits();

  // Calculate card width: (screenWidth - 48px) / 2
  const cardWidth = useMemo(() => {
    return (screenWidth - HORIZONTAL_PADDING - COLUMN_GAP) / NUM_COLUMNS;
  }, [screenWidth]);

  // Fetch outfits with infinite scroll
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useOutfitsInfinite(filters);

  // Use isFetching as isRefreshing indicator (when not initial load)
  const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;

  // Flatten pages into single array
  const outfits = useMemo(() => flattenOutfitPages(data?.pages), [data?.pages]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Navigate to outfit detail
  const handleOutfitPress = useCallback((outfit: LocalOutfitRecord) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/outfit/${outfit.id}` as any);
  }, []);

  // Handle long press for action menu (AC #10)
  const handleLongPress = useCallback(
    (outfit: LocalOutfitRecord) => {
      Alert.alert(
        outfit.name,
        undefined,
        [
          {
            text: '删除',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteOutfit(outfit.id);
                // Invalidate queries to refresh the list
                invalidateLists();
                invalidateCounts();
              } catch (err) {
                console.error('Failed to delete outfit:', err);
                Alert.alert('删除失败', '无法删除该搭配，请稍后重试');
              }
            },
          },
          {
            text: '分享',
            onPress: () => {
              // TODO: Epic 6 - Share functionality
              Alert.alert('提示', '分享功能即将推出');
            },
          },
          {
            text: '取消',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    },
    [invalidateLists, invalidateCounts]
  );

  // Render individual outfit card
  const renderItem = useCallback(
    ({ item, index }: { item: LocalOutfitRecord; index: number }) => (
      <Animated.View style={styles.cardContainer} exiting={FadeOut.duration(200)}>
        <OutfitHistoryCard
          outfit={item}
          width={cardWidth}
          styleIndex={index % 4}
          onPress={() => handleOutfitPress(item)}
          onLongPress={() => handleLongPress(item)}
        />
      </Animated.View>
    ),
    [cardWidth, handleOutfitPress, handleLongPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: LocalOutfitRecord) => item.id, []);

  // Render footer (loading indicator)
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={PRIMARY_COLOR} />
        <Text style={styles.footerText}>加载更多...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>加载失败</Text>
          <Text style={styles.errorMessage}>
            {error?.message || '无法加载搭配记录，请稍后重试'}
          </Text>
          <Text
            style={styles.retryButton}
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="重试加载"
          >
            点击重试
          </Text>
        </View>
      );
    }

    // Use custom empty component if provided
    if (CustomEmptyComponent) {
      if (React.isValidElement(CustomEmptyComponent)) {
        return CustomEmptyComponent;
      }
      const EmptyComp = CustomEmptyComponent as React.ComponentType<object>;
      return <EmptyComp />;
    }

    return <OutfitEmptyState />;
  }, [isLoading, isError, error, refetch, CustomEmptyComponent]);

  return (
    <FlatList
      data={outfits}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={PRIMARY_COLOR}
          colors={[PRIMARY_COLOR]}
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      accessibilityLabel="搭配历史列表"
    />
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for tab bar
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: COLUMN_GAP,
  },

  cardContainer: {
    // Individual card wrapper
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  footerText: {
    fontSize: 13,
    color: '#8E8E93',
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },

  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },

  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
