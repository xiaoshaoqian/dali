/**
 * Color System for Dali App
 * Based on UX Design Specification - Direction L4 (精致层叠卡片)
 *
 * @see _bmad-output/planning-artifacts/ux-design-specification.md#Color System
 */

export const colors = {
  // Brand Colors
  primary: '#6C63FF', // Modern Purple - Main brand color
  secondary: '#9D94FF', // Light Purple - Secondary elements
  accent: '#FF6B9D', // Warm Pink - Accent/highlight

  // iOS System Grays (for text and UI elements)
  gray1: '#1C1C1E', // Deep gray (primary text)
  gray2: '#3A3A3C', // Secondary text
  gray3: '#48484A', // Tertiary text / Borders
  gray4: '#F2F2F7', // Background
  gray5: '#FFFFFF', // Card background

  // Semantic Colors (iOS standard)
  success: '#34C759', // Green - Success states
  warning: '#FF9500', // Orange - Warning states
  error: '#FF3B30', // Red - Error states
  info: '#007AFF', // Blue - Info states

  // Gradient colors for headers
  gradientStart: '#6C63FF', // Purple gradient start
  gradientEnd: '#9D94FF', // Purple gradient end

  // Transparent variants
  primaryTransparent: 'rgba(108, 99, 255, 0.1)', // For tag backgrounds
  accentTransparent: 'rgba(255, 107, 157, 0.1)', // For accent backgrounds

  // System colors
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
  divider: '#E5E5EA', // List dividers
} as const;

// Type export for TypeScript inference
export type ColorKey = keyof typeof colors;
