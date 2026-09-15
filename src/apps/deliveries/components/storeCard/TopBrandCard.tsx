import React from 'react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Image from '../../../../general/components/Image';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryTopBrand } from '../../api/types';
import DeliveryOfferBadge from '../DeliveryOfferBadge';

type Props = {
  brand: DeliveryTopBrand;
  cardStyle?: StyleProp<ViewStyle>;
  imageContainerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  badgeStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export default function TopBrandCard({
  brand,
  cardStyle,
  imageContainerStyle,
  imageStyle,
  contentStyle,
  badgeStyle,
  titleStyle,
  subtitleStyle,
}: Props) {
  const { colors, elevation, shape, spacing, typography } = useTheme();
  const badgeLabel =
    brand.dealAmount && brand.dealType === 'percentage'
      ? `${brand.dealAmount}%`
      : brand.dealAmount
        ? String(brand.dealAmount)
        : undefined;
  const subtitle = badgeLabel ? undefined : brand.deal ?? undefined;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: shape.radius.surface,
        },
        elevation.raised,
        cardStyle,
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: colors.surfaceSoft,
            borderTopLeftRadius: shape.radius.surface,
            borderTopRightRadius: shape.radius.surface,
          },
          imageContainerStyle,
        ]}
      >
        <Image
          source={{ uri: brand.logo ?? '' }}
          style={[styles.image, imageStyle]}
          resizeMode="contain"
        />

        {badgeLabel ? (
          <DeliveryOfferBadge
            label={badgeLabel}
            size="compact"
            style={[styles.badge, badgeStyle]}
          />
        ) : null}
      </View>

      <View
        style={[
          styles.content,
          { gap: spacing.xxs, padding: spacing.sm },
          contentStyle,
        ]}
      >
        <Text
          weight="semiBold"
          numberOfLines={1}
          style={[
            typography.role.caption,
            titleStyle,
          ]}
        >
          {brand.name}
        </Text>

        {subtitle ? (
          <Text
            color={colors.textSubtle}
            numberOfLines={1}
            style={[typography.role.caption, subtitleStyle]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
  },
  imageContainer: {
    alignItems: 'center',
    height: 112,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 112,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  badge: {
    left: 8,
    position: 'absolute',
    top: 8,
  },
  content: {
    minHeight: 48,
  },
});
