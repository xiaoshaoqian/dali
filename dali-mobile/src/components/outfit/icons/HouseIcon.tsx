/**
 * HouseIcon - 居家休闲场合图标
 * SF Symbols equivalent: house.fill
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HouseIconProps {
  size?: number;
  color?: string;
}

export function HouseIcon({ size = 20, color = '#6C63FF' }: HouseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </Svg>
  );
}
