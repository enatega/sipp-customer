import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Image from '../../../../../general/components/Image';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import StoreDetailActionButton from './StoreDetailActionButton';

export const STORE_DETAIL_HERO_HEIGHT = 286;
export const STORE_DETAIL_HEADER_COLLAPSE_START = 164;
const STORE_DETAIL_HEADER_COLLAPSE_END = 218;

type Props = {
  isFavourite: boolean;
  isFavouriteLoading?: boolean;
  logoImageUrl: string;
  onBackPress: () => void;
  onFavouritePress: () => void;
  onSharePress: () => void;
  scrollY: SharedValue<number>;
  storeName: string;
  backAccessibilityLabel: string;
  favouriteAccessibilityLabel: string;
  shareAccessibilityLabel: string;
};

export default function StoreDetailNavigationHeader({
  backAccessibilityLabel,
  favouriteAccessibilityLabel,
  isFavourite,
  isFavouriteLoading = false,
  logoImageUrl,
  onBackPress,
  onFavouritePress,
  onSharePress,
  scrollY,
  shareAccessibilityLabel,
  storeName,
}: Props) {
  const { colors, isDark, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const insets = useSafeAreaInsets();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const headerHeight = insets.top + 60;

  useAnimatedReaction(
    () => scrollY.value >= STORE_DETAIL_HEADER_COLLAPSE_END,
    (nextValue, previousValue) => {
      if (nextValue !== previousValue) {
        runOnJS(setIsCollapsed)(nextValue);
      }
    },
  );

  const materialStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [STORE_DETAIL_HEADER_COLLAPSE_START, STORE_DETAIL_HEADER_COLLAPSE_END],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const identityStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [STORE_DETAIL_HEADER_COLLAPSE_START + 16, STORE_DETAIL_HEADER_COLLAPSE_END],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * 4 }],
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.header, { height: headerHeight, zIndex: layout.layer.navigation }]}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle={isCollapsed && !isDark ? 'dark-content' : 'light-content'}
        translucent
      />

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          materialStyle,
          {
            backgroundColor: colors.canvas,
            borderBottomColor: colors.divider,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      />

      <View
        style={[
          styles.navigationRow,
          {
            gap: spacing.sm,
            paddingHorizontal: gutter,
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <StoreDetailActionButton
          accessibilityLabel={backAccessibilityLabel}
          iconName="arrow-back"
          onPress={onBackPress}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.identity,
            identityStyle,
            {
              left: gutter + layout.touchTarget.minimum + spacing.lg,
              right: gutter + layout.touchTarget.minimum * 2 + spacing.lg + spacing.sm,
              height: layout.touchTarget.minimum,
              top: insets.top + spacing.sm,
            },
          ]}
        >
          <Image
            resizeMode="cover"
            source={{ uri: logoImageUrl }}
            style={[styles.compactLogo, { backgroundColor: colors.surfaceSunken }]}
          />
          <Text numberOfLines={1} variant="label" weight="bold" style={styles.storeName}>
            {storeName}
          </Text>
        </Animated.View>

        <View style={[styles.actions, { gap: spacing.sm }]}>
          <StoreDetailActionButton
            accessibilityLabel={favouriteAccessibilityLabel}
            active={isFavourite}
            iconName={isFavourite ? 'favorite' : 'favorite-border'}
            iconType="MaterialIcons"
            isLoading={isFavouriteLoading}
            onPress={onFavouritePress}
          />
          <StoreDetailActionButton
            accessibilityLabel={shareAccessibilityLabel}
            iconName="share-2"
            iconType="Feather"
            onPress={onSharePress}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  compactLogo: {
    borderRadius: 8,
    height: 32,
    width: 32,
  },
  header: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    position: 'absolute',
  },
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeName: {
    flexShrink: 1,
  },
});
