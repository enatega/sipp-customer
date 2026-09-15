import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../general/theme/theme';
import Icon from '../../../../../general/components/Icon';
import PlatformGlassSurface from '../../../../../general/components/PlatformGlassSurface';
import PressableScale from '../../../../../general/components/PressableScale';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';

type Props = {
  accessibilityLabel: string;
  active?: boolean;
  disabled?: boolean;
  iconName: string;
  iconType?: 'Ionicons' | 'Feather' | 'MaterialIcons';
  isLoading?: boolean;
  onPress?: () => void;
};

export default function StoreDetailActionButton({
  accessibilityLabel,
  active = false,
  disabled = false,
  iconName,
  iconType = 'Ionicons',
  isLoading = false,
  onPress,
}: Props) {
  const { colors, layout, shape } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const selectionScale = useRef(new Animated.Value(1)).current;
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (isReducedMotionEnabled) {
      selectionScale.setValue(1);
      return;
    }

    Animated.sequence([
      Animated.timing(selectionScale, {
        duration: 60,
        toValue: 0.94,
        useNativeDriver: true,
      }),
      Animated.spring(selectionScale, {
        damping: 12,
        mass: 0.7,
        stiffness: 300,
        toValue: 1.06,
        useNativeDriver: true,
      }),
      Animated.spring(selectionScale, {
        damping: 17,
        mass: 0.8,
        stiffness: 280,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, isReducedMotionEnabled, selectionScale]);

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading, selected: active }}
      disabled={disabled || isLoading}
      hitSlop={10}
      onPress={onPress}
      style={[styles.pressable, { borderRadius: shape.radius.pill }]}
    >
      <PlatformGlassSurface
        effectStyle="clear"
        style={[
          styles.button,
          {
            borderRadius: shape.radius.pill,
            height: layout.touchTarget.minimum,
            width: layout.touchTarget.minimum,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={active ? colors.danger : colors.textStrong} size="small" />
        ) : (
          <Animated.View style={{ transform: [{ scale: selectionScale }] }}>
            <Icon
              color={active ? colors.danger : colors.textStrong}
              name={iconName}
              size={21}
              type={iconType}
            />
          </Animated.View>
        )}
      </PlatformGlassSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: {
    overflow: 'hidden',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
