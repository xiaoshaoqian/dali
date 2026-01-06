/**
 * CoffeeIcon - 日常出行场合图标
 * SF Symbols equivalent: cup.and.saucer.fill
 */
import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface CoffeeIconProps {
  size?: number;
  color?: string;
}

export function CoffeeIcon({ size = 20, color = '#6C63FF' }: CoffeeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {/* Cup */}
      <Path d="M18 9h-1V6H7v3H6c-1.1 0-2 .9-2 2v1c0 1.63 1.04 3.02 2.5 3.54.57 1.44 1.97 2.46 3.62 2.46h3.76c1.65 0 3.05-1.02 3.62-2.46C18.96 15.02 20 13.63 20 12v-1c0-1.1-.9-2-2-2zm0 3c0 .55-.45 1-1 1v-2h1v1z" />
      {/* Saucer */}
      <Ellipse cx="12" cy="20" rx="7" ry="2" />
    </Svg>
  );
}
