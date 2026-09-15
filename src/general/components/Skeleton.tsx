import React, { useEffect, useRef } from 'react';
import { ViewStyle, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  borderRadius?: ViewStyle['borderRadius'];
  style?: ViewStyle;
  children?: React.ReactNode;
};

export default function Skeleton({ width, height, borderRadius, style, children }: Props) {
  const { colors, motion, shape } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      opacity.setValue(motion.opacity.subtle);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.86,
          duration: motion.duration.deliberate * 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: motion.duration.deliberate * 2,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [isReducedMotionEnabled, motion.duration.deliberate, motion.opacity.subtle, opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: borderRadius ?? shape.radius.sm,
          backgroundColor: colors.surfaceSunken,
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
