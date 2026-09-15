import React, { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
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

  if (hasLiquidGlass && isReduceTransparencyEnabled === false) {
    return (
      <GlassView
        colorScheme={isDark ? 'dark' : 'light'}
        glassEffectStyle={effectStyle}
        style={style}
      >
        {children}
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
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[{ backgroundColor: colors.surfaceElevated }, style]}>
      {children}
    </View>
  );
}
