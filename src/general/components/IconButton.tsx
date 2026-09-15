import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../theme/theme';

type Props = {
  icon: React.ReactNode;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'plain' | 'soft' | 'outlined';
};

export default function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  selected = false,
  style,
  variant = 'soft',
}: Props) {
  const { colors, layout, motion, shape } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const backgroundColor = selected
    ? colors.primarySoft
    : variant === 'plain'
      ? 'transparent'
      : colors.surfaceSunken;

  const animate = (toValue: number) => {
    if (isReducedMotionEnabled) {
      scale.setValue(1);
      return;
    }

    Animated.timing(scale, {
      toValue,
      duration: motion.duration.quick,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      android_ripple={Platform.OS === 'android'
        ? { borderless: false, color: colors.statePressed, foreground: true }
        : undefined}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      onPressIn={() => animate(motion.scale.pressed)}
      onPressOut={() => animate(1)}
      style={[
        styles.pressable,
        {
          borderRadius: shape.radius.pill,
          height: layout.touchTarget.minimum,
          width: layout.touchTarget.minimum,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          {
            backgroundColor,
            borderColor: variant === 'outlined' ? colors.border : 'transparent',
            borderRadius: shape.radius.pill,
            borderWidth: variant === 'outlined' ? shape.borderWidth.hairline : 0,
            height: layout.touchTarget.minimum,
            opacity: disabled ? motion.opacity.disabled : 1,
            transform: [{ scale }],
            width: layout.touchTarget.minimum,
          },
          style,
        ]}
      >
        {icon}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
