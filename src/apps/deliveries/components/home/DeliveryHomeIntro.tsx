import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

const SEARCH_SCROLL_DISTANCE = 112;

type Props = {
  isReducedMotionEnabled: boolean;
  onSearchPress: () => void;
  scrollY: SharedValue<number>;
};

export default function DeliveryHomeIntro({
  isReducedMotionEnabled,
  onSearchPress,
  scrollY,
}: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, layout, shape, spacing } = useTheme();
  const { gutter, width } = useWindowClass();
  const searchWidth = Math.min(
    width - gutter * 2,
    layout.contentMaxWidth.readable,
  );

  const searchMotionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SEARCH_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: isReducedMotionEnabled ? 1 : 1 - progress * 0.1,
      transform: [
        {
          translateY: isReducedMotionEnabled ? 0 : -progress * spacing.xs,
        },
        {
          scale: isReducedMotionEnabled ? 1 : 1 - progress * 0.018,
        },
      ],
    };
  }, [isReducedMotionEnabled, spacing.xs]);

  const searchIconMotionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SEARCH_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: isReducedMotionEnabled ? 0 : progress * spacing.xs },
        { scale: isReducedMotionEnabled ? 1 : 1 - progress * 0.06 },
      ],
    };
  }, [isReducedMotionEnabled, spacing.xs]);

  const filterMotionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SEARCH_SCROLL_DISTANCE * 0.72],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: isReducedMotionEnabled ? 1 : 1 - progress * 0.24,
      transform: [
        { rotate: `${isReducedMotionEnabled ? 0 : progress * 4}deg` },
        { scale: isReducedMotionEnabled ? 1 : 1 - progress * 0.06 },
      ],
    };
  }, [isReducedMotionEnabled]);

  const sheenMotionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SEARCH_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: isReducedMotionEnabled
        ? 0
        : interpolate(
          progress,
          [0, 0.28, 0.72, 1],
          [0, 0.24, 0.14, 0],
          Extrapolation.CLAMP,
        ),
      transform: [
        {
          translateX: interpolate(
            progress,
            [0, 1],
            [-96, searchWidth + 96],
            Extrapolation.CLAMP,
          ),
        },
        { rotate: '12deg' },
      ],
    };
  }, [isReducedMotionEnabled, searchWidth]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: spacing.sm,
          paddingHorizontal: gutter,
          paddingTop: spacing.sm,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.searchMotion,
          searchMotionStyle,
          { maxWidth: layout.contentMaxWidth.readable },
        ]}
      >
        <PressableScale
          accessibilityLabel={t('delivery_home_search_placeholder')}
          accessibilityRole="button"
          onPress={onSearchPress}
          pressedScale={0.985}
          style={[
            styles.search,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderRadius: shape.radius.pill,
              gap: spacing.sm,
              paddingHorizontal: spacing.sm,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.searchClip,
              { borderRadius: shape.radius.pill },
            ]}
          >
            <Animated.View style={[styles.sheen, sheenMotionStyle]}>
              <LinearGradient
                colors={[
                  colors.surfaceElevated,
                  colors.primarySoft,
                  colors.surfaceElevated,
                ]}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.searchIcon,
              searchIconMotionStyle,
              {
                borderRadius: shape.radius.pill,
              },
            ]}
          >
            <MaterialCommunityIcons color={colors.primary} name="magnify" size={22} />
          </Animated.View>
          <Text color={colors.textSubtle} numberOfLines={1} style={styles.searchCopy} variant="body">
            {t('delivery_home_search_placeholder')}
          </Text>
          <Animated.View
            style={[
              styles.filterButton,
              filterMotionStyle,
              {
                backgroundColor: colors.primary,
                borderRadius: shape.radius.pill,
              },
            ]}
          >
            <MaterialCommunityIcons color={colors.onPrimary} name="tune-variant" size={19} />
          </Animated.View>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  search: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 48,
    width: '100%',
  },
  searchClip: {
    overflow: 'hidden',
  },
  searchCopy: {
    flex: 1,
  },
  searchIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  searchMotion: {
    alignSelf: 'center',
    width: '100%',
  },
  sheen: {
    bottom: -24,
    position: 'absolute',
    top: -24,
    width: 72,
  },
  filterButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
