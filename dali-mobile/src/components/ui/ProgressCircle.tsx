/**
 * ProgressCircle Component
 * Animated circular progress indicator for AI learning visualization
 *
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 * @see AC#1: ProgressCircle Component Rendering
 * @see AC#2: Circular Progress Visual Design
 * @see AC#3: Progress Percentage Display
 * @see AC#4: Progress Animation
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { colors, spacing } from '@/constants';

// =============================================================================
// Types
// =============================================================================

export interface ProgressCircleProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Ring diameter in points (default: 160) */
  size?: number;
  /** Ring thickness in points (default: 12) */
  strokeWidth?: number;
  /** Center label text (optional) */
  label?: string;
  /** Tap handler (optional) */
  onPress?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_SIZE = 160;
const DEFAULT_STROKE_WIDTH = 12;
const ANIMATION_DURATION = 500;
const TRACK_COLOR = '#E5E5EA';
const GRADIENT_START = colors.primary; // #6C63FF
const GRADIENT_END = '#8B7FFF';
const GLOW_COLOR = 'rgba(108, 99, 255, 0.5)';
const GLOW_RADIUS = 4;

// Create animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// =============================================================================
// Component
// =============================================================================

/**
 * ProgressCircle - Animated circular progress indicator
 *
 * Features:
 * - SVG-based circular progress ring
 * - Purple gradient fill
 * - Smooth animation from 0 to target value
 * - Centered percentage and label text
 * - Haptic feedback on tap
 */
export function ProgressCircle({
  progress,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  label,
  onPress,
}: ProgressCircleProps): React.ReactElement {
  // Calculate circle geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated progress value
  const animatedProgress = useSharedValue(0);

  // Animate on progress change
  React.useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, progress) / 100, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.ease),
    });
  }, [progress, animatedProgress]);

  // Animated stroke dashoffset for progress fill
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  // Handle press with haptic feedback
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      testID="progress-circle"
      accessibilityLabel={`AI learning progress: ${Math.round(progress)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={styles.svg}
      >
        <Defs>
          {/* Purple gradient for progress fill */}
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={GRADIENT_START} />
            <Stop offset="100%" stopColor={GRADIENT_END} />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Glow effect circle (AC#2: drop-shadow effect) */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={GLOW_COLOR}
          strokeWidth={strokeWidth + GLOW_RADIUS * 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="none"
          opacity={0.5}
        />

        {/* Animated progress fill */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>

      {/* Center text */}
      <View style={styles.textContainer}>
        <Text style={styles.percentText}>{Math.round(progress)}%</Text>
        {label && <Text style={styles.labelText}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    // Rotate -90deg to start progress from top
    transform: [{ rotate: '-90deg' }],
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 36,
  },
  labelText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: spacing.xxs,
    textAlign: 'center',
    maxWidth: 120,
  },
});

export default ProgressCircle;
