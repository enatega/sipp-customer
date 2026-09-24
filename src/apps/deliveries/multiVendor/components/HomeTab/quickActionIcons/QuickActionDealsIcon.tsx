import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import type { QuickActionIconProps } from './types';

const TAG_PATH = 'M6 32L20 13H52a5 5 0 0 1 5 5V46a5 5 0 0 1-5 5H20Z';

/** Decorative 3D-style discount tag illustration; colors are intentionally fixed. */
export default function QuickActionDealsIcon({ size = 56 }: QuickActionIconProps) {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 64 64" width={size}>
      <Defs>
        <LinearGradient id="dealsFace" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#FF9CC0" />
          <Stop offset="1" stopColor="#E23F7C" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="32" cy="58" fill="#000000" opacity={0.14} rx="20" ry="3" />
      <G origin="32, 32" rotation={-18}>
        <Path d={TAG_PATH} fill="#B02A5C" translateY={4} />
        <Path d={TAG_PATH} fill="url(#dealsFace)" />
        <Path d="M22 16H51" opacity={0.4} stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2" />
        <Circle cx="20" cy="32" fill="#B02A5C" r="3.6" />
        <Circle cx="20" cy="31.4" fill="#FFFFFF" r="3.6" />
        <Circle cx="20" cy="31.4" fill="#F3C1D5" r="2" />
        <Circle cx="36.5" cy="26" fill="none" r="4" stroke="#FFFFFF" strokeWidth="3.2" />
        <Circle cx="47.5" cy="38" fill="none" r="4" stroke="#FFFFFF" strokeWidth="3.2" />
        <Path d="M49 22.5L35 41.5" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3.6" />
      </G>
    </Svg>
  );
}
