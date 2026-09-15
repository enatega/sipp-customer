import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import { STORE_DETAIL_HEADER_COLLAPSE_START } from './StoreDetailNavigationHeader';

type Props = {
  fillColor: string;
  scrollY?: SharedValue<number>;
};

export default function StoreDetailHeroCurve({ fillColor, scrollY }: Props) {
  const fallbackScrollY = useSharedValue(0);
  const activeScrollY = scrollY ?? fallbackScrollY;
  const isReducedMotionEnabled = useReducedMotion();

  const curveStyle = useAnimatedStyle(() => {
    if (isReducedMotionEnabled) {
      return { transform: [{ translateY: 0 }] };
    }

    const progress = interpolate(
      activeScrollY.value,
      [0, STORE_DETAIL_HEADER_COLLAPSE_START],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return { transform: [{ translateY: progress * 3 }] };
  }, [isReducedMotionEnabled]);

  return (
    <Animated.View pointerEvents="none" style={[styles.curve, curveStyle]}>
      <Svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 40" width="100%">
        <Path
          d="M0 7 C18 13 25 31 50 33 C72 35 89 25 100 4 L100 40 L0 40 Z"
          fill={fillColor}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  curve: {
    bottom: -1,
    height: 40,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
