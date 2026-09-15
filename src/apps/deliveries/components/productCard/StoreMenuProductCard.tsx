import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../general/components/Icon';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryDealItem } from '../../api/dealsServiceTypes';
import type { DeliveryStoreDetailsProduct } from '../../api/types';
import CartActionControl from '../cart/CartActionControl';
import type { ProductCardControlState } from './types';

type Props = {
  onPress: () => void;
  product: DeliveryStoreDetailsProduct | DeliveryDealItem;
  state: ProductCardControlState;
};

function formatPrice(price: number | null | undefined, currencyLabel: string) {
  return typeof price === 'number' ? `${currencyLabel} ${price.toFixed(2)}` : null;
}

type RawDealObject = {
  deal_name?: string;
  discount_type?: string;
  discount_value?: number;
  discounted_price?: number;
};

function getProductDealMeta(product: DeliveryStoreDetailsProduct | DeliveryDealItem) {
  const rawDeal = (product as { deal?: unknown }).deal;
  const rawDealType = (product as { dealType?: string | null }).dealType ?? null;
  const rawDiscountValue = (product as { discountValue?: number | null }).discountValue ?? null;
  const rawOriginalPrice = (product as { originalPrice?: number | null }).originalPrice ?? null;

  let dealType = rawDealType;
  let discountValue = rawDiscountValue;
  let dealLabel: string | null = null;
  let discountedPrice: number | null = null;

  if (rawDeal && typeof rawDeal === 'object' && !Array.isArray(rawDeal)) {
    const dealObject = rawDeal as RawDealObject;
    dealLabel = typeof dealObject.deal_name === 'string' ? dealObject.deal_name : null;
    dealType = dealType ?? dealObject.discount_type ?? null;
    discountValue = typeof discountValue === 'number'
      ? discountValue
      : typeof dealObject.discount_value === 'number'
        ? dealObject.discount_value
        : null;
    discountedPrice = typeof dealObject.discounted_price === 'number' &&
      Number.isFinite(dealObject.discounted_price)
      ? dealObject.discounted_price
      : null;
  } else if (typeof rawDeal === 'string') {
    const trimmedDeal = rawDeal.trim();
    if (trimmedDeal.length > 0 && trimmedDeal.toLowerCase() !== 'no deal.') {
      dealLabel = trimmedDeal;
    }
  }

  const normalizedDealType = typeof dealType === 'string' ? dealType.toLowerCase() : null;
  const hasNumericDiscount = typeof discountValue === 'number' &&
    Number.isFinite(discountValue) &&
    discountValue > 0;
  const resolvedOffer = hasNumericDiscount
    ? normalizedDealType === 'percentage'
      ? `${discountValue}% OFF`
      : `${discountValue} OFF`
    : dealLabel;

  return {
    discountedPrice,
    hasDeal: Boolean(dealLabel) || hasNumericDiscount,
    originalPrice: typeof rawOriginalPrice === 'number' && Number.isFinite(rawOriginalPrice)
      ? rawOriginalPrice
      : null,
    resolvedOffer: resolvedOffer ?? null,
  };
}

export default function StoreMenuProductCard({ onPress, product, state }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, elevation, shape, spacing } = useTheme();
  const { isCompact } = useWindowClass();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const { discountedPrice, hasDeal, originalPrice, resolvedOffer } = getProductDealMeta(product);
  const basePrice = typeof product.price === 'number' ? product.price : null;
  const effectivePrice = typeof discountedPrice === 'number' && Number.isFinite(discountedPrice)
    ? discountedPrice
    : basePrice;
  const strikePrice = typeof discountedPrice === 'number' ? basePrice : originalPrice;
  const description = 'shortDescription' in product
    ? product.shortDescription ?? product.description
    : null;
  const storeProduct = product as DeliveryStoreDetailsProduct;
  const productImageUrl = [
    product.imageUrl,
    storeProduct.category?.imageUrl,
    storeProduct.subcategory?.imageUrl,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? null;
  const [hasImageError, setHasImageError] = React.useState(false);
  const imageSize = isCompact ? 112 : 128;

  React.useEffect(() => {
    setHasImageError(false);
  }, [productImageUrl]);

  return (
    <PressableScale
      accessibilityLabel={product.name}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        elevation.subtle,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: shape.radius.surface,
          gap: spacing.md,
          padding: spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.imageFrame,
          {
            backgroundColor: hasDeal ? colors.cardPeach : colors.surfaceSunken,
            borderRadius: shape.radius.control,
            height: imageSize,
            width: imageSize,
          },
        ]}
      >
        {!productImageUrl || hasImageError ? (
          <LinearGradient
            colors={[colors.primarySoft, colors.surfaceSunken]}
            end={{ x: 0.9, y: 1 }}
            start={{ x: 0.1, y: 0 }}
            style={[StyleSheet.absoluteFill, styles.fallback]}
          >
            <Icon color={colors.primary} name="restaurant-outline" size={30} type="Ionicons" />
          </LinearGradient>
        ) : null}
        {productImageUrl && !hasImageError ? (
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            fadeDuration={Platform.OS === 'android' ? 0 : 140}
            onError={() => setHasImageError(true)}
            resizeMode="cover"
            source={{ uri: productImageUrl }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </View>

      <View style={[styles.content, { gap: spacing.xs }]}>
        <Text numberOfLines={2} variant="cardTitle" weight="bold">
          {product.name}
        </Text>
        {description?.trim() ? (
          <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
            {description.trim()}
          </Text>
        ) : null}
        {hasDeal && resolvedOffer ? (
          <View
            style={[
              styles.offerChip,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: shape.radius.pill,
                gap: spacing.xs,
              },
            ]}
          >
            <Icon color={colors.primary} name="pricetag-outline" size={12} type="Ionicons" />
            <Text color={colors.primary} numberOfLines={1} variant="badge" weight="bold">
              {resolvedOffer}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={[styles.priceGroup, { gap: spacing.xs }]}>
            {typeof strikePrice === 'number' ? (
              <Text
                color={colors.textSubtle}
                style={styles.strikePrice}
                variant="caption"
                weight="medium"
              >
                {formatPrice(strikePrice, currencyLabel)}
              </Text>
            ) : null}
            {effectivePrice !== null ? (
              <Text color={colors.textStrong} variant="numeric" weight="extraBold">
                {formatPrice(effectivePrice, currencyLabel)}
              </Text>
            ) : null}
          </View>

          <CartActionControl
            accessibilityLabel={t('store_details_add_product', { item: product.name })}
            count={state.controlCount}
            disabled={state.isDisabled}
            mode={state.controlMode}
            onAdd={state.handleAdd}
            onDecrement={state.handleDecrement}
            onIncrement={state.handleIncrement}
            size="medium"
          />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  offerChip: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  card: {
    flexDirection: 'row',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  footer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    overflow: 'hidden',
  },
  priceGroup: {
    flex: 1,
    minWidth: 0,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
  },
});
