/**
 * Toast Component
 * Displays temporary notification messages with auto-dismiss
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */
import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  /** Message to display */
  message: string;
  /** Toast type for styling */
  type?: ToastType;
  /** Duration in ms before auto-dismiss (default: 2000) */
  duration?: number;
  /** Whether toast is visible */
  visible: boolean;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
}

/**
 * Toast notification component with slide-up animation
 */
export function Toast({
  message,
  type = 'info',
  duration = 2000,
  visible,
  onDismiss,
}: ToastProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      // Slide up animation
      translateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        translateY.value = withTiming(100, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        });
        opacity.value = withSequence(
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 0 }, () => {
            runOnJS(handleDismiss)();
          })
        );
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = 100;
      opacity.value = 0;
    }
  }, [visible, duration, translateY, opacity, handleDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[styles.toast, styles[type]]}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  toast: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  success: {
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
  },
  info: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  warning: {
    backgroundColor: 'rgba(255, 149, 0, 0.95)',
  },
  error: {
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
  },
});
