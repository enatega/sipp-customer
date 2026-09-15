import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
};

export default function HomeEntrance({ children, index = 0, style }: Props) {
  const { motion } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const progress = useRef(new Animated.Value(isReducedMotionEnabled ? 1 : 0)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      progress.setValue(1);
      return;
    }

    Animated.timing(progress, {
      delay: Math.min(index, 2) * 70,
      duration: motion.duration.standard,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [index, isReducedMotionEnabled, motion.duration.standard, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [motion.distance.medium, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
