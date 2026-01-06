/**
 * OutfitEmptyState Component
 * Empty state display for outfit history when no outfits exist
 *
 * @see Story 5.2: Outfit History Grid View
 * @see _bmad-output/planning-artifacts/ux-design/pages/04-wardrobe/outfit-page.html
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

// =============================================================================
// Types
// =============================================================================

export interface OutfitEmptyStateProps {
  /** Optional callback for button press (defaults to navigating to home) */
  onButtonPress?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function OutfitEmptyState({ onButtonPress }: OutfitEmptyStateProps) {
  const handlePress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      // Navigate to home tab
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon */}
      <LinearGradient
        colors={['#F0EFFF', '#E8E6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        {/* T-shirt icon */}
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth={2}>
          <Path d="M20.38 3.46L16 2h-2c0 2-3 2-4 0H8L3.62 3.46a2 2 0 0 0-1.08 2.22l.52 2.62a2 2 0 0 0 1.63 1.58L6 10v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9l1.31-.12a2 2 0 0 0 1.63-1.58l.52-2.62a2 2 0 0 0-1.08-2.22z" />
        </Svg>
      </LinearGradient>

      {/* Title */}
      <Text style={styles.title}>还没有搭配记录</Text>

      {/* Description */}
      <Text style={styles.description}>
        去首页拍照生成你的第一套搭配吧
      </Text>

      {/* Button */}
      <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel="开始搭配">
        <LinearGradient
          colors={['#6C63FF', '#7B72FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
            <Path d="M12 5v14M5 12h14" />
          </Svg>
          <Text style={styles.buttonText}>开始搭配</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E5EA',
    marginTop: 20,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },

  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
