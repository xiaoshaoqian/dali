/**
 * AILearningModal Component
 * Modal explaining how to improve AI accuracy through user interactions
 *
 * @see Story 7.2: ProgressCircle Component (AI Learning Visualization)
 * @see AC#7: Tap to Show Details Modal
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius } from '@/constants';

// =============================================================================
// Types
// =============================================================================

export interface AILearningModalProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

interface TipItemProps {
  /** Ionicons icon name */
  icon: keyof typeof Ionicons.glyphMap;
  /** Tip text */
  text: string;
}

// =============================================================================
// Constants
// =============================================================================

const TIPS = [
  { icon: 'add-circle-outline' as const, text: '多生成搭配——AI 学习更多案例' },
  { icon: 'heart-outline' as const, text: '点赞你喜欢的方案——AI 会记住你的偏好' },
  { icon: 'star-outline' as const, text: '收藏最爱的搭配——AI 优先推荐类似风格' },
];

// =============================================================================
// Sub-components
// =============================================================================

/**
 * Individual tip item with icon and text
 */
function TipItem({ icon, text }: TipItemProps): React.ReactElement {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipIconContainer}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * AILearningModal - Tips modal for improving AI accuracy
 *
 * Features:
 * - Modal with semi-transparent backdrop
 * - Three tips with icons
 * - Close button with haptic feedback
 * - Backdrop dismiss
 */
export function AILearningModal({
  visible,
  onClose,
}: AILearningModalProps): React.ReactElement | null {
  // Handle close with haptic feedback
  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
        testID="modal-backdrop"
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <Text style={styles.modalTitle}>如何提升 AI 准确度？</Text>

          {/* Tips list */}
          <View style={styles.tipsContainer}>
            {TIPS.map((tip, index) => (
              <TipItem key={index} icon={tip.icon} text={tip.text} />
            ))}
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.8}
            accessibilityLabel="关闭"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>知道了</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.gray5,
    borderRadius: borderRadius.xlarge,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray1,
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  tipsContainer: {
    width: '100%',
    marginBottom: spacing.l,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.primaryTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: colors.gray2,
    lineHeight: 22,
  },
  closeButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.gray5,
  },
});

export default AILearningModal;
