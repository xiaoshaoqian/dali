/**
 * MinimalTemplate Component
 *
 * Minimalist share template with white background, clean layout,
 * and simple branding. Suitable for WeChat and Moments.
 *
 * Design Specifications:
 * - Background: Pure white (#FFFFFF)
 * - Layout: Top logo + 3 items horizontal + bottom watermark
 * - Image spacing: 12px
 * - Border radius: 16px
 *
 * @module components/share/templates/MinimalTemplate
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { OutfitData } from '@/types/share';

/**
 * MinimalTemplate component props
 */
export interface MinimalTemplateProps {
  outfit: OutfitData;
}

/**
 * Minimalist share template component
 *
 * @param props - Component props
 * @returns MinimalTemplate component
 */
export function MinimalTemplate({ outfit }: MinimalTemplateProps): JSX.Element {
  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Text style={styles.logoText}>搭理</Text>
      </View>

      {/* Outfit Items - 3 items in horizontal row */}
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

      {/* Watermark Section */}
      <View style={styles.watermarkSection}>
        <Text style={styles.watermarkText}>AI为你搭配</Text>
        <View style={styles.qrcodeContainer}>
          <QRCode
            value="https://dali.app"
            size={80}
            color="#1C1C1E"
            backgroundColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1920,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    paddingTop: 48,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6C63FF',
    letterSpacing: 2,
  },
  itemsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  itemContainer: {
    width: 320,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  watermarkSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  watermarkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  qrcodeContainer: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
});

export default MinimalTemplate;
