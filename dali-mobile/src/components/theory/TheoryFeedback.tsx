/**
 * TheoryFeedback Component
 * Displays "Was this helpful? 👍/👎" feedback buttons
 * Part of Story 4.3: Theory Explanation Text Generation and Display
 *
 * Tracks user feedback for NFR-AI3: >80% users should find explanations helpful
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@/constants';
import { submitTheoryFeedback } from '@/hooks/useTheoryViewTracking';

// Props interface
export interface TheoryFeedbackProps {
  /** Outfit ID for tracking */
  outfitId: string;
  /** Whether the component is visible */
  visible?: boolean;
  /** Callback when feedback is submitted */
  onFeedback?: (helpful: boolean) => void;
  /** Test ID for testing */
  testID?: string;
}

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Feedback button component
 */
function FeedbackButton({
  emoji,
  isSelected,
  onPress,
  testID,
}: {
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
  testID?: string;
}) {
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
    <AnimatedTouchable
      style={[
        styles.feedbackButton,
        isSelected && styles.feedbackButtonSelected,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      testID={testID}
    >
      <Text style={styles.feedbackEmoji}>{emoji}</Text>
    </AnimatedTouchable>
  );
}

/**
 * TheoryFeedback - Collects user feedback on theory explanation helpfulness
 */
export function TheoryFeedback({
  outfitId,
  visible = true,
  onFeedback,
  testID,
}: TheoryFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleFeedback = useCallback(
    (helpful: boolean) => {
      setFeedback(helpful);
      setSubmitted(true);
      onFeedback?.(helpful);

      // Send feedback to API (AC #6)
      submitTheoryFeedback(outfitId, helpful);
    },
    [onFeedback, outfitId]
  );

  if (!visible) {
    return null;
  }

  // Show thank you message after submission
  if (submitted) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.container}
        testID={testID}
      >
        <View style={styles.thankYouContainer}>
          <Text style={styles.thankYouText}>
            {feedback ? '感谢你的反馈！很高兴对你有帮助 ✨' : '感谢反馈，我们会继续优化 💪'}
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.delay(500).duration(400)}
      style={styles.container}
      testID={testID}
    >
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackQuestion}>这个解析有帮助吗？</Text>
        <View style={styles.feedbackButtons}>
          <FeedbackButton
            emoji="👍"
            isSelected={feedback === true}
            onPress={() => handleFeedback(true)}
            testID={testID ? `${testID}-helpful` : undefined}
          />
          <FeedbackButton
            emoji="👎"
            isSelected={feedback === false}
            onPress={() => handleFeedback(false)}
            testID={testID ? `${testID}-not-helpful` : undefined}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray4,
    borderRadius: 12,
    marginTop: 16,
  },
  feedbackQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray2,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  feedbackEmoji: {
    fontSize: 20,
  },
  thankYouContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});
