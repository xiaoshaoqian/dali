/**
 * OfflineRestrictionModal Component
 * Modal displayed when user tries to perform a network-required action while offline
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#4: Offline Generate Restriction
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@/constants';

// =============================================================================
// Types
// =============================================================================

export interface OfflineRestrictionModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Title text */
  title: string;
  /** Message text */
  message: string;
  /** Primary button label (e.g., "查看历史") */
  primaryButtonLabel: string;
  /** Secondary button label (e.g., "知道了") */
  secondaryButtonLabel: string;
  /** Callback when primary button is pressed */
  onPrimaryPress: () => void;
  /** Callback when secondary button is pressed */
  onSecondaryPress: () => void;
  /** Callback when modal is dismissed (backdrop press) */
  onDismiss?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const ANIMATION_DURATION = 300;

// =============================================================================
// Component
// =============================================================================

export function OfflineRestrictionModal({
  visible,
  title,
  message,
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryPress,
  onSecondaryPress,
  onDismiss,
}: OfflineRestrictionModalProps): React.ReactElement | null {
  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  // Animate in when visible changes
  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else {
      scale.value = withTiming(0.8, { duration: ANIMATION_DURATION / 2 });
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION / 2 });
      backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION / 2 });
    }
  }, [visible, scale, opacity, backdropOpacity]);

  // Animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Handle backdrop press
  const handleBackdropPress = () => {
    onDismiss?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
      testID="offline-restriction-modal"
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
          testID="offline-modal-backdrop"
        />
      </Animated.View>

      {/* Modal Content */}
      <View style={styles.centeredContainer}>
        <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="cloud-offline"
              size={48}
              color={colors.warning}
              testID="offline-restriction-icon"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* Secondary Button (知道了) */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSecondaryPress}
              activeOpacity={0.7}
              testID="offline-modal-secondary-button"
            >
              <Text style={styles.secondaryButtonText}>{secondaryButtonLabel}</Text>
            </TouchableOpacity>

            {/* Primary Button (查看历史) */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onPrimaryPress}
              activeOpacity={0.8}
              testID="offline-modal-primary-button"
            >
              <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 149, 0, 0.1)', // Warning color light
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray1,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  message: {
    fontSize: 15,
    color: colors.gray2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.m,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.gray4,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.gray2,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OfflineRestrictionModal;
