/**
 * ArtisticTemplate Component
 *
 * Artistic share template with warm beige background, handwritten feel,
 * and theory explanation. Suitable for Moments and knowledge sharing.
 *
 * Design Specifications:
 * - Background: Beige texture (#F5F0E8)
 * - Title: "你的专属搭配方案" with handwritten font feel
 * - Dashed border: 2px #D4C4B0
 * - Theory text: 12pt, line-height 1.5
 * - Layout: Elegant and knowledge-focused
 *
 * @module components/share/templates/ArtisticTemplate
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import type { OutfitData } from '@/types/share';

/**
 * ArtisticTemplate component props
 */
export interface ArtisticTemplateProps {
  outfit: OutfitData;
}

/**
 * Artistic-style share template component
 *
 * @param props - Component props
 * @returns ArtisticTemplate component
 */
export function ArtisticTemplate({ outfit }: ArtisticTemplateProps): JSX.Element {
  return (
    <LinearGradient
      colors={['#FFF5E5', '#FFE5CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>你的专属搭配方案</Text>
        <View style={styles.divider} />
      </View>

      {/* Outfit Items with Dashed Border */}
      <View style={styles.itemsContainer}>
        <View style={styles.dashedBorder}>
          <View style={styles.itemsGrid}>
            {outfit.items.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                  resizeMode="cover"
                  testID="outfit-item"
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Style Tags */}
      <View style={styles.tagsSection}>
        {outfit.styleTags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tagContainer}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* Theory Explanation Section */}
      <View style={styles.theorySection}>
        <Text style={styles.theoryTitle}>配色理论解析</Text>
        <Text style={styles.theoryText}>
          {outfit.theoryExcerpt.length > 150
            ? `${outfit.theoryExcerpt.substring(0, 150)}...`
            : outfit.theoryExcerpt}
        </Text>
      </View>

      {/* Footer with Logo and Branding */}
      <View style={styles.footerSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>搭理</Text>
          <Text style={styles.logoSubtext}>AI穿搭知识库</Text>
        </View>
        <View style={styles.qrcodeContainer}>
          <QRCode
            value="https://dali.app"
            size={80}
            color="#6C63FF"
            backgroundColor="transparent"
          />
        </View>
        <View style={styles.decorativeLine} />
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
    fontSize: 52,
    fontWeight: '600',
    color: '#3A3A3C',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 16,
  },
  divider: {
    width: 200,
    height: 2,
    backgroundColor: '#D4C4B0',
  },
  itemsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dashedBorder: {
    borderWidth: 2,
    borderColor: '#D4C4B0',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 24,
  },
  itemsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  itemWrapper: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  tagsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  tagContainer: {
    backgroundColor: 'rgba(212, 196, 176, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#6C5B3C',
  },
  theorySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    marginBottom: 32,
  },
  theoryTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  theoryText: {
    fontSize: 28,
    lineHeight: 42,
    color: '#3A3A3C',
    textAlign: 'left',
  },
  footerSection: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6C63FF',
    letterSpacing: 2,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '500',
    color: '#8E8E93',
  },
  qrcodeContainer: {
    padding: 8,
    marginBottom: 12,
  },
  decorativeLine: {
    width: 120,
    height: 2,
    backgroundColor: '#D4C4B0',
  },
});

export default ArtisticTemplate;
