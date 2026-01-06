/**
 * TheoryExplanation Component
 * Displays theory explanation text with keyword highlighting
 * Part of Story 4.3: Theory Explanation Text Generation and Display
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/03-outfit-detail/outfit-detail-page.html
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextLayoutEventData, NativeSyntheticEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@/constants';

// Props interface
export interface TheoryExplanationProps {
  /** The explanation text (150-200 characters), supports **keyword** highlighting */
  explanation: string;
  /** Whether to enable keyword highlighting, default true */
  showHighlights?: boolean;
  /** Highlight color, default primary (#6C63FF) */
  highlightColor?: string;
  /** Maximum lines to show before expand (0 = no limit) */
  maxLines?: number;
  /** Press callback */
  onPress?: () => void;
  /** Test ID for testing */
  testID?: string;
}

// Text part interface for parsing
interface TextPart {
  text: string;
  isHighlight: boolean;
}

/**
 * Parse text with **keyword** markers into parts
 */
function parseHighlightedText(text: string): TextPart[] {
  if (!text) return [];

  const regex = /\*\*(.+?)\*\*/g;
  const parts: TextPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add normal text before this match
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isHighlight: false,
      });
    }
    // Add highlighted text (without the ** markers)
    parts.push({
      text: match[1],
      isHighlight: true,
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining normal text
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isHighlight: false,
    });
  }

  return parts;
}

/**
 * TheoryExplanation - Displays styling theory explanation with keyword highlights
 */
export function TheoryExplanation({
  explanation,
  showHighlights = true,
  highlightColor = colors.primary,
  maxLines = 0,
  onPress,
  testID,
}: TheoryExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const scale = useSharedValue(1);

  // Parse text into parts with highlights
  const textParts = useMemo(() => {
    return showHighlights ? parseHighlightedText(explanation) : [{ text: explanation, isHighlight: false }];
  }, [explanation, showHighlights]);

  // Animation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: 100, easing: Easing.out(Easing.ease) });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (needsExpansion) {
      setIsExpanded((prev) => !prev);
    }
    onPress?.();
  }, [needsExpansion, onPress]);

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (maxLines > 0 && event.nativeEvent.lines.length > maxLines) {
        setNeedsExpansion(true);
      }
    },
    [maxLines]
  );

  // Determine number of lines to show
  const numberOfLines = maxLines > 0 && !isExpanded ? maxLines : undefined;

  return (
    <Animated.View style={[styles.container, animatedStyle]} testID={testID}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!onPress && !needsExpansion}
      >
        <Text
          style={styles.explanationText}
          numberOfLines={numberOfLines}
          onTextLayout={handleTextLayout}
          testID={testID ? `${testID}-text` : undefined}
        >
          {textParts.map((part, index) =>
            part.isHighlight ? (
              <Text
                key={index}
                style={[styles.highlightText, { color: highlightColor }]}
                testID={testID ? `${testID}-highlight-${index}` : undefined}
              >
                {part.text}
              </Text>
            ) : (
              part.text
            )
          )}
        </Text>

        {/* Expand/Collapse button */}
        {needsExpansion && (
          <Text style={styles.expandButton} testID={testID ? `${testID}-expand` : undefined}>
            {isExpanded ? '收起' : '展开全文'}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray1, // iOS System Gray 1 (AC #4)
    fontWeight: '400',
  },
  highlightText: {
    fontWeight: '500',
  },
  expandButton: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 8,
  },
});
