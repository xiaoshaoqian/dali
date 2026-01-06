/**
 * ColorWheel Component
 * Full 12-color hue wheel with highlight markers and connection lines
 * Part of Story 4.1: Color Theory Visualization Component
 */
import React, { useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, Path, Line, G } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@/constants';

// 12-color hue wheel definition
interface HueColor {
  angle: number;
  color: string;
  name: string;
}

export const HUE_COLORS: HueColor[] = [
  { angle: 0, color: '#FF0000', name: '红' },
  { angle: 30, color: '#FF8000', name: '橙' },
  { angle: 60, color: '#FFFF00', name: '黄' },
  { angle: 90, color: '#80FF00', name: '黄绿' },
  { angle: 120, color: '#00FF00', name: '绿' },
  { angle: 150, color: '#00FF80', name: '青绿' },
  { angle: 180, color: '#00FFFF', name: '青' },
  { angle: 210, color: '#0080FF', name: '青蓝' },
  { angle: 240, color: '#0000FF', name: '蓝' },
  { angle: 270, color: '#8000FF', name: '蓝紫' },
  { angle: 300, color: '#FF00FF', name: '紫' },
  { angle: 330, color: '#FF0080', name: '紫红' },
];

export type ConnectionType = 'complementary' | 'analogous' | 'triadic' | 'none';

export interface ColorWheelProps {
  size?: number;
  highlightColors?: string[];
  connectionType?: ConnectionType;
  onPress?: () => void;
}

/**
 * Validate hex color format
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to HSL and return hue angle (0-360)
 */
export function rgbToHue(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max === min) {
    h = 0; // achromatic
  } else {
    const d = max - min;
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return Math.round(h * 360);
}

/**
 * Convert hex color to hue angle
 */
export function hexToHue(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHue(r, g, b);
}

/**
 * Find the closest hue color angle on the wheel
 */
export function findClosestHueAngle(targetHue: number): number {
  let closest = HUE_COLORS[0];
  let minDiff = 360;

  for (const hueColor of HUE_COLORS) {
    const diff = Math.min(
      Math.abs(hueColor.angle - targetHue),
      360 - Math.abs(hueColor.angle - targetHue)
    );
    if (diff < minDiff) {
      minDiff = diff;
      closest = hueColor;
    }
  }

  return closest.angle;
}

/**
 * Calculate point position on circle given angle and radius
 */
function getPointOnCircle(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): { x: number; y: number } {
  // Convert to radians and adjust for SVG coordinate system (0 degrees at top)
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians),
  };
}

/**
 * Create arc path for analogous color connection
 */
function createArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = getPointOnCircle(centerX, centerY, radius, startAngle);
  const end = getPointOnCircle(centerX, centerY, radius, endAngle);

  // Determine if we need large arc flag
  let angleDiff = endAngle - startAngle;
  if (angleDiff < 0) angleDiff += 360;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

// Animated Pressable wrapper
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ColorWheel({
  size = 80,
  highlightColors = [],
  connectionType = 'none',
  onPress,
}: ColorWheelProps) {
  const scale = useSharedValue(1);

  // Press animation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(1.05, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  // Calculate viewBox and dimensions
  const viewBoxSize = 100;
  const center = viewBoxSize / 2;
  const outerRadius = 45;
  const innerRadius = 30;
  const highlightRadius = (outerRadius + innerRadius) / 2;
  const strokeWidth = outerRadius - innerRadius;

  // Map highlight colors to hue angles
  const highlightAngles = useMemo(() => {
    return highlightColors
      .filter((color) => color && isValidHex(color))
      .map((hex) => {
        const hue = hexToHue(hex);
        return findClosestHueAngle(hue);
      });
  }, [highlightColors]);

  // Generate arc segments for the color wheel
  const arcSegments = useMemo(() => {
    const segments: Array<{ d: string; color: string }> = [];
    const segmentAngle = 30; // 360 / 12

    for (let i = 0; i < HUE_COLORS.length; i++) {
      const startAngle = HUE_COLORS[i].angle - segmentAngle / 2;
      const endAngle = HUE_COLORS[i].angle + segmentAngle / 2;

      const start = getPointOnCircle(center, center, highlightRadius, startAngle);
      const end = getPointOnCircle(center, center, highlightRadius, endAngle);

      const d = `M ${start.x} ${start.y} A ${highlightRadius} ${highlightRadius} 0 0 1 ${end.x} ${end.y}`;
      segments.push({ d, color: HUE_COLORS[i].color });
    }

    return segments;
  }, []);

  // Generate connection lines based on type
  const connectionElements = useMemo(() => {
    if (connectionType === 'none' || highlightAngles.length < 2) {
      return null;
    }

    const elements: React.ReactNode[] = [];

    if (connectionType === 'complementary') {
      // Draw line between first two highlight points (diagonal)
      const point1 = getPointOnCircle(center, center, highlightRadius, highlightAngles[0]);
      const point2 = getPointOnCircle(center, center, highlightRadius, highlightAngles[1]);

      elements.push(
        <Line
          key="complementary-line"
          x1={point1.x}
          y1={point1.y}
          x2={point2.x}
          y2={point2.y}
          stroke={colors.primary}
          strokeWidth="2"
          strokeDasharray="4,2"
        />
      );
    } else if (connectionType === 'analogous') {
      // Draw arc between adjacent colors
      const sortedAngles = [...highlightAngles].sort((a, b) => a - b);
      if (sortedAngles.length >= 2) {
        const arcPath = createArcPath(
          center,
          center,
          highlightRadius - 5,
          sortedAngles[0],
          sortedAngles[sortedAngles.length - 1]
        );
        elements.push(
          <Path
            key="analogous-arc"
            d={arcPath}
            stroke={colors.primary}
            strokeWidth="2"
            fill="none"
            strokeDasharray="4,2"
          />
        );
      }
    } else if (connectionType === 'triadic') {
      // Draw triangle between three colors
      if (highlightAngles.length >= 3) {
        const points = highlightAngles.slice(0, 3).map((angle) =>
          getPointOnCircle(center, center, highlightRadius, angle)
        );
        const pathD = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} Z`;
        elements.push(
          <Path
            key="triadic-triangle"
            d={pathD}
            stroke={colors.primary}
            strokeWidth="2"
            fill={colors.primaryTransparent}
          />
        );
      }
    }

    return elements;
  }, [connectionType, highlightAngles]);

  // Generate highlight markers
  const highlightMarkers = useMemo(() => {
    return highlightAngles.map((angle, index) => {
      const point = getPointOnCircle(center, center, highlightRadius, angle);
      return (
        <G key={`highlight-${index}`}>
          {/* Outer ring */}
          <Circle
            cx={point.x}
            cy={point.y}
            r="6"
            fill={colors.gray5}
            stroke={colors.primary}
            strokeWidth="2"
          />
          {/* Inner dot */}
          <Circle
            cx={point.x}
            cy={point.y}
            r="3"
            fill={colors.primary}
          />
        </G>
      );
    });
  }, [highlightAngles]);

  return (
    <AnimatedPressable
      style={[styles.container, { width: size, height: size }, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="image"
      accessibilityLabel={`12色相环，高亮${highlightAngles.length}种颜色，${connectionType === 'none' ? '无连线' : connectionType === 'complementary' ? '补色连线' : connectionType === 'analogous' ? '邻近色弧线' : '三色三角形'}`}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        {/* Base circle (background) */}
        <Circle
          cx={center}
          cy={center}
          r={highlightRadius}
          fill="none"
          stroke={colors.divider}
          strokeWidth={strokeWidth}
        />

        {/* Color wheel segments */}
        {arcSegments.map((segment, index) => (
          <Path
            key={`segment-${index}`}
            d={segment.d}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />
        ))}

        {/* Connection lines/arcs */}
        {connectionElements}

        {/* Highlight markers */}
        {highlightMarkers}
      </Svg>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
