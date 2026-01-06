/**
 * BriefcaseIcon - 商务会议场合图标
 * SF Symbols equivalent: briefcase.fill
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BriefcaseIconProps {
  size?: number;
  color?: string;
}

export function BriefcaseIcon({ size = 20, color = '#6C63FF' }: BriefcaseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z" />
    </Svg>
  );
}
