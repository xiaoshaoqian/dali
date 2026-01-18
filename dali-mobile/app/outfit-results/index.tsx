/**
 * Outfit Result Screen V2 - Immersive Layout with Generated Image
 * Displays AI-generated outfit recommendation with generated visualization
 * Updated to support SSE streaming results with generated images
 *
 * @see Story 9-8: Outfit Results with Generated Image
 */
import React, { useCallback, useMemo } from 'react';
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

// Style tags floating on hero
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

// Generated image badge
function GeneratedBadge() {
  return (
    <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.generatedBadge}>
      <Text style={styles.generatedBadgeText}>AI 生成</Text>
    </Animated.View>
  );
}

// Info header with title and occasion
function InfoHeader({
  title,
  occasion,
}: {
  title: string;
  occasion: string;
}) {
  return (
    <View style={styles.infoHeader}>
      <View style={styles.infoLeft}>
        <Text style={styles.outfitTitle}>{title}</Text>
        <Text style={styles.outfitSubtitle}>由 AI 视觉引擎生成</Text>
      </View>
      <View style={styles.occasionBadge}>
        <Text style={styles.occasionBadgeText}>{occasion}</Text>
      </View>
    </View>
  );
}

// AI Theory Box - shows streamed theory content
function TheoryBox({ content }: { content: string }) {
  // Parse content for highlighted keywords (**text**)
  const renderContent = () => {
    if (!content) return <Text style={styles.theoryContent}>AI 正在分析搭配逻辑...</Text>;

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
    <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.theoryBox}>
      <View style={styles.theoryTitleRow}>
        <Text style={styles.theoryIcon}>💡</Text>
        <Text style={styles.theoryTitle}>AI 搭配策略</Text>
      </View>
      <Text style={styles.theoryContent}>{renderContent()}</Text>
    </Animated.View>
  );
}

// Bottom action bar with regenerate and save buttons
function BottomActionBar({
  onRegenerate,
  onSave,
}: {
  onRegenerate: () => void;
  onSave: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, 20) + 10 }]}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.btnRegenerate]}
        onPress={onRegenerate}
        activeOpacity={0.8}
      >
        <Text style={styles.regenerateIcon}>↻</Text>
        <Text style={styles.regenerateText}>重新生成</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.btnSave]}
        onPress={onSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveIcon}>♡</Text>
        <Text style={styles.saveText}>收藏搭配</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OutfitResultScreen() {
  const params = useLocalSearchParams<{
    // New SSE-based params
    outfitId?: string;
    theoryText?: string;
    generatedImageUrl?: string;
    occasion?: string;
    photoUrl?: string;
    // Legacy params for backwards compatibility
    recommendations?: string;
  }>();

  const insets = useSafeAreaInsets();

  // Build display data from params
  const displayData = useMemo(() => {
    // Decode URL params
    const theoryText = params.theoryText ? decodeURIComponent(params.theoryText) : '';
    const generatedImageUrl = params.generatedImageUrl ? decodeURIComponent(params.generatedImageUrl) : '';
    const photoUrl = params.photoUrl ? decodeURIComponent(params.photoUrl) : '';
    const occasion = params.occasion || '日常';

    // If we have legacy recommendations param, parse it
    if (params.recommendations) {
      try {
        const recs = JSON.parse(params.recommendations);
        const rec = recs[0];
        if (rec) {
          return {
            outfitId: rec.id || params.outfitId || 'generated-1',
            outfitName: rec.name || '推荐搭配',
            theoryText: rec.theory?.fullExplanation || theoryText,
            generatedImageUrl: generatedImageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
            occasion,
            styleTags: rec.styleTags?.map((tag: string) => `✨ ${tag}`) || ['✨ 简约'],
            hasGeneratedImage: !!generatedImageUrl,
          };
        }
      } catch (e) {
        // Fall through to new params
      }
    }

    // New SSE-based data
    return {
      outfitId: params.outfitId || 'generated-1',
      outfitName: 'AI 搭配方案',
      theoryText: theoryText,
      generatedImageUrl: generatedImageUrl || photoUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      occasion,
      styleTags: ['✨ AI 生成', `💼 ${occasion}`],
      hasGeneratedImage: !!generatedImageUrl,
    };
  }, [params]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
  }, []);

  const handleRegenerate = useCallback(() => {
    // Navigate back to AI loading to regenerate
    router.replace({
      pathname: '/ai-loading',
      params: {
        photoUrl: params.photoUrl,
        occasion: params.occasion,
        useStreaming: 'true',
      },
    });
  }, [params]);

  const handleSave = useCallback(() => {
    // TODO: Implement save to wardrobe
    console.log('[OutfitResults] Save outfit:', displayData.outfitId);
  }, [displayData.outfitId]);

  return (
    <View style={styles.container}>
      {/* Hero Section - Generated or original image */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: displayData.generatedImageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <ImageTags tags={displayData.styleTags} />

        {/* Show "AI Generated" badge if we have a generated image */}
        {displayData.hasGeneratedImage && <GeneratedBadge />}
      </View>

      {/* Floating Header */}
      <FloatingHeader onBack={handleBack} onShare={handleShare} />

      {/* Overlapping Content Sheet */}
      <ScrollView
        style={styles.contentSheet}
        contentContainerStyle={styles.contentSheetInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHandle} />

        <InfoHeader
          title={displayData.outfitName}
          occasion={displayData.occasion}
        />

        <TheoryBox content={displayData.theoryText} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomActionBar onRegenerate={handleRegenerate} onSave={handleSave} />
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

  // Generated badge
  generatedBadge: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(108,99,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  generatedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  occasionBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  occasionBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Theory Box
  theoryBox: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  theoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  theoryIcon: {
    fontSize: 14,
  },
  theoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  theoryContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#3A3A3C',
  },
  hlText: {
    color: colors.primary,
    fontWeight: '600',
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
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  btnRegenerate: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  regenerateIcon: {
    fontSize: 18,
    color: '#3A3A3C',
  },
  regenerateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  btnSave: {
    backgroundColor: colors.primary,
  },
  saveIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
