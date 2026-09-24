import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Image from '../../../../../general/components/Image';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../../general/theme/theme';

type Props = {
  imageUrl: string | null;
  isActive: boolean;
  isLoading: boolean;
  label: string;
  onPress: () => void;
};

export default function StoreDetailTabItem({
  imageUrl,
  isActive,
  isLoading,
  label,
  onPress,
}: Props) {
  const { colors, layout, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const activeProgress = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    activeProgress.value = isReducedMotionEnabled
      ? isActive ? 1 : 0
      : withSpring(isActive ? 1 : 0, motion.spring.responsive);
  }, [activeProgress, isActive, isReducedMotionEnabled, motion.spring.responsive]);

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      [colors.surfaceElevated, colors.primary],
    ),
    borderColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      [colors.divider, colors.primary],
    ),
    transform: [{ scale: 1 + activeProgress.value * 0.015 }],
  }));

  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityState={{ busy: isLoading, selected: isActive }}
      disabled={isLoading}
      onPress={onPress}
      style={[
        styles.tab,
        {
          borderRadius: shape.radius.pill,
          minHeight: layout.touchTarget.minimum,
          marginRight: spacing.sm,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.tabSurface,
          animatedSurfaceStyle,
          {
            borderRadius: shape.radius.pill,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            color={isActive ? colors.onPrimary : colors.primary}
            size="small"
          />
        ) : imageUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            resizeMode="cover"
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                backgroundColor: colors.surfaceSunken,
                borderRadius: shape.radius.pill,
              },
            ]}
          />
        ) : null}
        <Text
          color={isActive ? colors.onPrimary : colors.textSubtle}
          variant="label"
          weight={isActive ? 'bold' : 'semiBold'}
        >
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSurface: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 38,
  },
  image: {
    height: 26,
    width: 26,
  },
});
