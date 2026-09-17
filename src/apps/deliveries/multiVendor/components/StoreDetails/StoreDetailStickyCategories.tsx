import React, { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import StoreDetailTabs from './StoreDetailTabs';

type Props = {
  activeCategoryId: string | null;
  categories: DeliveryStoreDetailsFilterItem[];
  onLayout?: (event: LayoutChangeEvent) => void;
  onSelect: (categoryId: string | null) => void;
  revealOffset: number;
  scrollY: SharedValue<number>;
  top: number;
};

export default function StoreDetailStickyCategories({
  activeCategoryId,
  categories,
  onLayout,
  onSelect,
  revealOffset,
  scrollY,
  top,
}: Props) {
  const { colors, layout } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const [isInteractive, setIsInteractive] = useState(false);
  const isReady = Number.isFinite(revealOffset);

  useAnimatedReaction(
    () => isReady && scrollY.value >= revealOffset,
    (nextValue, previousValue) => {
      if (nextValue !== previousValue) {
        runOnJS(setIsInteractive)(nextValue);
      }
    },
    [isReady, revealOffset],
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (!isReady) {
      return { opacity: 0, transform: [{ translateY: -6 }] };
    }

    if (isReducedMotionEnabled) {
      return {
        opacity: scrollY.value >= revealOffset ? 1 : 0,
        transform: [{ translateY: 0 }],
      };
    }

    const progress = interpolate(
      scrollY.value,
      [revealOffset - 10, revealOffset + 10],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: progress,
      transform: [{ translateY: -6 * (1 - progress) }],
    };
  }, [isReady, isReducedMotionEnabled, revealOffset]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <Animated.View
      accessibilityElementsHidden={!isInteractive}
      importantForAccessibility={isInteractive ? 'auto' : 'no-hide-descendants'}
      onLayout={onLayout}
      pointerEvents={isInteractive ? 'auto' : 'none'}
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: colors.canvas,
          borderBottomColor: colors.divider,
          top,
          zIndex: layout.layer.navigation - 1,
        },
      ]}
    >
      <View style={styles.tabs}>
        <StoreDetailTabs
          activeCategoryId={activeCategoryId}
          categories={categories}
          onSelect={onSelect}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  tabs: {
    width: '100%',
  },
});
