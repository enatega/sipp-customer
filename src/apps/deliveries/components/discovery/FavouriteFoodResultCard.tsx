import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecyclingState } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryShopTypeProduct } from '../../api/types';
import { getLocalizedProductName } from '../../utils/productTranslation';

type Props = {
  product: DeliveryShopTypeProduct;
  onPress: () => void;
};

export default function FavouriteFoodResultCard({ product, onPress }: Props) {
  const { i18n } = useTranslation();
  const { colors, shape, spacing } = useTheme();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const imageUri = product.productImage?.trim() || product.storeImage?.trim() || product.storeLogo?.trim();
  const [hasImageError, setHasImageError] = useRecyclingState(false, [product.productId, imageUri]);
  const name = getLocalizedProductName({
    name: product.productName,
    nameTranslations: product.productNameTranslations,
  }, i18n.language);
  const price = typeof product.price === 'number' && Number.isFinite(product.price)
    ? `${currencyLabel} ${product.price.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}`
    : null;

  return (
    <PressableScale
      accessibilityLabel={[name, product.storeName, price].filter(Boolean).join(', ')}
      accessibilityRole="button"
      onPress={onPress}
      pressedScale={0.99}
      style={[styles.card, {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: shape.radius.surface,
        gap: spacing.md,
        padding: spacing.sm,
      }]}
    >
      <View style={[styles.imageFrame, {
        backgroundColor: colors.surfaceSunken,
        borderRadius: shape.radius.control,
      }]}>
        {imageUri && !hasImageError ? (
          <Image
            source={{ uri: imageUri }}
            resizeMode="contain"
            style={styles.image}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <Ionicons name="restaurant-outline" size={28} color={colors.iconMuted} />
        )}
      </View>
      <View style={[styles.details, { gap: spacing.xs }]}>
        <Text color={colors.textStrong} numberOfLines={2} variant="body" weight="semiBold">
          {name}
        </Text>
        {product.storeName ? (
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
            {product.storeName}
          </Text>
        ) : null}
        {price ? (
          <Text color={colors.primary} numberOfLines={1} variant="body" weight="bold">
            {price}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 104, width: '100%' },
  details: { flex: 1, justifyContent: 'center', minWidth: 0 },
  image: { width: '100%', height: '100%' },
  imageFrame: { alignItems: 'center', height: 88, justifyContent: 'center', overflow: 'hidden', width: 88 },
});
