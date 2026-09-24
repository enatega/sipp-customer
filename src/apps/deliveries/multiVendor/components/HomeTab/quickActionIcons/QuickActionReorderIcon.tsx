import React from 'react';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import type { QuickActionIconProps } from './types';

/** Decorative 3D-style shopping bag with a reorder arrow; colors are intentionally fixed. */
export default function QuickActionReorderIcon({ size = 56 }: QuickActionIconProps) {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 64 64" width={size}>
      <Defs>
        <LinearGradient id="reorderBag" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#7BE3B4" />
          <Stop offset="1" stopColor="#22A06B" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="32" cy="58" fill="#000000" opacity={0.14} rx="21" ry="3" />
      <Path
        d="M23 26V21a9 9 0 0 1 18 0V26"
        fill="none"
        stroke="#167A50"
        strokeLinecap="round"
        strokeWidth="3.6"
      />
      <Path d="M13 24H51L54 51a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5Z" fill="#177A50" translateY={3} />
      <Path d="M13 24H51L54 50a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5Z" fill="url(#reorderBag)" />
      <Path d="M15 27H49" opacity={0.4} stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2" />
      <Path
        d="M39 37A8 8 0 1 1 32 32"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
      <Path d="M31.5 27.6L37.5 32L31.5 36.4Z" fill="#FFFFFF" />
    </Svg>
  );
}
