/**
 * LikeButton Component
 * Heart button with scale animation, particle burst, and haptic feedback for liking outfits
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface LikeButtonProps {
  /** Whether the outfit is currently liked */
  isLiked: boolean;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Whether to show label text */
  showLabel?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether button is disabled */
  disabled?: boolean;
}

// Particle count for burst effect
const PARTICLE_COUNT = 6;

/**
 * Single particle component for the burst effect
 */
function Particle({
  angle,
  particleScale,
  particleOpacity,
  particleDistance,
}: {
  angle: number;
  particleScale: SharedValue<number>;
  particleOpacity: SharedValue<number>;
  particleDistance: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * particleDistance.value;
    const y = Math.sin(radians) * particleDistance.value;
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: particleScale.value },
      ],
      opacity: particleOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Text style={styles.particleIcon}>♥</Text>
    </Animated.View>
  );
}

/**
 * Animated heart button for liking outfits with particle burst effect
 */
export function LikeButton({
  isLiked,
  onPress,
  showLabel = true,
  size = 'medium',
  disabled = false,
}: LikeButtonProps) {
  const scale = useSharedValue(1);
  const [showParticles, setShowParticles] = useState(false);

  // Particle animation values
  const particleScale = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const particleDistance = useSharedValue(0);

  const hideParticles = useCallback(() => {
    setShowParticles(false);
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Play scale animation (1.0 -> 1.3 -> 1.0)
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Play particle burst animation only when liking (not unliking)
    if (!isLiked) {
      setShowParticles(true);
      particleScale.value = 0;
      particleOpacity.value = 1;
      particleDistance.value = 0;

      // Animate particles outward
      particleScale.value = withSequence(
        withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 150 })
      );
      particleDistance.value = withTiming(24, { duration: 300, easing: Easing.out(Easing.ease) });
      particleOpacity.value = withDelay(
        150,
        withTiming(0, { duration: 150 }, () => {
          runOnJS(hideParticles)();
        })
      );
    }

    onPress();
  }, [disabled, onPress, scale, isLiked, particleScale, particleOpacity, particleDistance, hideParticles]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeConfig = {
    small: { iconSize: 14, fontSize: 12, paddingH: 8, paddingV: 4, height: 32 },
    medium: { iconSize: 18, fontSize: 15, paddingH: 16, paddingV: 8, height: 48 },
    large: { iconSize: 24, fontSize: 17, paddingH: 20, paddingV: 12, height: 56 },
  };

  const config = sizeConfig[size];

  // Generate particle angles (evenly distributed in a circle)
  const particleAngles = Array.from({ length: PARTICLE_COUNT }, (_, i) => (i * 360) / PARTICLE_COUNT);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isLiked ? styles.buttonLiked : styles.buttonDefault,
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
      <View style={styles.iconContainer}>
        <Animated.View style={animatedIconStyle}>
          <Text
            style={[
              styles.icon,
              { fontSize: config.iconSize },
              isLiked ? styles.iconLiked : styles.iconDefault,
            ]}
          >
            {isLiked ? '♥' : '♡'}
          </Text>
        </Animated.View>

        {/* Particle burst overlay */}
        {showParticles && (
          <View style={styles.particlesContainer}>
            {particleAngles.map((angle, index) => (
              <Particle
                key={index}
                angle={angle}
                particleScale={particleScale}
                particleOpacity={particleOpacity}
                particleDistance={particleDistance}
              />
            ))}
          </View>
        )}
      </View>

      {showLabel && (
        <Text
          style={[
            styles.label,
            { fontSize: config.fontSize },
            isLiked ? styles.labelLiked : styles.labelDefault,
          ]}
        >
          {isLiked ? '已点赞' : '点赞'}
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
    backgroundColor: '#F2F2F7',
  },
  buttonLiked: {
    backgroundColor: '#FFE5F0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily: 'System',
  },
  iconDefault: {
    color: '#8E8E93', // iOS gray per UX spec
  },
  iconLiked: {
    color: '#FF6B9D',
  },
  label: {
    fontWeight: '600',
  },
  labelDefault: {
    color: '#1C1C1E',
  },
  labelLiked: {
    color: '#FF6B9D',
  },
  // Particle styles
  particlesContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  particle: {
    position: 'absolute',
  },
  particleIcon: {
    fontSize: 8,
    color: '#FF6B9D',
  },
});
