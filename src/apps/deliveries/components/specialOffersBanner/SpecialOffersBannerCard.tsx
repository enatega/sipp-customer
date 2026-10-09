import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryBanner } from '../../api/types';
import SpecialOffersBannerMedia from './SpecialOffersBannerMedia';
import SpecialOffersBannerVideo from './SpecialOffersBannerVideo';
import PressableScale from '../../../../general/components/PressableScale';

type Props = {
  banner: DeliveryBanner;
  width: number;
  height: number;
  isCompact?: boolean;
  hasPagination?: boolean;
  sidePadding: number;
  onPress?: () => void;
};

export default function SpecialOffersBannerCard({
  banner,
  height,
  isCompact = false,
  hasPagination = false,
  width,
  sidePadding,
  onPress,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const videoUri = banner.bannerVideoLink?.trim() ?? '';
  const storeAddress = banner.store?.address?.trim() ?? '';
  const title = banner.title?.trim() ?? '';
  const description = banner.description?.trim() ?? '';
  const hasCopy = Boolean(title || description);
  const isPressable = typeof onPress === 'function';

  return (
    <PressableScale
      accessibilityLabel={title || banner.shopType?.name || banner.store?.address || t('promotional_banner')}
      accessibilityRole={isPressable ? 'button' : undefined}
      disabled={!isPressable}
      onPress={onPress}
      style={[
        styles.container,
        {
          borderRadius: shape.radius.hero,
          height,
          marginHorizontal: sidePadding,
          width,
        },
      ]}
    >
      {videoUri ? (
        <SpecialOffersBannerVideo videoUri={videoUri} />
      ) : (
        <SpecialOffersBannerMedia banner={banner} />
      )}

      {hasCopy ? (
        <View
          style={[
            styles.bannerCard,
            {
              borderRadius: shape.radius.hero,
              height,
              paddingHorizontal: isCompact ? spacing.lg : spacing.xl,
              paddingTop: isCompact ? spacing.md : spacing.xl,
              paddingBottom: hasPagination ? spacing.xxl : isCompact ? spacing.md : spacing.xl,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.bannerScrimText, colors.bannerScrimEdge]}
            end={{ x: 1, y: 0.3 }}
            start={{ x: 0, y: 1 }}
            style={styles.overlay}
          />

          <View style={[styles.content, { gap: spacing.sm }]}>
            {storeAddress ? (
              <Text color={colors.white} variant="caption" weight="semiBold">
                {storeAddress}
              </Text>
            ) : null}

            {title ? (
              <Text
                color={colors.white}
                numberOfLines={isCompact && description ? 1 : 2}
                variant="sectionTitle"
                weight="bold"
              >
                {title}
              </Text>
            ) : null}

            {description ? (
              <Text
                color={colors.white}
                numberOfLines={isCompact ? (storeAddress ? 1 : 2) : 3}
                weight="medium"
                variant="supporting"
              >
                {description}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  bannerCard: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    zIndex: 1,
  },
});
