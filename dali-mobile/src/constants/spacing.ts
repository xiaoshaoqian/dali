/**
 * Spacing System for Dali App
 * Based on 8px grid system per UX specification
 *
 * @see _bmad-output/planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation
 */

export const spacing = {
  // Extra extra small - 2px
  xxs: 2,

  // Extra small - 4px
  xs: 4,

  // Small - 8px (base unit)
  s: 8,

  // Medium - 16px (2 base units)
  m: 16,

  // Large - 24px (3 base units)
  l: 24,

  // Extra large - 32px (4 base units)
  xl: 32,

  // Extra extra large - 40px (5 base units)
  xxl: 40,

  // Extra extra extra large - 48px (6 base units)
  xxxl: 48,
} as const;

// Border radius constants
export const borderRadius = {
  // Small radius for buttons, inputs
  small: 8,

  // Medium radius for cards
  medium: 12,

  // Large radius for modals, bottom sheets
  large: 16,

  // Extra large radius for floating cards
  xlarge: 24,

  // Full round for circular elements
  full: 9999,
} as const;

// Shadow constants for iOS elevation
export const shadows = {
  // Light shadow for subtle depth
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Medium shadow for cards
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  // Heavy shadow for floating elements
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Type exports
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
