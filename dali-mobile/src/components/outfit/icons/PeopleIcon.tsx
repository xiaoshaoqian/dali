/**
 * PeopleIcon - 朋友聚会场合图标
 * SF Symbols equivalent: person.3.fill
 */
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface PeopleIconProps {
  size?: number;
  color?: string;
}

export function PeopleIcon({ size = 20, color = '#6C63FF' }: PeopleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {/* Center person */}
      <Circle cx="12" cy="6" r="3" />
      <Path d="M12 11c-3.31 0-6 2.01-6 4.5V17h12v-1.5c0-2.49-2.69-4.5-6-4.5z" />
      {/* Left person */}
      <Circle cx="5" cy="8" r="2" />
      <Path d="M5 12c-2.21 0-4 1.34-4 3v1h4v-1.5c0-1.03.33-1.98.89-2.79-.29-.14-.58-.28-.89-.41-.33-.16-.67-.3-1-.3z" opacity="0.6" />
      {/* Right person */}
      <Circle cx="19" cy="8" r="2" />
      <Path d="M19 12c.33 0 .67.14 1 .3.31.13.6.27.89.41.56.81.89 1.76.89 2.79V17h-4v-1c0-1.66-1.79-3-4-3z" opacity="0.6" />
    </Svg>
  );
}
