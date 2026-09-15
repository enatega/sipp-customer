import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import Text from '../../../../general/components/Text';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryOrderAgainItem } from '../../api/types';
import CartActionControl from '../cart/CartActionControl';
import CartCountBadge from '../cart/CartCountBadge';
import type { ProductCardControlState } from './types';
import PressableScale from '../../../../general/components/PressableScale';
import DeliveryOfferBadge from '../DeliveryOfferBadge';

type Props = {
  onPress: () => void;
  product: DeliveryOrderAgainItem;
  state: ProductCardControlState;
};

type RawDealObject = {
  deal_name?: string;
  discount_type?: string;
  discount_value?: number;
  discounted_price?: number;
};

function getOrderAgainDealMeta(product: DeliveryOrderAgainItem, offLabel: string) {
  const rawDeal = product.deal;
  const rawDealType = product.dealType ?? null;
  const rawDealAmount = product.dealAmount ?? null;
  const rawDiscountedPrice = product.discountedPrice ?? null;

  let dealType = rawDealType;
  let discountValue = rawDealAmount;
  let dealLabel: string | null = null;
  let discountedPrice: number | null =
    typeof rawDiscountedPrice === 'number' && Number.isFinite(rawDiscountedPrice)
      ? rawDiscountedPrice
      : null;

  if (rawDeal && typeof rawDeal === 'object' && !Array.isArray(rawDeal)) {
    const objectDeal = rawDeal as RawDealObject;
    dealLabel = typeof objectDeal.deal_name === 'string' ? objectDeal.deal_name : null;
    dealType = dealType ?? objectDeal.discount_type ?? null;
    discountValue =
      typeof discountValue === 'number'
        ? discountValue
        : typeof objectDeal.discount_value === 'number'
          ? objectDeal.discount_value
          : null;
    if (
      discountedPrice === null &&
      typeof objectDeal.discounted_price === 'number' &&
      Number.isFinite(objectDeal.discounted_price)
    ) {
      discountedPrice = objectDeal.discounted_price;
    }
  } else if (typeof rawDeal === 'string') {
    const trimmedDeal = rawDeal.trim();
    if (trimmedDeal.length > 0 && trimmedDeal.toLowerCase() !== 'no deal.') {
      dealLabel = trimmedDeal;
    }
  }

  const normalizedDealType = typeof dealType === 'string' ? dealType.toLowerCase() : null;
  const hasNumericDiscount =
    typeof discountValue === 'number' && Number.isFinite(discountValue) && discountValue > 0;
  const numericDiscountValue = hasNumericDiscount ? discountValue : null;
  const basePrice = typeof product.price === 'number' ? product.price : null;

  if (
    discountedPrice === null &&
    numericDiscountValue !== null &&
    typeof basePrice === 'number' &&
    Number.isFinite(basePrice)
  ) {
    discountedPrice =
      normalizedDealType === 'percentage'
        ? Number((basePrice - (basePrice * numericDiscountValue) / 100).toFixed(2))
        : Number((basePrice - numericDiscountValue).toFixed(2));
  }

  const safeDiscountedPrice =
    typeof discountedPrice === 'number' &&
    Number.isFinite(discountedPrice) &&
    typeof basePrice === 'number' &&
    discountedPrice >= 0 &&
    discountedPrice < basePrice
      ? discountedPrice
      : null;

  const offerText = numericDiscountValue !== null
    ? normalizedDealType === 'percentage'
      ? `${numericDiscountValue} % ${offLabel}`
      : `${numericDiscountValue} ${offLabel}`
    : dealLabel;

  return {
    basePrice,
    discountedPrice: safeDiscountedPrice,
    hasDeal: Boolean(offerText),
    offerText: offerText ?? null,
  };
}

export default function OrderAgainProductCard({ onPress, product, state }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, elevation, shape, spacing } = useTheme();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const { basePrice, discountedPrice, hasDeal, offerText } = getOrderAgainDealMeta(
    product,
    t('off'),
  );
  const imageUri =
    product.productImage?.trim() ||
    product.storeImage?.trim() ||
    product.storeLogo?.trim() ||
    'https://placehold.co/400x400.png';
  const formattedPrice =
    typeof (discountedPrice ?? basePrice) === 'number'
      ? `${currencyLabel} ${(discountedPrice ?? basePrice)!.toFixed(2)}`
      : t('multi_vendor_order_again_price_unavailable');
  const strikePrice =
    typeof discountedPrice === 'number' && typeof basePrice === 'number'
      ? `${currencyLabel} ${basePrice.toFixed(2)}`
      : null;

  return (
    <PressableScale
      accessibilityLabel={product.productName}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: shape.radius.surface,
          ...elevation.raised,
        },
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        {hasDeal && offerText ? (
          <DeliveryOfferBadge
            label={offerText}
            size="compact"
            style={styles.badge}
          />
        ) : null}

        <View style={styles.action}>
          <CartActionControl
            accessibilityLabel={t('multi_vendor_order_again_add_item')}
            count={state.controlCount}
            disabled={state.isDisabled}
            mode={state.controlMode}
            onAdd={state.handleAdd}
            onDecrement={state.handleDecrement}
            onIncrement={state.handleIncrement}
            size="small"
          />
        </View>

        {state.shouldShowCountBadge ? (
          <CartCountBadge count={state.totalQuantity} style={styles.countBadge} />
        ) : null}
      </View>

      <View style={[styles.content, { gap: spacing.xs, padding: spacing.sm }]}>
        <View style={styles.priceRow}>
          {strikePrice ? (
            <Text
              weight="medium"
              color={colors.textSubtle}
              variant="badge"
              style={styles.strikePrice}
            >
              {strikePrice}
            </Text>
          ) : null}
          <Text
            weight="semiBold"
            color={colors.primary}
            variant="caption"
          >
            {formattedPrice}
          </Text>
        </View>

        <Text
          weight="semiBold"
          numberOfLines={1}
          variant="label"
        >
          {product.productName}
        </Text>

        {product.storeName ? (
          <Text
            color={colors.textSubtle}
            numberOfLines={1}
            variant="caption"
          >
            {product.storeName}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  action: {
    position: 'absolute',
    right: 6,
    top: 6,
  },
  badge: {
    left: 6,
    position: 'absolute',
    top: 6,
  },
  card: {
    width: 140,
  },
  content: {
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
  },
  countBadge: {
    left: 6,
    position: 'absolute',
    top: 42,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageWrapper: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 92,
    overflow: 'hidden',
    position: 'relative',
  },
});
