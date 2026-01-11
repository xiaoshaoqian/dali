/**
 * SyncToast Component
 * Displays sync progress and completion status as a toast notification
 *
 * @see Story 8.3: Network Reconnection and Auto-Sync within 30s
 * @see AC#7: Sync Progress Feedback
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOfflineStore, SyncResult } from '@/stores';
import { colors, spacing } from '@/constants';

// =============================================================================
// Constants
// =============================================================================

const TOAST_HEIGHT = 44;
const AUTO_DISMISS_DELAY = 2000; // 2 seconds after completion
const ANIMATION_DURATION = 300;

// Colors
const TOAST_BACKGROUND = '#FFFFFF';
const TEXT_COLOR = '#1C1C1E';
const SUCCESS_COLOR = '#34C759';
const ERROR_COLOR = '#FF3B30';
const SYNC_COLOR = colors.primary; // #6C63FF

// =============================================================================
// Types
// =============================================================================

interface SyncToastProps {
  /** Override visibility (optional - defaults to auto based on sync state) */
  visible?: boolean;
  /** Custom bottom offset (optional) */
  bottomOffset?: number;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
}

type ToastState = 'hidden' | 'syncing' | 'success' | 'error';

// =============================================================================
// Component
// =============================================================================

export function SyncToast({
  visible: visibleOverride,
  bottomOffset = 100,
  onDismiss,
}: SyncToastProps): React.ReactElement | null {
  const { isSyncing, lastSyncResult } = useOfflineStore();
  const insets = useSafeAreaInsets();

  // Internal state for managing visibility after completion
  const [showResult, setShowResult] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // Animation values
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  // Calculate toast state
  const toastState = useMemo((): ToastState => {
    if (isSyncing) return 'syncing';
    if (lastSyncResult && showResult) {
      if (lastSyncResult.errors.length > 0) return 'error';
      return 'success';
    }
    return 'hidden';
  }, [isSyncing, lastSyncResult, showResult]);

  // Determine if toast should be visible
  const shouldShow = useMemo(() => {
    if (visibleOverride !== undefined) {
      return visibleOverride && toastState !== 'hidden';
    }
    return toastState !== 'hidden';
  }, [visibleOverride, toastState]);

  // Handle dismiss after completion
  const handleDismiss = useCallback(() => {
    setDismissing(true);
    translateY.value = withTiming(100, { duration: ANIMATION_DURATION });
    opacity.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
      runOnJS(setShowResult)(false);
      runOnJS(setDismissing)(false);
      if (onDismiss) {
        runOnJS(onDismiss)();
      }
    });
  }, [translateY, opacity, onDismiss]);

  // Show result when sync completes
  useEffect(() => {
    if (!isSyncing && lastSyncResult) {
      setShowResult(true);
    }
  }, [isSyncing, lastSyncResult]);

  // Auto-dismiss after completion
  useEffect(() => {
    if (toastState === 'success' || toastState === 'error') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_DELAY);

      return () => clearTimeout(timer);
    }
  }, [toastState, handleDismiss]);

  // Show/hide animation
  useEffect(() => {
    if (shouldShow && !dismissing) {
      // Slide up
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else if (!shouldShow && !dismissing) {
      // Slide down
      translateY.value = withTiming(100, { duration: ANIMATION_DURATION });
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    }
  }, [shouldShow, dismissing, translateY, opacity]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Calculate total synced items
  const totalSynced = useMemo(() => {
    if (!lastSyncResult) return 0;
    return lastSyncResult.uploaded + lastSyncResult.downloaded;
  }, [lastSyncResult]);

  // Get message based on state
  const getMessage = (): string => {
    switch (toastState) {
      case 'syncing':
        return '正在同步数据...';
      case 'success':
        return `已同步 ${totalSynced} 条数据 ✓`;
      case 'error':
        return '同步失败，稍后重试';
      default:
        return '';
    }
  };

  // Get icon based on state
  const renderIcon = () => {
    switch (toastState) {
      case 'syncing':
        return (
          <ActivityIndicator
            size="small"
            color={SYNC_COLOR}
            testID="sync-spinner"
          />
        );
      case 'success':
        return (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={SUCCESS_COLOR}
            testID="sync-checkmark"
          />
        );
      case 'error':
        return (
          <Ionicons
            name="alert-circle"
            size={20}
            color={ERROR_COLOR}
            testID="sync-error-icon"
          />
        );
      default:
        return null;
    }
  };

  // Don't render if hidden
  if (!shouldShow) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { bottom: bottomOffset + insets.bottom },
      ]}
      testID="sync-toast"
    >
      <View style={styles.toast}>
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>
    </Animated.View>
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
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TOAST_BACKGROUND,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    minWidth: 180,
    height: TOAST_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginRight: spacing.s,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_COLOR,
  },
});

export default SyncToast;
