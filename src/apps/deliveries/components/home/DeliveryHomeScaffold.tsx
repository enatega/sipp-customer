import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../general/theme/theme';
import MultiVendorAddressHeader from '../MultiVendorAddressHeader';
import DeliveryHomeIntro from './DeliveryHomeIntro';
import HomeEntrance from './HomeEntrance';

const REGULAR_HEADER_HEIGHT = 64;
const COMPACT_HEADER_HEIGHT = 56;
const INITIAL_ATMOSPHERE_BODY_HEIGHT = 64;
const COLLAPSE_DISTANCE = 120;

type AddressHeaderProps = ComponentProps<typeof MultiVendorAddressHeader>;
type RefreshElement = ReactElement<ComponentProps<typeof RefreshControl>>;

type Props = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerProps: AddressHeaderProps;
  onSearchPress: () => void;
  refreshControl?: RefreshElement;
};

export default function DeliveryHomeScaffold({
  children,
  contentContainerStyle,
  headerProps,
  onSearchPress,
  refreshControl,
}: Props) {
  const { colors, motion, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isReducedMotionEnabled = useReducedMotion();
  const [introHeight, setIntroHeight] = useState(INITIAL_ATMOSPHERE_BODY_HEIGHT);
  const scrollY = useSharedValue(0);
  const headerHeight = headerProps.addressVariant === 'label'
    ? COMPACT_HEADER_HEIGHT
    : REGULAR_HEADER_HEIGHT;
  const headerOffset = insets.top + headerHeight;

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = Math.max(0, event.contentOffset.y);
    },
  });

  const atmosphereStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE * 1.6],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: 1 - progress * 0.72,
      transform: [
        {
          translateY: isReducedMotionEnabled
            ? 0
            : -progress * motion.distance.medium * 3,
        },
      ],
    };
  }, [isReducedMotionEnabled, motion.distance.medium]);

  const headerBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [motion.distance.medium, COLLAPSE_DISTANCE * 0.72],
      [0, 0.97],
      Extrapolation.CLAMP,
    ),
  }), [motion.distance.medium]);

  const headerContentStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        {
          translateY: isReducedMotionEnabled
            ? 0
            : -progress * motion.distance.press,
        },
      ],
    };
  }, [isReducedMotionEnabled, motion.distance.press]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.atmosphere,
          atmosphereStyle,
          { height: headerOffset + introHeight },
        ]}
      >
        <LinearGradient
          colors={[
            colors.surfaceElevated,
            colors.primarySoft,
            colors.background,
          ]}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.58, 1]}
          start={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
          {
            gap: spacing.section.compact,
            paddingBottom: tabBarHeight + insets.bottom + spacing.lg,
            paddingTop: headerOffset,
          },
        ]}
        onScroll={handleScroll}
        refreshControl={refreshControl}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          onLayout={(event) => {
            const measuredHeight = Math.ceil(event.nativeEvent.layout.height);
            setIntroHeight((currentHeight) => (
              currentHeight === measuredHeight ? currentHeight : measuredHeight
            ));
          }}
        >
          <HomeEntrance index={0}>
            <DeliveryHomeIntro
              isReducedMotionEnabled={isReducedMotionEnabled}
              onSearchPress={onSearchPress}
              scrollY={scrollY}
            />
          </HomeEntrance>
        </Animated.View>
        {children}
      </Animated.ScrollView>

      <View pointerEvents="box-none" style={styles.headerLayer}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.headerBackdrop,
            headerBackdropStyle,
            {
              backgroundColor: colors.surfaceElevated,
              height: headerOffset,
            },
          ]}
        />
        <Animated.View style={headerContentStyle}>
          <MultiVendorAddressHeader
            {...headerProps}
            backgroundMode="transparent"
            showDivider={false}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  atmosphere: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerBackdrop: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerLayer: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    gap: 0,
  },
});
