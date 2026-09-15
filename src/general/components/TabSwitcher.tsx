import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle, View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../theme/theme';
import Text from './Text';

type Tab = {
  key: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

type TabOptionProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

function TabOption({ isActive, label, onPress }: TabOptionProps) {
  const { colors, elevation, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const emphasis = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      emphasis.setValue(isActive ? 1 : 0);
      return;
    }

    Animated.timing(emphasis, {
      toValue: isActive ? 1 : 0,
      duration: motion.duration.quick,
      useNativeDriver: true,
    }).start();
  }, [emphasis, isActive, isReducedMotionEnabled, motion.duration.quick]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      android_ripple={Platform.OS === 'android'
        ? { borderless: false, color: colors.statePressed, foreground: true }
        : undefined}
      onPress={onPress}
      style={[styles.tabPressable, { borderRadius: shape.radius.control }]}
    >
      <Animated.View
        style={[
          styles.tab,
          isActive ? elevation.raised : null,
          {
            backgroundColor: isActive ? colors.surfaceElevated : 'transparent',
            borderRadius: shape.radius.control,
            paddingHorizontal: spacing.md,
            transform: [
              { translateY: emphasis.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
            ],
          },
        ]}
      >
        <Text
          variant="label"
          weight={isActive ? 'semiBold' : 'medium'}
          color={isActive ? colors.primary : colors.textSubtle}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function TabSwitcher({ tabs, activeKey, onChange, style }: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSunken,
          borderRadius: shape.radius.surface,
          gap: spacing.xs,
          padding: spacing.xs,
        },
        style,
      ]}
    >
      {tabs.map((tab) => (
        <TabOption
          key={tab.key}
          isActive={tab.key === activeKey}
          label={tab.label}
          onPress={() => onChange(tab.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tabPressable: {
    flex: 1,
    overflow: 'hidden',
  },
});
