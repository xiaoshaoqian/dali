/**
 * History Screen (搭配)
 * Shows outfit generation history in grid layout
 * Ref: ux-design/pages/04-wardrobe/outfit-page.html
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchIcon, FilterIcon, BookmarkIcon, ChevronDownIcon } from '@/components/ui/icons';
import { colors } from '@/constants';

// Mock outfit data
const outfits = [
  { id: 1, title: '职场优雅风', date: '今天', tags: ['简约', '通勤'], saved: true, style: 'style1' },
  { id: 2, title: '休闲时尚风', date: '今天', tags: ['时尚', '休闲'], saved: false, style: 'style2' },
  { id: 3, title: '气质约会风', date: '昨天', tags: ['甜美', '约会'], saved: true, style: 'style3' },
  { id: 4, title: '轻奢商务风', date: '昨天', tags: ['知性', '通勤'], saved: false, style: 'style4' },
  { id: 5, title: '文艺清新风', date: '3天前', tags: ['简约', '休闲'], saved: false, style: 'style1' },
  { id: 6, title: '运动活力风', date: '3天前', tags: ['运动', '健身'], saved: true, style: 'style2' },
];

const styleBackgrounds: Record<string, [string, string]> = {
  style1: ['#FFE5E5', '#FFD6D6'],
  style2: ['#E5F0FF', '#D6E7FF'],
  style3: ['#FFF5E5', '#FFE5CC'],
  style4: ['#F0EFFF', '#E8E6FF'],
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

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
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <FilterIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <SearchIcon size={18} color="rgba(255, 255, 255, 0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索搭配方案..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
      </LinearGradient>

      {/* Content Sheet with rounded top */}
      <View style={styles.contentSheet}>
        {/* Content Header */}
        <View style={styles.contentHeader}>
          <Text style={styles.countText}>共 {outfits.length} 套搭配方案</Text>
          <TouchableOpacity style={styles.sortButton} activeOpacity={0.7}>
            <Text style={styles.sortButtonText}>最新</Text>
            <ChevronDownIcon size={14} color="#3A3A3C" />
          </TouchableOpacity>
        </View>

        {/* Outfits Grid */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.outfitsGrid}>
            {outfits.map((outfit) => (
              <TouchableOpacity
                key={outfit.id}
                style={styles.outfitCard}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={styleBackgrounds[outfit.style]}
                  style={styles.outfitThumbnail}
                >
                  <Text style={styles.thumbnailText}>{outfit.title}</Text>
                  {outfit.saved && (
                    <View style={styles.savedBadge}>
                      <BookmarkIcon size={14} color="#FF6B9D" filled />
                    </View>
                  )}
                </LinearGradient>
                <View style={styles.outfitInfo}>
                  <View style={styles.outfitInfoTop}>
                    <Text style={styles.outfitTitle}>{outfit.title}</Text>
                    <Text style={styles.outfitDate}>{outfit.date}</Text>
                  </View>
                  <View style={styles.outfitMiniTags}>
                    {outfit.tags.map((tag, idx) => (
                      <View key={idx} style={styles.miniTag}>
                        <Text style={styles.miniTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  outfitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  outfitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  outfitThumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnailText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitInfo: {
    padding: 12,
  },
  outfitInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  outfitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  outfitDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  outfitMiniTags: {
    flexDirection: 'row',
    gap: 4,
  },
  miniTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  miniTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3A3A3C',
  },
});
