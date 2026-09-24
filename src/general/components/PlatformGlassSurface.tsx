import React, { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassStyle,
} from 'expo-glass-effect';
import { useTheme } from '../theme/theme';

type Props = {
  children?: React.ReactNode;
  effectStyle?: GlassStyle;
  /**
   * Optional tint layered under the children. Glass adapts poorly to the content behind it, so
   * controls that float over photos use it to keep their icons legible on any backdrop.
   */
  scrimColor?: string;
  style?: StyleProp<ViewStyle>;
};

function canUseLiquidGlass() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

export default function PlatformGlassSurface({
  children,
  effectStyle = 'regular',
  scrimColor,
  style,
}: Props) {
  const { colors, isDark } = useTheme();
  const hasLiquidGlass = useMemo(canUseLiquidGlass, []);
  const [isReduceTransparencyEnabled, setIsReduceTransparencyEnabled] = useState<boolean | null>(
    Platform.OS === 'ios' ? null : false,
  );

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return undefined;
    }

    let isMounted = true;
    void AccessibilityInfo.isReduceTransparencyEnabled()
      .then((isEnabled) => {
        if (isMounted) {
          setIsReduceTransparencyEnabled(isEnabled);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsReduceTransparencyEnabled(true);
        }
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setIsReduceTransparencyEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const content = (
    <>
      {scrimColor ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor }]}
        />
      ) : null}
      {children}
    </>
  );

  if (hasLiquidGlass && isReduceTransparencyEnabled === false) {
    return (
      <GlassView
        colorScheme={isDark ? 'dark' : 'light'}
        glassEffectStyle={effectStyle}
        style={style}
      >
        {content}
      </GlassView>
    );
  }

  if (Platform.OS === 'ios' && isReduceTransparencyEnabled === false) {
    return (
      <BlurView
        intensity={isDark ? 64 : 70}
        tint={isDark ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}
        style={[{ backgroundColor: colors.glassSurface }, style]}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View style={[{ backgroundColor: colors.surfaceElevated }, style]}>
      {content}
    </View>
  );
}
