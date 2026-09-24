import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import type { QuickActionIconProps } from './types';

const HEART_PATH =
  'M32 53C12 40 6 28 10 20C14 11 27 10 32 20C37 10 50 11 54 20C58 28 52 40 32 53Z';

/** Decorative 3D-style glossy heart illustration; colors are intentionally fixed. */
export default function QuickActionHeartIcon({ size = 56 }: QuickActionIconProps) {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 64 64" width={size}>
      <Defs>
        <LinearGradient id="heartFace" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#FF95B5" />
          <Stop offset="1" stopColor="#E01B57" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="32" cy="58" fill="#000000" opacity={0.14} rx="18" ry="3" />
      <Path d={HEART_PATH} fill="#B3123F" translateY={4} />
      <Path d={HEART_PATH} fill="url(#heartFace)" />
      <Ellipse
        cx="19"
        cy="21"
        fill="#FFFFFF"
        opacity={0.5}
        origin="19, 21"
        rotation={-35}
        rx="5"
        ry="3"
      />
      <Circle cx="25" cy="16.5" fill="#FFFFFF" opacity={0.7} r="1.6" />
    </Svg>
  );
}
