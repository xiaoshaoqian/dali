/**
 * OfflineBanner Component
 * Displays a warning banner when the device is offline
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#2: Offline Banner Display
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOfflineStore } from '@/stores';
import { colors, spacing } from '@/constants';

// =============================================================================
// Constants
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 44;
const MINI_INDICATOR_SIZE = 32;
const AUTO_COLLAPSE_DELAY = 3000; // 3 seconds
const ANIMATION_DURATION = 300;

// Offline warning color - yellow per AC#2
const OFFLINE_WARNING_COLOR = '#FFCC00';
const OFFLINE_WARNING_DARK = '#E6B800';

// =============================================================================
// Types
// =============================================================================

interface OfflineBannerProps {
  /** Optional callback when banner is dismissed */
  onDismiss?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function OfflineBanner({ onDismiss }: OfflineBannerProps): React.ReactElement | null {
  const { isOnline } = useOfflineStore();
  const insets = useSafeAreaInsets();

  // State for collapsed mode
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Animation values
  const translateY = useSharedValue(-100);
  const expandProgress = useSharedValue(1); // 1 = expanded, 0 = collapsed

  // Auto-collapse timer
  useEffect(() => {
    if (!isOnline && !isCollapsed && !isDismissed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
        expandProgress.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }, AUTO_COLLAPSE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [isOnline, isCollapsed, isDismissed, expandProgress]);

  // Show/hide animation based on online status
  useEffect(() => {
    if (!isOnline && !isDismissed) {
      // Slide in
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      expandProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      setIsCollapsed(false);
    } else {
      // Slide out
      translateY.value = withTiming(-100, { duration: ANIMATION_DURATION });
      setIsDismissed(false); // Reset dismiss state when going online
    }
  }, [isOnline, isDismissed, translateY, expandProgress]);

  // Handle expand from mini indicator
  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
    expandProgress.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  }, [expandProgress]);

  // Swipe up to dismiss gesture
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY < -30) {
        // Swipe up detected - collapse to mini
        setIsCollapsed(true);
        expandProgress.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
    });

  // Animated styles for the banner container
  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Animated styles for expand/collapse
  const expandAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      expandProgress.value,
      [0, 1],
      [MINI_INDICATOR_SIZE, BANNER_HEIGHT + insets.top],
      Extrapolation.CLAMP
    );

    const width = interpolate(
      expandProgress.value,
      [0, 1],
      [MINI_INDICATOR_SIZE, SCREEN_WIDTH],
      Extrapolation.CLAMP
    );

    const borderRadius = interpolate(
      expandProgress.value,
      [0, 1],
      [MINI_INDICATOR_SIZE / 2, 0],
      Extrapolation.CLAMP
    );

    const right = interpolate(
      expandProgress.value,
      [0, 1],
      [16, 0],
      Extrapolation.CLAMP
    );

    return {
      height,
      width,
      borderRadius,
      right,
    };
  });

  // Animated opacity for full banner content
  const contentOpacity = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

  // Animated opacity for mini indicator content
  const miniOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      expandProgress.value,
      [0, 0.3],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  // Don't render if online
  if (isOnline) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          bannerAnimatedStyle,
          { top: 0 },
        ]}
        testID="offline-banner"
      >
        <Animated.View
          style={[
            styles.banner,
            expandAnimatedStyle,
            { paddingTop: isCollapsed ? 0 : insets.top },
          ]}
        >
          {/* Full Banner Content */}
          <Animated.View style={[styles.fullContent, contentOpacity]}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="cloud-offline"
                size={20}
                color="#1C1C1E"
                testID="offline-icon"
              />
            </View>
            <Text style={styles.message}>当前离线，部分功能不可用</Text>
          </Animated.View>

          {/* Mini Indicator Content */}
          {isCollapsed && (
            <TouchableOpacity
              style={styles.miniContainer}
              onPress={handleExpand}
              activeOpacity={0.8}
              testID="offline-banner-mini"
            >
              <Animated.View style={miniOpacity}>
                <Ionicons
                  name="cloud-offline"
                  size={18}
                  color="#1C1C1E"
                />
              </Animated.View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  banner: {
    backgroundColor: OFFLINE_WARNING_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  fullContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
  },
  iconContainer: {
    marginRight: spacing.s,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  miniContainer: {
    width: MINI_INDICATOR_SIZE,
    height: MINI_INDICATOR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OfflineBanner;
