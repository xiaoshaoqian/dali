/**
 * SaveButton Component
 * Star button with rotation animation and haptic feedback for saving outfits
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */
import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';

interface SaveButtonProps {
  /** Whether the outfit is currently saved/favorited */
  isSaved: boolean;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Whether to show label text */
  showLabel?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether button is disabled */
  disabled?: boolean;
}

/**
 * Animated star button for saving outfits to favorites
 */
export function SaveButton({
  isSaved,
  onPress,
  showLabel = true,
  size = 'medium',
  disabled = false,
}: SaveButtonProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (disabled) return;

    // Trigger haptic feedback (medium for save)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play rotation animation when saving
    if (!isSaved) {
      rotation.value = withSequence(
        withTiming(360, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, { duration: 0 })
      );
    }

    // Scale animation - 200ms ease-out per AC #6
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });

    onPress();
  }, [disabled, isSaved, onPress, rotation, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const sizeConfig = {
    small: { iconSize: 14, fontSize: 12, paddingH: 8, paddingV: 4, height: 32 },
    medium: { iconSize: 16, fontSize: 15, paddingH: 16, paddingV: 8, height: 48 },
    large: { iconSize: 20, fontSize: 17, paddingH: 20, paddingV: 12, height: 56 },
  };

  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSaved ? styles.buttonSaved : styles.buttonDefault,
        {
          height: config.height,
          paddingHorizontal: config.paddingH,
        },
        disabled && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Animated.View style={animatedIconStyle}>
        <Text
          style={[
            styles.icon,
            { fontSize: config.iconSize },
            isSaved ? styles.iconSaved : styles.iconDefault,
          ]}
        >
          {isSaved ? '★' : '☆'}
        </Text>
      </Animated.View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { fontSize: config.fontSize },
            isSaved ? styles.labelSaved : styles.labelDefault,
          ]}
        >
          {isSaved ? '已收藏' : '收藏'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  buttonDefault: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonSaved: {
    backgroundColor: '#FF9500', // iOS yellow per UX spec
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontFamily: 'System',
  },
  iconDefault: {
    color: '#FFFFFF',
  },
  iconSaved: {
    color: '#FFFFFF',
  },
  label: {
    fontWeight: '600',
  },
  labelDefault: {
    color: '#FFFFFF',
  },
  labelSaved: {
    color: '#FFFFFF',
  },
});
