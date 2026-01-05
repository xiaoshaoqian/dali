/**
 * OutfitCard Component
 * Displays a single outfit recommendation card with main visual, items, and action buttons
 * Enhanced with double-tap like and long-press save gestures
 * Integrates useLikeOutfit and useSaveOutfit hooks for optimistic updates
 *
 * Part of Story 3.4 & 3.5: Outfit Results Display + Feedback
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/02-outfit-results/outfit-results-page.html
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';
import type { OutfitRecommendation } from '@/services';
import { useLikeOutfit, useSaveOutfit } from '@/hooks';
import { StyleTagChip } from './StyleTagChip';
import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';

interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  index: number;
  /** Initial like state */
  initialIsLiked?: boolean;
  /** Initial save state */
  initialIsSaved?: boolean;
  onPress?: () => void;
  onLike?: (isLiked: boolean) => void;
  onSave?: (isSaved: boolean) => void;
  /** Callback when Toast should be shown */
  onShowToast?: (message: string) => void;
}

export function OutfitCard({
  recommendation,
  index,
  initialIsLiked = false,
  initialIsSaved = false,
  onPress,
  onLike,
  onSave,
  onShowToast,
}: OutfitCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [showFloatingHeart, setShowFloatingHeart] = useState(false);

  // Integrate hooks for optimistic updates and API calls
  const likeHook = useLikeOutfit(recommendation.id, isLiked, {
    onSuccess: (newIsLiked) => {
      onLike?.(newIsLiked);
    },
  });

  const saveHook = useSaveOutfit(recommendation.id, isSaved, {
    onSuccess: (newIsFavorited) => {
      onSave?.(newIsFavorited);
    },
  });

  const scale = useSharedValue(1);
  const floatingHeartScale = useSharedValue(0);
  const floatingHeartOpacity = useSharedValue(0);

  // Press animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Floating heart animation style
  const floatingHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: floatingHeartScale.value }],
    opacity: floatingHeartOpacity.value,
  }));

  const handleLike = useCallback(() => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    likeHook.toggleLike(isLiked);
    onLike?.(newIsLiked);
  }, [isLiked, likeHook, onLike]);

  const handleSave = useCallback(() => {
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    saveHook.toggleSave(isSaved);
    onSave?.(newIsSaved);

    if (newIsSaved) {
      onShowToast?.('已收藏');
    }
  }, [isSaved, saveHook, onSave, onShowToast]);

  // Double-tap like handler
  const handleDoubleTapLike = useCallback(() => {
    if (!isLiked) {
      // Trigger haptic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Show floating heart animation
      setShowFloatingHeart(true);
      floatingHeartScale.value = withSequence(
        withSpring(1.5, { damping: 8, stiffness: 400 }),
        withTiming(0, { duration: 300 })
      );
      floatingHeartOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 }, () => {
          runOnJS(setShowFloatingHeart)(false);
        })
      );

      // Update like state and call hook
      setIsLiked(true);
      likeHook.like();
      onLike?.(true);
    }
  }, [isLiked, onLike, floatingHeartScale, floatingHeartOpacity, likeHook]);

  // Long-press save handler
  const handleLongPressSave = useCallback(() => {
    if (!isSaved) {
      // Trigger haptic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Update save state and call hook
      setIsSaved(true);
      saveHook.save();
      onSave?.(true);
      onShowToast?.('已收藏');
    }
  }, [isSaved, onSave, onShowToast, saveHook]);

  // Create gestures
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(handleDoubleTapLike)();
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      runOnJS(handleLongPressSave)();
    });

  const singleTapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  // Compose gestures - double tap takes priority, then long press, then single tap
  const composedGesture = Gesture.Exclusive(
    doubleTapGesture,
    longPressGesture,
    singleTapGesture
  );

  // Get background color for main look based on index
  const getMainLookColors = (idx: number): [string, string] => {
    const colorSets: [string, string][] = [
      ['#E0E7FF', '#F5F3FF'], // Purple tones
      ['#FFF7ED', '#FFEDD5'], // Orange tones
      ['#FDF2F8', '#FCE7F3'], // Pink tones
    ];
    return colorSets[idx % colorSets.length];
  };

  const mainLookColors = getMainLookColors(index);

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <Text style={styles.outfitName}>{recommendation.name}</Text>
              <View style={styles.tagsContainer}>
                {recommendation.styleTags.slice(0, 2).map((tag, i) => (
                  <StyleTagChip
                    key={i}
                    label={tag}
                    variant={i === 0 ? 'style' : 'occasion'}
                  />
                ))}
              </View>
            </View>
            <LinearGradient
              colors={['#6C63FF', '#7B72FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiBadge}
            >
              <Text style={styles.aiBadgeIcon}>⚡</Text>
              <Text style={styles.aiBadgeText}>AI 推荐</Text>
            </LinearGradient>
          </View>

          {/* Main Visual Area */}
          <View style={styles.mainLook}>
            <LinearGradient
              colors={mainLookColors}
              style={styles.mainLookPlaceholder}
            >
              <Text style={styles.mainLookEmoji}>
                {index === 0 ? '👩🏻‍💼' : index === 1 ? '💃🏻' : '🧚🏻‍♀️'}
              </Text>
              <Text style={styles.mainLookText}>
                AI 模特由{'\n'}Dali 生成
              </Text>
            </LinearGradient>

            {/* Floating Heart Animation */}
            {showFloatingHeart && (
              <Animated.View style={[styles.floatingHeart, floatingHeartStyle]}>
                <Text style={styles.floatingHeartIcon}>♥</Text>
              </Animated.View>
            )}

            {/* View Detail Hint */}
            <View style={styles.viewDetailHint}>
              <Text style={styles.viewDetailText}>查看详情</Text>
              <Text style={styles.viewDetailArrow}>›</Text>
            </View>
          </View>

          {/* Items Label */}
          <Text style={styles.itemsLabel}>包含单品</Text>

          {/* Outfit Items */}
          <View style={styles.itemsContainer}>
            {recommendation.items.slice(0, 3).map((item, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemText}>{item.color}</Text>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <LikeButton
              isLiked={isLiked}
              onPress={handleLike}
              showLabel={true}
              size="medium"
            />
            <SaveButton
              isSaved={isSaved}
              onPress={handleSave}
              showLabel={true}
              size="medium"
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    flex: 1,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },

  // AI Badge
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeIcon: {
    fontSize: 11,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Main Look
  mainLook: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  mainLookPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLookEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  mainLookText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Floating Heart
  floatingHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeartIcon: {
    fontSize: 60,
    color: '#FF6B9D',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  viewDetailHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  viewDetailText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  viewDetailArrow: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Items
  itemsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  item: {
    width: 80,
    height: 80,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  itemText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
