import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

export default function PressableScale({
  children,
  disabled = false,
  onPressIn,
  onPressOut,
  pressedScale,
  style,
  ...props
}: Props) {
  const { colors, motion } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const flattenedStyle = StyleSheet.flatten(style);
  const hasRoundedBoundary = [
    flattenedStyle?.borderRadius,
    flattenedStyle?.borderTopLeftRadius,
    flattenedStyle?.borderTopRightRadius,
    flattenedStyle?.borderBottomLeftRadius,
    flattenedStyle?.borderBottomRightRadius,
  ].some((radius) => typeof radius === 'number' && radius > 0);
  const shouldRenderAndroidStateLayer = Platform.OS === 'android' && hasRoundedBoundary;
  const androidStateLayerShape: ViewStyle = {
    borderRadius: flattenedStyle?.borderRadius,
    borderTopLeftRadius: flattenedStyle?.borderTopLeftRadius,
    borderTopRightRadius: flattenedStyle?.borderTopRightRadius,
    borderBottomLeftRadius: flattenedStyle?.borderBottomLeftRadius,
    borderBottomRightRadius: flattenedStyle?.borderBottomRightRadius,
  };

  const animate = (toValue: number) => {
    if (isReducedMotionEnabled) {
      scale.setValue(1);
      return;
    }

    Animated.spring(scale, {
      toValue,
      damping: motion.spring.responsive.damping,
      stiffness: motion.spring.responsive.stiffness,
      mass: motion.spring.responsive.mass,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      android_ripple={undefined}
      onPressIn={(event) => {
        animate(pressedScale ?? motion.scale.pressed);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      style={[
        style,
        {
          opacity: disabled ? motion.opacity.disabled : 1,
          transform: [{ scale }],
        },
      ]}
    >
      {({ pressed }) => (
        <>
          {children}
          {shouldRenderAndroidStateLayer ? (
            <View
              pointerEvents="none"
              style={[
                styles.androidStateLayer,
                androidStateLayerShape,
                {
                  backgroundColor: colors.statePressed,
                  opacity: pressed ? 1 : 0,
                },
              ]}
            />
          ) : null}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  androidStateLayer: StyleSheet.absoluteFillObject,
});
