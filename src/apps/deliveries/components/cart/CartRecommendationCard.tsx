import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import type { DeliveryOrderAgainItem } from '../../api/types';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { formatCartPrice } from './cartUtils';

type Props = {
  item: DeliveryOrderAgainItem;
  onPress: () => void;
};

export default function CartRecommendationCard({ item, onPress }: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const [hasImageError, setHasImageError] = React.useState(false);
  const imageUri = item.productImage?.trim() || item.storeImage?.trim() || item.storeLogo?.trim();
  const price = item.discountedPrice ?? item.price ?? 0;
  const originalPrice = item.originalPrice && item.originalPrice > price ? item.originalPrice : null;

  return (
    <PressableScale
      accessibilityLabel={t('cart_recommendation_accessibility', { product: item.productName })}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: shape.radius.surface,
        },
      ]}
    >
      {imageUri && !hasImageError ? (
        <Image
          accessibilityLabel={item.productName}
          onError={() => setHasImageError(true)}
          resizeMode="cover"
          source={{ uri: imageUri }}
          style={[styles.image, { borderRadius: shape.radius.control }]}
        />
      ) : (
        <View style={[styles.imageFallback, { backgroundColor: colors.primarySoft, borderRadius: shape.radius.control }]}>
          <MaterialCommunityIcons color={colors.primary} name="food-outline" size={34} />
        </View>
      )}

      <View style={[styles.content, { gap: spacing.xs }]}>
        <Text numberOfLines={2} variant="label" weight="bold">
          {item.productName}
        </Text>
        {item.storeName ? (
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
            {item.storeName}
          </Text>
        ) : null}
        <View style={styles.priceRow}>
          <View style={styles.priceCopy}>
            <Text variant="body" weight="bold">
              {formatCartPrice(price)}
            </Text>
            {originalPrice ? (
              <Text color={colors.textSubtle} style={styles.originalPrice} variant="caption">
                {formatCartPrice(originalPrice)}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.trailing,
              {
                backgroundColor: colors.primary,
                borderRadius: shape.radius.pill,
                height: layout.touchTarget.minimum,
                width: layout.touchTarget.minimum,
              },
            ]}
          >
            <MaterialCommunityIcons color={colors.onPrimary} name="arrow-top-right" size={19} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 10,
    width: 196,
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  image: {
    height: 112,
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    height: 112,
    justifyContent: 'center',
    width: '100%',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  priceCopy: {
    flex: 1,
  },
  priceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 8,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
