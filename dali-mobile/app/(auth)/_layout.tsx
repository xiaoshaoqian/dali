/**
 * Auth Layout
 * Stack navigator for authentication screens
 */
import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/constants/colors';

export default function AuthLayout() {
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
