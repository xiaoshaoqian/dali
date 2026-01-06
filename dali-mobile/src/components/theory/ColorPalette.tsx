/**
 * ColorPalette Component
 * Displays extracted color swatches with names and optional hex values
 * Part of Story 4.1: Color Theory Visualization Component
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@/constants';

export interface ColorItem {
  hex: string;
  name: string;
  category?: string;
}

export interface ColorPaletteProps {
  colors: ColorItem[];
  showHex?: boolean;
  showCategory?: boolean;
  onColorPress?: (hex: string) => void;
}

interface ColorSwatchProps {
  color: ColorItem;
  showHex: boolean;
  showCategory: boolean;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ColorSwatch({ color, showHex, showCategory, onPress }: ColorSwatchProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(1.05, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  return (
    <AnimatedPressable
      style={[styles.swatchContainer, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${color.name}${color.category ? ` ${color.category}` : ''} ${color.hex}`}
    >
      <View style={[styles.colorBlock, { backgroundColor: color.hex }]} />
      <View style={styles.swatchInfo}>
        <Text style={styles.colorName} numberOfLines={1}>
          {color.name}
        </Text>
        {showHex && (
          <Text style={styles.hexValue} numberOfLines={1}>
            {color.hex.toUpperCase()}
          </Text>
        )}
        {showCategory && color.category && (
          <Text style={styles.categoryLabel} numberOfLines={1}>
            {color.category}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

export function ColorPalette({
  colors,
  showHex = false,
  showCategory = true,
  onColorPress,
}: ColorPaletteProps) {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {colors.map((color, index) => (
          <ColorSwatch
            key={`${color.hex}-${index}`}
            color={color}
            showHex={showHex}
            showCategory={showCategory}
            onPress={onColorPress ? () => onColorPress(color.hex) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  swatchContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray4, // iOS system gray background per AC #3
    borderRadius: 12,
    padding: 8,
    minWidth: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  colorBlock: {
    width: 16, // 16×16pt per AC #3
    height: 16,
    borderRadius: 4, // Proportional corner radius
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  swatchInfo: {
    alignItems: 'center',
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray1,
    textAlign: 'center',
  },
  hexValue: {
    fontSize: 10,
    color: colors.gray3,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  categoryLabel: {
    fontSize: 10,
    color: colors.gray2,
    marginTop: 2,
  },
});
