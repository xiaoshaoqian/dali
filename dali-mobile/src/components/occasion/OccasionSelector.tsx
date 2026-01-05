/**
 * Occasion Selector Modal Component
 * Bottom sheet modal for selecting outfit occasion
 * Part of Story 3.2: Occasion-Based Recommendation Engine
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 40 - 24) / 3; // 20px padding each side, 12px gap * 2

// Occasion types
export interface Occasion {
  id: string;
  name: string;
  icon: string;
}

// Predefined occasions
export const OCCASIONS: Occasion[] = [
  { id: 'work', name: '职场通勤', icon: '💼' },
  { id: 'date', name: '浪漫约会', icon: '💕' },
  { id: 'casual', name: '休闲娱乐', icon: '☕' },
  { id: 'party', name: '聚会派对', icon: '🎉' },
  { id: 'sports', name: '运动健身', icon: '🏃' },
  { id: 'home', name: '居家休闲', icon: '🏠' },
];

// Props for the occasion selector
interface OccasionSelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (occasion: Occasion) => void;
}

/**
 * Get AI recommended occasion based on current time
 */
function getRecommendedOccasion(): { occasion: Occasion; reason: string } {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isWeekday = !isWeekend;

  // Time-based recommendations
  if (isWeekday && hour >= 7 && hour < 10) {
    return {
      occasion: OCCASIONS[0], // 职场通勤
      reason: '工作日上午 · 适合通勤场景',
    };
  } else if (isWeekday && hour >= 10 && hour < 18) {
    return {
      occasion: OCCASIONS[0], // 职场通勤
      reason: '工作日 · 适合办公场景',
    };
  } else if (hour >= 18 && hour < 22) {
    return {
      occasion: OCCASIONS[3], // 聚会派对
      reason: '晚间时段 · 适合聚会社交',
    };
  } else if (isWeekend && hour >= 8 && hour < 18) {
    return {
      occasion: OCCASIONS[2], // 休闲娱乐
      reason: '周末时光 · 适合休闲放松',
    };
  } else if (hour >= 6 && hour < 8) {
    return {
      occasion: OCCASIONS[4], // 运动健身
      reason: '清晨时段 · 适合晨练运动',
    };
  } else {
    return {
      occasion: OCCASIONS[5], // 居家休闲
      reason: '居家时光 · 舒适为主',
    };
  }
}

export function OccasionSelector({ visible, onClose, onConfirm }: OccasionSelectorProps) {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Get AI recommendation
  const recommendation = useMemo(() => getRecommendedOccasion(), []);

  // Handle occasion selection
  const handleSelect = useCallback((occasion: Occasion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedId(occasion.id);
  }, []);

  // Handle AI recommendation selection
  const handleRecommendSelect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedId(recommendation.occasion.id);
  }, [recommendation]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    const selected = OCCASIONS.find((o) => o.id === selectedId);
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onConfirm(selected);
    }
  }, [selectedId, onConfirm]);

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (visible) {
      // Auto-select AI recommendation
      setSelectedId(recommendation.occasion.id);
    }
  }, [visible, recommendation]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <View
          style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>选择搭配场合</Text>
            <Text style={styles.subtitle}>告诉我你今天要去哪里，AI 会为你推荐更合适的搭配</Text>
          </View>

          {/* AI Smart Recommendation */}
          <TouchableOpacity
            style={[
              styles.recommendCard,
              selectedId === recommendation.occasion.id && styles.recommendCardSelected,
            ]}
            onPress={handleRecommendSelect}
            activeOpacity={0.8}
          >
            <View style={styles.recommendIcon}>
              <Text style={styles.recommendIconText}>⚡</Text>
            </View>
            <View style={styles.recommendContent}>
              <Text style={styles.recommendLabel}>AI 智能推荐</Text>
              <Text style={styles.recommendOccasion}>{recommendation.occasion.name}</Text>
              <Text style={styles.recommendReason}>{recommendation.reason}</Text>
            </View>
            {selectedId === recommendation.occasion.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          {/* Occasions Grid */}
          <View style={styles.grid}>
            {OCCASIONS.map((occasion) => {
              const isSelected = selectedId === occasion.id;
              return (
                <TouchableOpacity
                  key={occasion.id}
                  style={[styles.occasionCard, isSelected && styles.occasionCardSelected]}
                  onPress={() => handleSelect(occasion)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.occasionIcon}>{occasion.icon}</Text>
                  <Text style={[styles.occasionName, isSelected && styles.occasionNameSelected]}>
                    {occasion.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmButton, !selectedId && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={!selectedId}
          >
            <LinearGradient
              colors={selectedId ? ['#6C63FF', '#7B72FF'] : ['#C7C7CC', '#C7C7CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>生成搭配</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dragIndicator: {
    width: 36,
    height: 5,
    backgroundColor: '#D1D1D6',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 21,
  },

  // AI Recommendation Card
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendCardSelected: {
    backgroundColor: '#F0EFFF',
    borderColor: colors.primary,
  },
  recommendIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendIconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  recommendContent: {
    flex: 1,
  },
  recommendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  recommendOccasion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  recommendReason: {
    fontSize: 12,
    color: '#8E8E93',
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },

  // Occasions Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  occasionCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  occasionCardSelected: {
    backgroundColor: '#F0EFFF',
    borderColor: colors.primary,
  },
  occasionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  occasionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  occasionNameSelected: {
    color: colors.primary,
  },

  // Confirm Button
  confirmButton: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OccasionSelector;
