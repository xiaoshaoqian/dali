/**
 * Typography System for Dali App
 * Based on iOS Human Interface Guidelines - SF Pro font system
 *
 * @see _bmad-output/planning-artifacts/ux-design-specification.md#Typography System
 */

import { TextStyle } from 'react-native';

// Type for font weight values
type FontWeight = TextStyle['fontWeight'];

export const typography = {
  // Large Title - Main screen titles
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold' as FontWeight,
    lineHeight: 41,
  },

  // Title 1 - Section headers
  title1: {
    fontSize: 28,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 34,
  },

  // Title 2 - Subsection headers
  title2: {
    fontSize: 22,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 28,
  },

  // Title 3 - Card titles
  title3: {
    fontSize: 20,
    fontWeight: '600' as FontWeight,
    lineHeight: 25,
  },

  // Headline - Important body text
  headline: {
    fontSize: 17,
    fontWeight: '600' as FontWeight,
    lineHeight: 22,
  },

  // Body - Default text style
  body: {
    fontSize: 17,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 22,
  },

  // Callout - Slightly smaller body text
  callout: {
    fontSize: 16,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 21,
  },

  // Subhead - Secondary information
  subhead: {
    fontSize: 15,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 20,
  },

  // Footnote - Small supporting text
  footnote: {
    fontSize: 13,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 18,
  },

  // Caption 1 - Labels and metadata
  caption1: {
    fontSize: 12,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 16,
  },

  // Caption 2 - Smallest text
  caption2: {
    fontSize: 11,
    fontWeight: 'normal' as FontWeight,
    lineHeight: 13,
  },
} as const;

// Type export for TypeScript inference
export type TypographyKey = keyof typeof typography;
export type TypographyStyle = (typeof typography)[TypographyKey];
