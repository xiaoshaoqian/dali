/**
 * BuildingIcon - 职场通勤场合图标
 * SF Symbols equivalent: building.2.fill
 */
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface BuildingIconProps {
  size?: number;
  color?: string;
}

export function BuildingIcon({ size = 20, color = '#6C63FF' }: BuildingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M15 11V5.83c0-.53-.21-1.04-.59-1.41L12.7 2.71a.996.996 0 0 0-1.41 0l-1.7 1.7C9.21 4.79 9 5.3 9 5.83V7H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2h-4z" />
      <Rect x="6" y="10" width="2" height="2" fill="white" />
      <Rect x="6" y="14" width="2" height="2" fill="white" />
      <Rect x="11" y="6" width="2" height="2" fill="white" />
      <Rect x="11" y="10" width="2" height="2" fill="white" />
      <Rect x="11" y="14" width="2" height="2" fill="white" />
      <Rect x="16" y="14" width="2" height="2" fill="white" />
    </Svg>
  );
}
