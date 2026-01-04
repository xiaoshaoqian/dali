/**
 * Home Screen (首页 - 空状态)
 * Main entry point for outfit generation
 * Ref: ux-design/pages/01-home/home-page-empty.html
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraIcon, AlbumIcon, OutfitIcon } from '@/components/ui/icons';
import { colors } from '@/constants';

// Inspiration card data
const inspirationCards = [
  { id: 1, name: '温柔通勤', tags: ['职场', '简约'], style: 'style1', colors: ['#FF6B9D', '#1C1C1E', '#A67C52'] },
  { id: 2, name: '休闲周末', tags: ['休闲', '时尚'], style: 'style2', colors: ['#6C63FF', '#FFFFFF', '#3A3A3C'] },
  { id: 3, name: '秋日暖阳', tags: ['约会', '甜美'], style: 'style3', colors: ['#FF9500', '#F5DEB3', '#8B4513'] },
  { id: 4, name: '优雅知性', tags: ['知性', '气质'], style: 'style4', colors: ['#8B7FFF', '#E8E6FF', '#C0C0C0'] },
];

const styleBackgrounds: Record<string, [string, string]> = {
  style1: ['#FFE5E5', '#FFD6D6'],
  style2: ['#E5F0FF', '#D6E7FF'],
  style3: ['#FFF5E5', '#FFE5CC'],
  style4: ['#F0EFFF', '#E8E6FF'],
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Gradient Header */}
        <LinearGradient
          colors={[colors.primary, '#8578FF']}
          style={[styles.headerGradient, { paddingTop: insets.top + 32 }]}
        >
          <Text style={styles.greeting}>早上好，小邵</Text>
          <Text style={styles.subtitle}>
            今天想搭配什么风格？拍张照片，让 AI 来帮你吧
          </Text>
        </LinearGradient>

        {/* White Content Card - overlaps header */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>开始搭配</Text>

          {/* Action Buttons - Side by Side */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
              <View style={styles.btnIcon}>
                <CameraIcon size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.cameraButtonText}>拍照</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.albumButton} activeOpacity={0.8}>
              <View style={styles.btnIcon}>
                <AlbumIcon size={36} color="#1C1C1E" />
              </View>
              <Text style={styles.albumButtonText}>从相册选择</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Outfits Section */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>最近搭配</Text>
            </View>

            {/* Empty State */}
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <OutfitIcon size={28} color={colors.primary} />
              </View>
              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>还没有搭配记录</Text>
                <Text style={styles.emptyDesc}>
                  拍张照片或从相册选择，{'\n'}让 AI 为你创建第一套搭配吧
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Inspiration Section */}
          <View style={styles.inspirationSection}>
            <View style={styles.inspirationHeader}>
              <Text style={styles.inspirationTitle}>
                今日灵感
              </Text>
              <View style={styles.inspirationBadge}>
                <Text style={styles.inspirationBadgeText}>AI 推荐</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.inspirationCards}
            >
              {inspirationCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.inspirationCard}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={styleBackgrounds[card.style]}
                    style={styles.inspirationPreview}
                  >
                    <View style={styles.inspirationItems}>
                      {card.colors.map((color, idx) => (
                        <View
                          key={idx}
                          style={[styles.inspirationItem, { backgroundColor: color }]}
                        />
                      ))}
                    </View>
                  </LinearGradient>
                  <View style={styles.inspirationInfo}>
                    <Text style={styles.inspirationName}>{card.name}</Text>
                    <View style={styles.inspirationTags}>
                      {card.tags.map((tag, idx) => (
                        <View key={idx} style={styles.inspirationTag}>
                          <Text style={styles.inspirationTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -100,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cameraButton: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  albumButton: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  btnIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  albumButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  recentSection: {
    marginTop: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptyState: {
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emptyContent: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  inspirationSection: {
    marginTop: 20,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  inspirationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  inspirationBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inspirationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inspirationCards: {
    gap: 12,
    paddingRight: 20,
  },
  inspirationCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  inspirationPreview: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspirationItems: {
    flexDirection: 'row',
    gap: 4,
  },
  inspirationItem: {
    width: 32,
    height: 42,
    borderRadius: 6,
    opacity: 0.6,
  },
  inspirationInfo: {
    padding: 10,
  },
  inspirationName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  inspirationTags: {
    flexDirection: 'row',
    gap: 4,
  },
  inspirationTag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inspirationTagText: {
    fontSize: 11,
    color: colors.primary,
  },
});
