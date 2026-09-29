import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from '../../../../../general/components/Icon';
import Text from '../../../../../general/components/Text';
import { useTranslations } from '../../../../../general/localization/LocalizationProvider';
import { useDeliveriesCurrencyLabel } from '../../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../../general/theme/theme';

type Props = {
  rating?: number | null;
  reviewCount?: number | null;
  deliveryTime?: number | string | null;
  price?: number | null;
  minimumOrder?: number | null;
  distance?: number | null;
  showDistance?: boolean;
  showReviewCount?: boolean;
  showUnavailable?: boolean;
};

function deliveryTimeLabel(value: number | string | null | undefined): string | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? `${value} mins` : null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !Number.isFinite(Number.parseFloat(trimmed)) || Number.parseFloat(trimmed) <= 0) return null;
  return /^\d+(?:\s*[-–]\s*\d+)?$/.test(trimmed) ? `${trimmed} mins` : trimmed;
}

function amountLabel(value: number | null | undefined, currency: string): string | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? `${currency} ${value}`
    : null;
}

export default function StoreCardMetaRow({
  rating,
  reviewCount,
  deliveryTime,
  price,
  minimumOrder,
  distance,
  showDistance = false,
  showReviewCount = false,
  showUnavailable = true,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslations('deliveries');
  const currency = useDeliveriesCurrencyLabel();
  const hasRating = typeof rating === 'number' && Number.isFinite(rating) && rating > 0;
  const ratingText = hasRating
    ? `${rating.toFixed(1)}${showReviewCount && reviewCount ? ` (${reviewCount.toLocaleString()})` : ''}`
    : showUnavailable ? t('store_card_new') : null;
  const timeText = deliveryTimeLabel(deliveryTime)
    ?? (showUnavailable ? t('store_card_delivery_time_unavailable') : null);
  const feeText = amountLabel(price, currency)
    ?? (showUnavailable ? t('store_card_delivery_fee_unavailable', { currency }) : null);
  const minText = typeof minimumOrder === 'number' && Number.isFinite(minimumOrder) && minimumOrder > 0
    ? t('store_details_minimum_order', { amount: `${currency} ${minimumOrder}` })
    : null;
  const distanceText = showDistance && typeof distance === 'number' && Number.isFinite(distance) && distance > 0
    ? `${distance} km`
    : null;

  return (
    <View style={styles.row}>
      {ratingText ? <View style={styles.group}>
        <Icon color={colors.primary} name="star" size={13} type="AntDesign" />
        <Text color={colors.textSubtle} numberOfLines={1} style={styles.label} variant="caption" weight="semiBold">{ratingText}</Text>
      </View> : null}
      {timeText ? <View style={[styles.group, styles.etaGroup]}>
        <Icon color={colors.textSubtle} name="time-outline" size={13} type="Ionicons" />
        <Text color={colors.textSubtle} numberOfLines={1} style={styles.label} variant="caption" weight="medium">{timeText}</Text>
      </View> : null}
      {feeText || minText ? <View style={styles.group}>
        {feeText ? <Text color={colors.textSubtle} numberOfLines={1} style={styles.label} variant="caption" weight="medium">{feeText}</Text> : null}
        {feeText && minText ? <Text color={colors.textSubtle} style={styles.separator} variant="caption">·</Text> : null}
        {minText ? <Text color={colors.textSubtle} numberOfLines={1} style={styles.label} variant="caption" weight="medium">{minText}</Text> : null}
      </View> : null}
      {distanceText ? <View style={styles.group}>
        <Icon color={colors.textSubtle} name="location-outline" size={13} type="Ionicons" />
        <Text color={colors.textSubtle} numberOfLines={1} style={styles.label} variant="caption" weight="medium">{distanceText}</Text>
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 9,
    rowGap: 6,
    minHeight: 18,
  },
  group: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  etaGroup: {
    flexShrink: 0,
  },
  label: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  separator: {
    fontSize: 12,
    lineHeight: 15,
  },
});
