/**
 * Outfit Result Screen - L5 Immersive Layout
 * Displays AI-generated outfit recommendation with hero image + overlapping content sheet
 * Updated to match outfit-result-gen-v2.html prototype
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/02-outfit-results/outfit-result-gen-v2.html
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import { colors } from '@/constants';
import type { OutfitRecommendation } from '@/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.52;

// Image tags floating on hero
function ImageTags({ tags }: { tags: string[] }) {
  return (
    <View style={styles.imageTags}>
      {tags.map((tag, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(300 + index * 100).duration(400)}
          style={styles.imgTag}
        >
          <Text style={styles.imgTagText}>{tag}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// Floating header with back and share buttons
function FloatingHeader({
  onBack,
  onShare,
}: {
  onBack: () => void;
  onShare: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.6)', 'transparent']}
      style={[styles.header, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={onShare} activeOpacity={0.7}>
          <Text style={styles.shareIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// Sheet handle indicator
function SheetHandle() {
  return <View style={styles.sheetHandle} />;
}

// Info header with title and match score
function InfoHeader({
  title,
  subtitle,
  matchScore,
}: {
  title: string;
  subtitle: string;
  matchScore: number;
}) {
  return (
    <View style={styles.infoHeader}>
      <View style={styles.infoLeft}>
        <Text style={styles.outfitTitle}>{title}</Text>
        <Text style={styles.outfitSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.matchScoreBadge}>
        <Text style={styles.matchScoreText}>{matchScore}%</Text>
      </View>
    </View>
  );
}

// Logic Echo Box - AI strategy explanation
function LogicEchoBox({ content }: { content?: string }) {
  // Parse content for highlighted keywords
  const renderContent = () => {
    if (!content) return <Text style={styles.logicContent}>AI 正在分析搭配逻辑...</Text>;
    // Simple regex to find text wrapped in ** for highlighting
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.hlText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.logicBox}>
      <View style={styles.logicTitleRow}>
        <Text style={styles.logicIcon}>ℹ️</Text>
        <Text style={styles.logicTitle}>AI 搭配策略</Text>
      </View>
      <Text style={styles.logicContent}>{renderContent()}</Text>
    </Animated.View>
  );
}

// Items row - horizontal scrolling item thumbnails
function ItemsRow({ items }: { items: string[] }) {
  return (
    <Animated.View entering={FadeInUp.delay(300).duration(500)}>
      <Text style={styles.sectionLabel}>包含单品</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsRow}
      >
        {items.map((emoji, index) => (
          <View key={index} style={styles.itemThumb}>
            <Text style={styles.itemEmoji}>{emoji}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

// Bottom action bar with retry and try-on buttons
function BottomActionBar({
  onRetry,
  onTryOn,
}: {
  onRetry: () => void;
  onTryOn: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, 20) + 10 }]}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.btnRetry]}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Text style={styles.retryIcon}>↻</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.btnTry]}
        onPress={onTryOn}
        activeOpacity={0.8}
      >
        <Text style={styles.tryIcon}>👁</Text>
        <Text style={styles.tryText}>一键上身</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OutfitResultScreen() {
  const params = useLocalSearchParams<{
    recommendations: string;
    occasion: string;
    photoUrl: string;
  }>();

  // Parse first recommendation from params
  const recommendation: OutfitRecommendation | null = React.useMemo(() => {
    try {
      const recs = params.recommendations ? JSON.parse(params.recommendations) : [];
      return recs[0] || null;
    } catch {
      return null;
    }
  }, [params.recommendations]);

  // Build display data from recommendation or fallback to mock
  const displayData = React.useMemo(() => {
    if (recommendation) {
      return {
        id: recommendation.id,
        outfitName: recommendation.name || '推荐搭配',
        theoryExplanation: recommendation.theory?.fullExplanation || recommendation.theory?.explanation || '',
        matchScore: Math.round((recommendation.confidence || 0.98) * 100),
        styleTags: recommendation.styleTags?.map(tag => `✨ ${tag}`) || ['✨ 简约'],
        items: recommendation.items?.map(item => item.name || '👕') || ['🧥', '👖', '👚'],
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      };
    }
    // Fallback mock data
    return {
      id: 'mock-1',
      outfitName: '职场优雅·风衣Look',
      theoryExplanation: '识别到**米色风衣**主体，匹配**职场简约**风格库。采用**高对比度·黑白经典**配色法则。内搭选用白色提亮肤色，下装搭配黑色阔腿裤视觉收缩，营造干练形象。',
      matchScore: 98,
      styleTags: ['✨ 韩系简约', '💼 职场通勤'],
      items: ['🧥', '👖', '👚', '👠', '👜'],
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    };
  }, [recommendation]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
  }, []);

  const handleRetry = useCallback(() => {
    // Navigate back to AI loading to regenerate
    router.back();
  }, []);

  const handleTryOn = useCallback(() => {
    // Navigate to virtual try-on page
    router.push({
      pathname: '/outfit/[id]',
      params: {
        id: displayData.id,
        recommendation: JSON.stringify(displayData),
      },
    });
  }, [displayData]);

  return (
    <View style={styles.container}>
      {/* Hero Section - 52% screen height */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: displayData.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <ImageTags tags={displayData.styleTags} />
      </View>

      {/* Floating Header */}
      <FloatingHeader onBack={handleBack} onShare={handleShare} />

      {/* Overlapping Content Sheet */}
      <ScrollView
        style={styles.contentSheet}
        contentContainerStyle={styles.contentSheetInner}
        showsVerticalScrollIndicator={false}
      >
        <SheetHandle />
        <InfoHeader
          title={displayData.outfitName}
          subtitle="由 AI 视觉引擎生成"
          matchScore={displayData.matchScore}
        />
        <LogicEchoBox content={displayData.theoryExplanation} />
        <ItemsRow items={displayData.items} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomActionBar onRetry={handleRetry} onTryOn={handleTryOn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Hero Section
  heroSection: {
    height: HERO_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E0E7FF',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Image Tags
  imageTags: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  imgTag: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imgTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Floating Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  shareIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Content Sheet (overlapping)
  contentSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    zIndex: 20,
  },
  contentSheetInner: {
    padding: 24,
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 20,
  },

  // Sheet Handle
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },

  // Info Header
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLeft: {
    flex: 1,
  },
  outfitTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  outfitSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  matchScoreBadge: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchScoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Logic Echo Box
  logicBox: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  logicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  logicIcon: {
    fontSize: 12,
  },
  logicTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  logicContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3A3A3C',
  },
  hlText: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Items Row
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  itemsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  itemThumb: {
    width: 72,
    height: 72,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  itemEmoji: {
    fontSize: 24,
  },

  // Bottom Action Bar
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 200,
  },
  actionBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  btnRetry: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  retryIcon: {
    fontSize: 20,
    color: '#1C1C1E',
  },
  btnTry: {
    flex: 2,
    backgroundColor: '#1C1C1E',
  },
  tryIcon: {
    fontSize: 16,
  },
  tryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
