import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { QuickActionIconProps } from './types';

const SCALLOPS = [
  { cx: 10.33, fill: '#E23D3D' },
  { cx: 19, fill: '#FFF0F0' },
  { cx: 27.67, fill: '#E23D3D' },
  { cx: 36.33, fill: '#FFF0F0' },
  { cx: 45, fill: '#E23D3D' },
  { cx: 53.67, fill: '#FFF0F0' },
] as const;

/** Decorative 3D-style storefront illustration; colors are intentionally fixed. */
export default function QuickActionStoreIcon({ size = 56 }: QuickActionIconProps) {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 64 64" width={size}>
      <Defs>
        <LinearGradient id="storeBody" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#C6DBF2" />
        </LinearGradient>
        <LinearGradient id="storeAwning" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#FF8A8A" />
          <Stop offset="1" stopColor="#E23D3D" />
        </LinearGradient>
        <LinearGradient id="storeStripe" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#FFE4E4" />
        </LinearGradient>
        <LinearGradient id="storeDoor" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#5B9BFF" />
          <Stop offset="1" stopColor="#2758CF" />
        </LinearGradient>
        <LinearGradient id="storeWindow" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#D6ECFF" />
          <Stop offset="1" stopColor="#6BAEF2" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="32" cy="58" fill="#000000" opacity={0.14} rx="21" ry="3" />
      <Path d="M10 31H54V52a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" fill="#9DBBDD" />
      <Path d="M10 30H54V51a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" fill="url(#storeBody)" />
      <Rect fill="url(#storeDoor)" height="17" rx="2" width="14" x="25" y="38" />
      <Circle cx="36" cy="47.5" fill="#FFFFFF" r="1.2" />
      <Rect fill="url(#storeWindow)" height="9" rx="2" width="9" x="13.5" y="37" />
      <Rect fill="url(#storeWindow)" height="9" rx="2" width="9" x="41.5" y="37" />
      <Path d="M15.5 39.5l4-1.5" opacity={0.8} stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.6" />
      <Path d="M43.5 39.5l4-1.5" opacity={0.8} stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.6" />
      <Path d="M12 14H52L58 31H6Z" fill="#B82B2B" />
      <Path d="M12 12H52L58 28H6Z" fill="url(#storeAwning)" />
      <Path d="M18.67 12H25.33L23.33 28H14.67Z" fill="url(#storeStripe)" />
      <Path d="M32 12H38.67L40.67 28H32Z" fill="url(#storeStripe)" />
      <Path d="M45.33 12H52L58 28H49.33Z" fill="url(#storeStripe)" />
      {SCALLOPS.map((scallop) => (
        <Circle cx={scallop.cx} cy="28" fill={scallop.fill} key={scallop.cx} r="4.33" />
      ))}
      <Rect fill="#F25555" height="6" rx="3" width="46" x="9" y="8" />
      <Rect fill="#FFFFFF" height="1.8" opacity={0.45} rx="0.9" width="20" x="11" y="9.2" />
    </Svg>
  );
}
