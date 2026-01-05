/**
 * Outfit Detail Screen
 * Displays detailed outfit information with theory visualization
 * Enhanced with like/save functionality (Story 3.5)
 *
 * Part of Story 3.4 & 3.5: Outfit Results Display + Feedback
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/03-outfit-detail/outfit-detail-page.html
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';
import { StyleTagChip } from '@/components/outfit/StyleTagChip';
import { LikeButton } from '@/components/outfit/LikeButton';
import { SaveButton } from '@/components/outfit/SaveButton';
import { TheoryVisualization } from '@/components/theory/TheoryVisualization';
import { Toast } from '@/components/ui/Toast';
import { useLikeOutfit } from '@/hooks/useLikeOutfit';
import { useSaveOutfit } from '@/hooks/useSaveOutfit';
import type { OutfitRecommendation } from '@/services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Floating navigation button
function NavButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}

// Card section wrapper
function FloatingCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400)}
      style={styles.floatingCard}
    >
      {children}
    </Animated.View>
  );
}

// Item card in horizontal scroll
function ItemCard({
  item,
  index,
}: {
  item: { name: string; color: string; colorHex: string };
  index: number;
}) {
  const bgColors = ['#FFE5E5', '#E5F0FF', '#FFF5E5', '#F2F2F7'];
  const emojis = ['👚', '👖', '👜', '👠'];

  return (
    <View style={styles.itemCard}>
      <View style={[styles.itemImg, { backgroundColor: bgColors[index % 4] }]}>
        <Text style={styles.itemEmoji}>{emojis[index % 4]}</Text>
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      <TouchableOpacity style={styles.shopBtn} activeOpacity={0.7}>
        <Text style={styles.shopIcon}>🔍</Text>
        <Text style={styles.shopText}>找相似</Text>
      </TouchableOpacity>
    </View>
  );
}

// Reason item in list
function ReasonItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.reasonItem}>
      <View style={styles.checkIcon}>
        <Text style={styles.checkText}>✓</Text>
      </View>
      <View style={styles.reasonContent}>
        <Text style={styles.reasonTitle}>{title}</Text>
        <Text style={styles.reasonDesc}>{description}</Text>
      </View>
    </View>
  );
}

export default function OutfitDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    recommendation: string;
    initialIsLiked?: string;
    initialIsSaved?: string;
  }>();

  const insets = useSafeAreaInsets();
  const [isLiked, setIsLiked] = useState(params.initialIsLiked === 'true');
  const [isSaved, setIsSaved] = useState(params.initialIsSaved === 'true');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Parse recommendation from params
  const recommendation: OutfitRecommendation | null = React.useMemo(() => {
    try {
      return params.recommendation ? JSON.parse(params.recommendation) : null;
    } catch {
      return null;
    }
  }, [params.recommendation]);

  // Like/Save hooks - only initialize if we have a recommendation
  const outfitId = recommendation?.id || params.id || '';
  const likeHook = useLikeOutfit(outfitId, isLiked);
  const saveHook = useSaveOutfit(outfitId, isSaved);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleMore = useCallback(() => {
    // TODO: Show more options menu
  }, []);

  const handleLike = useCallback(() => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    likeHook.toggleLike(isLiked);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isLiked, likeHook]);

  const handleSave = useCallback(() => {
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    saveHook.toggleSave(isSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (newIsSaved) {
      showToast('已收藏');
    }
  }, [isSaved, saveHook, showToast]);

  const handleTryOn = useCallback(() => {
    // TODO: Navigate to try-on screen
  }, []);

  if (!recommendation) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>无法加载搭配详情</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Navigation */}
      <Animated.View
        entering={FadeIn.delay(200)}
        style={[styles.topNav, { paddingTop: insets.top + 12 }]}
      >
        <NavButton onPress={handleBack}>
          <Text style={styles.navIcon}>‹</Text>
        </NavButton>
        <NavButton onPress={handleMore}>
          <Text style={styles.moreIcon}>⋮</Text>
        </NavButton>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#E0E7FF', '#F5F3FF']}
            style={styles.heroPlaceholder}
          >
            <Text style={styles.heroEmoji}>👩🏻‍💼</Text>
            <Text style={styles.heroLabel}>AI 生成效果示意图</Text>
          </LinearGradient>
          {/* Inverse radius cap */}
          <View style={styles.heroCap} />
        </View>

        {/* Content Cards */}
        <View style={styles.contentSheet}>
          {/* Title & Tags Card */}
          <FloatingCard delay={100}>
            <Text style={styles.outfitTitle}>{recommendation.name}</Text>
            <View style={styles.tagRow}>
              {recommendation.styleTags.map((tag, i) => (
                <StyleTagChip
                  key={i}
                  label={tag}
                  variant={i === 0 ? 'style' : 'occasion'}
                />
              ))}
              <StyleTagChip label="AI 推荐" variant="occasion" />
            </View>
          </FloatingCard>

          {/* Color Theory Card */}
          <FloatingCard delay={200}>
            <View style={styles.cardTitle}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>◉</Text>
              </View>
              <Text style={styles.cardTitleText}>配色逻辑</Text>
            </View>
            <TheoryVisualization
              colorPrinciple={recommendation.theory.colorPrinciple}
              colors={recommendation.items.map(item => item.colorHex)}
            />
          </FloatingCard>

          {/* Full Theory Explanation Card */}
          {recommendation.theory.fullExplanation && (
            <FloatingCard delay={250}>
              <View style={styles.cardTitle}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>💡</Text>
                </View>
                <Text style={styles.cardTitleText}>搭配解析</Text>
              </View>
              <Text style={styles.explanationText}>
                {recommendation.theory.fullExplanation}
              </Text>
            </FloatingCard>
          )}

          {/* AI Reasons Card */}
          <FloatingCard delay={300}>
            <View style={styles.cardTitle}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>✓</Text>
              </View>
              <Text style={styles.cardTitleText}>AI 推荐理由</Text>
            </View>
            <View style={styles.reasonList}>
              <ReasonItem
                title="修饰身形"
                description={recommendation.theory.bodyTypeAdvice}
              />
              <ReasonItem
                title="场合适配"
                description={recommendation.theory.occasionFit}
              />
            </View>
          </FloatingCard>

          {/* Items Card */}
          <FloatingCard delay={400}>
            <Text style={styles.sectionHeader}>包含单品</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.itemsScroll}
            >
              {recommendation.items.map((item, index) => (
                <ItemCard key={index} item={item} index={index} />
              ))}
            </ScrollView>
          </FloatingCard>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={[styles.bottomActionBar, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.actionButtonsRow}>
          <View style={styles.iconButtonContainer}>
            <LikeButton
              isLiked={isLiked}
              onPress={handleLike}
              showLabel={false}
              size="medium"
            />
          </View>
          <View style={styles.iconButtonContainer}>
            <SaveButton
              isSaved={isSaved}
              onPress={handleSave}
              showLabel={false}
              size="medium"
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.tryOnBtn}
          onPress={handleTryOn}
          activeOpacity={0.8}
        >
          <Text style={styles.tryOnIcon}>👗</Text>
          <Text style={styles.tryOnText}>上身试穿</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        type="success"
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Top Navigation
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  moreIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Hero Section
  heroSection: {
    width: '100%',
    height: 500,
    position: 'relative',
    backgroundColor: '#E0E7FF',
    overflow: 'hidden',
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.6,
  },
  heroCap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: colors.gray4,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // Content Sheet
  contentSheet: {
    marginHorizontal: 20,
    gap: 16,
  },
  floatingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },

  // Title Card
  outfitTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  // Card Title
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 14,
    color: colors.primary,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },

  // Theory Explanation
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#3A3A3C',
    fontFamily: 'System',
  },

  // Reason List
  reasonList: {
    gap: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    gap: 12,
  },
  checkIcon: {
    marginTop: 2,
  },
  checkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  reasonDesc: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },

  // Items Section
  sectionHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  itemsScroll: {
    gap: 12,
  },
  itemCard: {
    width: 100,
    alignItems: 'center',
  },
  itemImg: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3A3A3C',
    textAlign: 'center',
    marginTop: 8,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    marginTop: 8,
  },
  shopIcon: {
    fontSize: 10,
  },
  shopText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },

  // Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 100,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButtonContainer: {
    width: 56,
    height: 56,
  },
  tryOnBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  tryOnIcon: {
    fontSize: 20,
  },
  tryOnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
