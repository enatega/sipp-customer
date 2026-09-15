import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image as RNImage,
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../../general/components/Icon';
import IconButton from '../../../../../general/components/IconButton';
import Image from '../../../../../general/components/Image';
import Surface from '../../../../../general/components/Surface';
import Text from '../../../../../general/components/Text';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import StoreDetailHeroCurve from './StoreDetailHeroCurve';
import StoreDetailInfoRow from './StoreDetailInfoRow';
import { STORE_DETAIL_HERO_HEIGHT } from './StoreDetailNavigationHeader';

type Props = {
  coverImageUrl: string;
  deliveryFee?: string | null;
  deliveryTime?: string | null;
  distance?: string | null;
  hours?: string | null;
  isStoreAvailable?: boolean;
  logoImageUrl: string;
  minimumOrder?: string | null;
  onInfoPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  rating?: number | null;
  reviewCount?: number | null;
  scrollY: SharedValue<number>;
  storeName: string;
  tagLine?: string | null;
  storeType?: string | null;
};

const AnimatedImage = Animated.createAnimatedComponent(RNImage);

export default function StoreDetailListHeader({
  coverImageUrl,
  deliveryFee,
  deliveryTime,
  distance,
  hours,
  isStoreAvailable = true,
  logoImageUrl,
  minimumOrder,
  onInfoPress,
  onLayout,
  rating,
  reviewCount,
  scrollY,
  storeName,
  tagLine,
  storeType,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const { gutter } = useWindowClass();
  const isReducedMotionEnabled = useReducedMotion();
  const hasRating = typeof rating === 'number' && Number.isFinite(rating) && rating > 0;
  const hasInfoMetrics = Boolean(
    deliveryFee?.trim()
    || deliveryTime?.trim()
    || distance?.trim()
    || minimumOrder?.trim(),
  );

  const heroImageStyle = useAnimatedStyle(() => {
    if (isReducedMotionEnabled) {
      return { transform: [{ translateY: 0 }, { scale: 1 }] };
    }

    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-120, 0, STORE_DETAIL_HERO_HEIGHT],
            [-24, 0, 38],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-120, 0, STORE_DETAIL_HERO_HEIGHT],
            [1.18, 1.04, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  }, [isReducedMotionEnabled]);

  const heroCopyStyle = useAnimatedStyle(() => {
    if (isReducedMotionEnabled) {
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }

    const progress = interpolate(
      scrollY.value,
      [0, STORE_DETAIL_HERO_HEIGHT * 0.58],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: 1 - progress,
      transform: [{ translateY: -10 * progress }],
    };
  }, [isReducedMotionEnabled]);

  const identityCardStyle = useAnimatedStyle(() => {
    if (isReducedMotionEnabled) {
      return { transform: [{ translateY: 0 }] };
    }

    const progress = interpolate(
      scrollY.value,
      [STORE_DETAIL_HERO_HEIGHT * 0.34, STORE_DETAIL_HERO_HEIGHT * 0.78],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: -6 * progress }],
    };
  }, [isReducedMotionEnabled]);

  return (
    <View onLayout={onLayout} style={[styles.wrapper, { paddingBottom: spacing.sm }]}>
      <View
        style={[
          styles.heroContainer,
          { backgroundColor: colors.surfaceSunken, height: STORE_DETAIL_HERO_HEIGHT },
        ]}
      >
        <AnimatedImage
          accessibilityIgnoresInvertColors
          accessible={false}
          renderToHardwareTextureAndroid={Platform.OS === 'android'}
          resizeMode="cover"
          source={{ uri: coverImageUrl }}
          style={[styles.heroImage, heroImageStyle]}
        />
        <LinearGradient
          colors={[colors.mediaScrimStart, 'transparent', colors.mediaScrimEnd]}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.46, 1]}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {tagLine?.trim() ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heroCopy,
              heroCopyStyle,
              {
                bottom: 58,
                right: gutter + spacing.xs,
              },
            ]}
          >
            <Text
              color={colors.white}
              numberOfLines={3}
              style={styles.heroTagLine}
              variant="sectionTitle"
              weight="medium"
            >
              {tagLine.trim()}
            </Text>
          </Animated.View>
        ) : null}
        <StoreDetailHeroCurve fillColor={colors.canvas} scrollY={scrollY} />
      </View>

      <Animated.View
        style={[
          identityCardStyle,
          {
            marginHorizontal: gutter,
            marginTop: -spacing.hero,
          },
        ]}
      >
        <Surface
          elevation="raised"
          tone="elevated"
          style={[
            {
              borderRadius: shape.radius.sheet,
              gap: spacing.md,
              padding: spacing.xl,
            },
          ]}
        >
          <View style={[styles.identityRow, { gap: spacing.md }]}>
            <Image
              resizeMode="cover"
              source={{ uri: logoImageUrl }}
              style={[
                styles.logoImage,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderColor: colors.divider,
                  borderRadius: shape.radius.control,
                },
              ]}
            />
            <View style={styles.identityCopy}>
              <Text
                numberOfLines={2}
                maxFontSizeMultiplier={1.35}
                style={styles.storeName}
                variant="title"
                weight="bold"
              >
                {storeName}
              </Text>
              {storeType?.trim() ? (
                <Text color={colors.textSubtle} numberOfLines={1} variant="supporting">
                  {storeType}
                </Text>
              ) : null}
            </View>
            <IconButton
              accessibilityLabel={t('store_details_action_info')}
              icon={(
                <Icon color={colors.textSubtle} name="info" size={19} type="Feather" />
              )}
              onPress={onInfoPress}
              variant="plain"
            />
          </View>

          <View style={styles.storeMetaRow}>
            <View style={[styles.availabilityRow, { gap: spacing.xs }]}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isStoreAvailable ? colors.success : colors.danger,
                    borderRadius: shape.radius.pill,
                  },
                ]}
              />
              <Text
                color={isStoreAvailable ? colors.successText : colors.dangerText}
                numberOfLines={1}
                variant="caption"
                weight="bold"
              >
                {t(isStoreAvailable ? 'store_status_open' : 'store_status_closed')}
              </Text>
              {hours?.trim() ? (
                <Text
                  color={colors.textSubtle}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={styles.hoursLabel}
                  variant="caption"
                >
                  · {hours.trim()}
                </Text>
              ) : null}
            </View>

            {hasRating ? (
              <View style={[styles.ratingRow, { gap: spacing.xs }]}>
                <Icon color={colors.warning} name="star" size={15} type="Ionicons" />
                <Text color={colors.textSubtle} numberOfLines={1} variant="caption" weight="semiBold">
                  {rating.toFixed(1)}{reviewCount ? ` (${reviewCount})` : ''}
                </Text>
              </View>
            ) : null}
          </View>

          {hasInfoMetrics ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <StoreDetailInfoRow
                deliveryFee={deliveryFee}
                deliveryTime={deliveryTime}
                distance={distance}
                minimumOrder={minimumOrder}
              />
            </>
          ) : null}
        </Surface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  availabilityRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  heroContainer: {
    overflow: 'hidden',
  },
  heroImage: {
    height: STORE_DETAIL_HERO_HEIGHT + 64,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -32,
  },
  heroCopy: {
    alignItems: 'flex-end',
    maxWidth: '48%',
    position: 'absolute',
  },
  heroTagLine: {
    fontStyle: 'italic',
    lineHeight: 27,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.42)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 7,
  },
  hoursLabel: {
    flex: 1,
    minWidth: 0,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  identityRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoImage: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 68,
    width: 68,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
  },
  statusDot: {
    flexShrink: 0,
    height: 9,
    width: 9,
  },
  storeMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeName: {
    flexShrink: 1,
    paddingVertical: 2,
  },
  wrapper: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
});
