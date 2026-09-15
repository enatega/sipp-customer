import React from 'react';
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
  sidePadding: number;
  onPress?: () => void;
};

export default function SpecialOffersBannerCard({
  banner,
  height,
  width,
  sidePadding,
  onPress,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const videoUri = banner.bannerVideoLink?.trim() ?? '';
  const storeAddress = banner.store?.address?.trim() ?? '';
  const description = banner.description?.trim() ?? '';
  const isPressable = typeof onPress === 'function';

  return (
    <PressableScale
      accessibilityLabel={banner.title}
      accessibilityRole={isPressable ? 'button' : undefined}
      disabled={!isPressable}
      onPress={onPress}
      style={[
        styles.container,
        {
          borderRadius: shape.radius.hero,
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

      <View
        style={[
          styles.bannerCard,
          {
            borderRadius: shape.radius.hero,
            height,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xl,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.mediaScrimStart, colors.mediaScrimEnd]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.2, y: 0 }}
          style={styles.overlay}
        />

        <View style={[styles.content, { gap: spacing.sm }]}>
          {storeAddress ? (
            <Text
              color={colors.white}
              variant="caption"
              weight="semiBold"
            >
              {storeAddress}
            </Text>
          ) : null}

          <Text
            color={colors.white}
            numberOfLines={2}
            variant="sectionTitle"
            weight="bold"
          >
            {banner.title}
          </Text>

          {description ? (
            <Text
              color={colors.white}
              numberOfLines={3}
              weight="medium"
              variant="supporting"
            >
              {description}
            </Text>
          ) : null}
        </View>
      </View>
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
