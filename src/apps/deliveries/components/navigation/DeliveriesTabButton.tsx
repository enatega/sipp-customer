import React, { useEffect, useRef } from 'react';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../general/theme/theme';

type Props = BottomTabBarButtonProps;

export default function DeliveriesTabButton({
  accessibilityLabel,
  accessibilityState,
  children,
  onLongPress,
  onPress,
  testID,
}: Props) {
  const { colors, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const isSelected = accessibilityState?.selected ?? false;
  const selection = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      selection.setValue(isSelected ? 1 : 0);
      return;
    }

    Animated.timing(selection, {
      toValue: isSelected ? 1 : 0,
      duration: motion.duration.quick,
      useNativeDriver: true,
    }).start();
  }, [isReducedMotionEnabled, isSelected, motion.duration.quick, selection]);

  const animatePress = (toValue: number) => {
    if (isReducedMotionEnabled) {
      pressScale.setValue(1);
      return;
    }

    Animated.timing(pressScale, {
      toValue,
      duration: motion.duration.instant,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      android_ripple={Platform.OS === 'android'
        ? { borderless: false, color: colors.statePressed, foreground: true }
        : undefined}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => animatePress(motion.scale.pressed)}
      onPressOut={() => animatePress(1)}
      style={[
        styles.button,
        {
          borderRadius: shape.radius.pill,
          marginHorizontal: spacing.sm,
          marginVertical: spacing.md,
        },
      ]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.content,
          {
            borderRadius: shape.radius.pill,
            transform: [{ scale: pressScale }],
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selection,
            {
              backgroundColor: colors.statePressed,
              borderColor: Platform.OS === 'ios' ? colors.glassBorder : colors.divider,
              borderRadius: shape.radius.pill,
              borderWidth: StyleSheet.hairlineWidth,
              opacity: selection,
              transform: [
                {
                  scaleX: selection.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.58, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.foreground,
            {
              transform: [
                {
                  translateY: selection.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2],
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  foreground: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selection: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
