import React, { ReactNode, useRef } from 'react';
import { ActivityIndicator, Animated, ColorValue, Platform, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import Text from './Text';
import { useTheme } from '../theme/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: ReactNode
  disabled?: boolean
  isLoading?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  size?: 'compact' | 'default' | 'large';
  fullWidth?: boolean;
  accessibilityLabel?: string;
};

function parseColorToRgb(color?: ColorValue | null) {
  if (!color || typeof color !== 'string' || color === 'transparent') {
    return null;
  }

  const normalizedColor = color.trim();

  if (normalizedColor.startsWith('#')) {
    const hex = normalizedColor.slice(1);

    if (hex.length === 3) {
      return {
        r: Number.parseInt(`${hex[0]}${hex[0]}`, 16),
        g: Number.parseInt(`${hex[1]}${hex[1]}`, 16),
        b: Number.parseInt(`${hex[2]}${hex[2]}`, 16),
      };
    }

    if (hex.length === 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  const rgbMatch = normalizedColor.match(/rgba?\(([^)]+)\)/i);

  if (!rgbMatch) {
    return null;
  }

  const [r, g, b] = rgbMatch[1]
    .split(',')
    .slice(0, 3)
    .map((value) => Number.parseFloat(value.trim()));

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { r, g, b };
}

function isLightColor(color?: ColorValue | null) {
  const rgb = parseColorToRgb(color);

  if (!rgb) {
    return false;
  }

  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const luminance = (0.2126 * toLinear(rgb.r)) + (0.7152 * toLinear(rgb.g)) + (0.0722 * toLinear(rgb.b));
  return luminance > 0.45;
}

export default function Button({
  label,
  onPress,
  style,
  variant = 'primary',
  icon,
  isLoading = false,
  disabled = false,
  labelStyle,
  size = 'default',
  fullWidth = false,
  accessibilityLabel,
}: Props) {
  const { colors, layout, motion, shape, spacing, typography } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const pressScale = useRef(new Animated.Value(1)).current;
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isDisabled = disabled || isLoading;
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const baseBackgroundColor = disabled ? colors.backgroundTertiary : isGhost
    ? 'transparent'
    : isDanger
      ? colors.danger
      : isSecondary
        ? colors.surface
        : colors.primary;
  const resolvedBackgroundColor = flattenedStyle.backgroundColor ?? baseBackgroundColor;
  const contentColor = isGhost
    ? colors.primary
    : isDisabled && isLightColor(resolvedBackgroundColor)
      ? colors.mutedText
      : isSecondary
        ? colors.text
        : isLightColor(resolvedBackgroundColor)
          ? colors.onLight
        : colors.white;

  const animatePress = (toValue: number) => {
    if (isReducedMotionEnabled) {
      pressScale.setValue(1);
      return;
    }

    Animated.timing(pressScale, {
      toValue,
      duration: motion.duration.quick,
      useNativeDriver: true,
    }).start();
  };

  const minHeight = size === 'compact'
    ? layout.touchTarget.minimum
    : size === 'large'
      ? 56
      : layout.touchTarget.comfortable;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animatePress(motion.scale.pressed)}
      onPressOut={() => animatePress(1)}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      android_ripple={Platform.OS === 'android'
        ? { borderless: false, color: colors.statePressed, foreground: true }
        : undefined}
      style={[
        { borderRadius: shape.radius.control },
        styles.pressable,
        fullWidth ? styles.fullWidth : null,
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          {
            backgroundColor: baseBackgroundColor,
            borderColor: isGhost ? 'transparent' : colors.border,
            borderRadius: shape.radius.control,
            minHeight,
            opacity: isDisabled ? motion.opacity.disabled : 1,
            paddingHorizontal: size === 'compact' ? spacing.md : spacing.xl,
            transform: [{ scale: pressScale }],
          },
          fullWidth ? styles.fullWidth : null,
          style,
        ]}
      >
        <View style={[styles.content, { gap: spacing.sm }]}>
          {isLoading ? <ActivityIndicator size="small" color={contentColor} /> : null}
          {icon && icon}
          <Text
            variant="button"
            weight="semiBold"
            color={contentColor}
            style={[{ fontFamily: typography.fontFamily.semiBold }, labelStyle]}
          >
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressable: {
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
