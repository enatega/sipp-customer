import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryDealItem } from '../../api/dealsServiceTypes';

type Props = { item: DeliveryDealItem; onPress: (deal: DeliveryDealItem) => void };

export default function DealsSeeAllItem({ item, onPress }: Props) {
  const { colors, shape } = useTheme();
  const { t } = useTranslation('deliveries');
  const currency = useDeliveriesCurrencyLabel();
  const [imageFailed, setImageFailed] = useState(false);
  const price = item.discountedPrice ?? item.price;
  const previousPrice = item.discountedPrice != null ? item.originalPrice ?? item.price : item.originalPrice;
  const hasPrice = typeof price === 'number' && Number.isFinite(price);
  const hasPreviousPrice = typeof previousPrice === 'number' && Number.isFinite(previousPrice) && typeof price === 'number' && Number.isFinite(price) && previousPrice > price;
  const percentage = hasPreviousPrice && typeof previousPrice === 'number' && typeof price === 'number'
    ? Math.round((1 - price / previousPrice) * 100)
    : null;
  const valueLabel = typeof item.discountValue === 'number' && item.discountValue > 0
    ? item.discountType?.toLowerCase() === 'percentage'
      ? t('deals_see_all_badge_percentage', { value: item.discountValue })
      : t('deals_see_all_badge_fixed', { value: `${currency} ${item.discountValue}` })
    : null;
  const offer = percentage && percentage > 0
    ? t('deals_see_all_badge_percentage', { value: percentage })
    : valueLabel ?? (item.deal && item.deal.trim().toLowerCase() !== 'no deal.'
      ? item.deal
      : null);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={() => onPress(item)}
      pressedScale={0.98}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.divider, borderRadius: shape.radius.surface }]}
    >
      <View style={[styles.media, { backgroundColor: colors.surfaceSunken, borderRadius: shape.radius.control }]}>
        {item.imageUrl && !imageFailed ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" onError={() => setImageFailed(true)} />
        ) : (
          <Ionicons name="pricetag-outline" size={30} color={colors.primary} />
        )}
      </View>
      <View style={styles.details}>
        {offer ? (
          <Text color={colors.primary} variant="badge" weight="bold" numberOfLines={1} style={styles.offer}>{offer}</Text>
        ) : null}
        <Text variant="cardTitle" weight="bold" numberOfLines={2} style={styles.name}>{item.name}</Text>
        <View style={styles.priceRow}>
          {hasPrice && typeof price === 'number' ? (
            <Text color={colors.textStrong} variant="numeric" weight="bold" numberOfLines={1}>{currency} {price.toFixed(2)}</Text>
          ) : null}
          {hasPreviousPrice ? (
            <Text color={colors.textSubtle} variant="caption" style={styles.previousPrice}>{currency} {previousPrice?.toFixed(2)}</Text>
          ) : null}
        </View>
      </View>
      <View style={[styles.arrow, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="arrow-forward" size={18} color={colors.primary} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, minHeight: 116, padding: 10 },
  media: { alignItems: 'center', height: 94, justifyContent: 'center', overflow: 'hidden', width: 94 },
  image: { height: '100%', width: '100%' },
  details: { flex: 1, gap: 5, minWidth: 0 },
  offer: { textTransform: 'uppercase' },
  name: { lineHeight: 21 },
  priceRow: { alignItems: 'baseline', flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  previousPrice: { textDecorationLine: 'line-through' },
  arrow: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
});
