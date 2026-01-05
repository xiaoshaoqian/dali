/**
 * Outfit Results Screen
 * Displays AI-generated outfit recommendations
 * Part of Story 3.2: Occasion-Based Recommendation Engine
 */
import React, { useMemo } from 'react';
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

import { colors } from '@/constants';
import type { OutfitRecommendation } from '@/services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

// Style tag chip component
function StyleTag({ tag }: { tag: string }) {
  return (
    <View style={styles.styleTag}>
      <Text style={styles.styleTagText}>{tag}</Text>
    </View>
  );
}

// Outfit card component
function OutfitCard({ recommendation, index }: { recommendation: OutfitRecommendation; index: number }) {
  return (
    <View style={styles.outfitCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardIndex}>方案 {index + 1}</Text>
        <Text style={styles.cardName}>{recommendation.name}</Text>
      </View>

      {/* Style Tags */}
      <View style={styles.tagsContainer}>
        {recommendation.styleTags.map((tag, i) => (
          <StyleTag key={i} tag={tag} />
        ))}
      </View>

      {/* Outfit Items */}
      <View style={styles.itemsContainer}>
        {recommendation.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemType}>{item.itemType}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemColor}>{item.color}</Text>
          </View>
        ))}
      </View>

      {/* Theory Preview */}
      <View style={styles.theoryContainer}>
        <Text style={styles.theoryLabel}>搭配解析</Text>
        <Text style={styles.theoryText} numberOfLines={3}>
          {recommendation.theory.fullExplanation}
        </Text>
      </View>

      {/* Color Principle */}
      <View style={styles.principleContainer}>
        <Text style={styles.principleLabel}>配色原理：</Text>
        <Text style={styles.principleValue}>{recommendation.theory.colorPrinciple}</Text>
      </View>
    </View>
  );
}

export default function OutfitResultsScreen() {
  const params = useLocalSearchParams<{
    recommendations: string;
    occasion: string;
    photoUrl: string;
  }>();

  const insets = useSafeAreaInsets();

  // Parse recommendations from params
  const recommendations: OutfitRecommendation[] = useMemo(() => {
    try {
      return params.recommendations ? JSON.parse(params.recommendations) : [];
    } catch {
      return [];
    }
  }, [params.recommendations]);

  const handleDone = () => {
    router.replace('/(tabs)' as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6C63FF', '#9D94FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>搭配方案</Text>
          <Text style={styles.headerSubtitle}>{params.occasion || '场合'} · 共 {recommendations.length} 套</Text>
        </View>
      </LinearGradient>

      {/* Recommendations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {recommendations.map((rec, index) => (
          <OutfitCard key={rec.id} recommendation={rec} index={index} />
        ))}

        {recommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无推荐方案</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>完成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Outfit Card
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardIndex: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },

  // Style Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  styleTag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  styleTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },

  // Outfit Items
  itemsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  itemColor: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // Theory
  theoryContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  theoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  theoryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3C3C43',
  },

  // Color Principle
  principleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  principleLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  principleValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  doneButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
