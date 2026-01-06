/**
 * HeartIcon - 浪漫约会场合图标
 * SF Symbols equivalent: heart.fill
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HeartIconProps {
  size?: number;
  color?: string;
}

export function HeartIcon({ size = 20, color = '#6C63FF' }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </Svg>
  );
}
