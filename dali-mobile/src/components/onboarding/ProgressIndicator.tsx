/**
 * ProgressIndicator Component
 * Shows current step in onboarding flow (e.g., "1/3")
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentStep ? styles.dotCompleted : null,
              index === currentStep - 1 ? styles.dotActive : null,
            ]}
          />
        ))}
      </View>
      <Text style={styles.text}>
        {currentStep}/{totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray3,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.caption1,
    color: colors.gray2,
  },
});
