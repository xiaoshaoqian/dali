/**
 * FashionTemplate Component
 *
 * Fashion-style share template with purple gradient background,
 * dynamic elements, and style tags. Suitable for Xiaohongshu and Douyin.
 *
 * Design Specifications:
 * - Background: Purple gradient (#6C63FF to #9D94FF, 135deg)
 * - Title: "搭理AI推荐" (white, 18pt, Bold)
 * - Style tags: White background with purple text, pill shape
 * - Shadow: 0 4px 12px rgba(108, 99, 255, 0.3)
 * - Image border: White 2px
 *
 * @module components/share/templates/FashionTemplate
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import type { OutfitData } from '@/types/share';

/**
 * FashionTemplate component props
 */
export interface FashionTemplateProps {
  outfit: OutfitData;
}

/**
 * Fashion-style share template component
 *
 * @param props - Component props
 * @returns FashionTemplate component
 */
export function FashionTemplate({ outfit }: FashionTemplateProps): React.ReactElement {
  return (
    <LinearGradient
      colors={['#6C63FF', '#9D94FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>搭理AI推荐</Text>
        <Text style={styles.subtitle}>为你打造专属搭配方案</Text>
      </View>

      {/* Outfit Items Section */}
      <View style={styles.itemsSection}>
        {outfit.items.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
              testID="outfit-item"
            />
          </View>
        ))}
      </View>

      {/* Style Tags Section */}
      <View style={styles.tagsSection}>
        {outfit.styleTags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Occasion Tag Section */}
      <View style={styles.occasionSection}>
        <View style={styles.occasionChip}>
          <Text style={styles.occasionText}>适合场合: {outfit.occasionTag}</Text>
        </View>
      </View>

      {/* Theory Excerpt Section */}
      <View style={styles.theorySection}>
        <Text style={styles.theoryText} numberOfLines={3}>
          {outfit.theoryExcerpt.length > 150
            ? `${outfit.theoryExcerpt.substring(0, 150)}...`
            : outfit.theoryExcerpt}
        </Text>
      </View>

      {/* QR Code and Watermark Section */}
      <View style={styles.footerSection}>
        <View style={styles.qrcodeContainer}>
          <QRCode
            value="https://dali.app"
            size={120}
            color="#1C1C1E"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.footerText}>扫码体验AI穿搭助手</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1920,
    padding: 48,
    justifyContent: 'space-between',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  itemsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  itemContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  tagsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6C63FF',
  },
  occasionSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  occasionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  occasionText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  theorySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  theoryText: {
    fontSize: 28,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footerSection: {
    alignItems: 'center',
    gap: 16,
  },
  qrcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  footerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default FashionTemplate;
