/**
 * Onboarding Layout
 * Placeholder for Story 1.3 implementation
 */
import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.gray5,
        },
      }}
    />
  );
}
