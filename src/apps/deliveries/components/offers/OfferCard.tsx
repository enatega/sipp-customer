import React, { useState } from 'react';
import PressableScale from '../../../../general/components/PressableScale';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { ClaimedCouponApiItem } from '../../api/claimedCouponsService';
import type { CheckoutPreviewCoupon } from '../../api/orderServiceTypes';
import { useCouponText } from '../../hooks/useCouponText';
import { formatCurrency } from '../../utils/orderDetails/orderDetailsUtils';

type Props = {
  coupon: ClaimedCouponApiItem;
  selected: boolean;
  preview?: CheckoutPreviewCoupon;
  checking: boolean;
  disabledReason?: string;
  busy: boolean;
  locked: boolean;
  onToggle: () => void;
};

export default function OfferCard({ coupon, selected, preview, checking, disabledReason, busy, locked, onToggle }: Props) {
  const { colors, spacing, shape } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const text = useCouponText();
  const [expanded, setExpanded] = useState(false);
  const issue = !checking && preview?.issue ? text.issue(preview.issue) : undefined;
  const reason = selected ? issue ?? (!preview && !checking ? disabledReason : undefined) : disabledReason;
  const confirmed = selected && !checking && preview?.isApplied && !issue;
  const expiry = new Date(coupon.end_date);
  const usesLeft = coupon.usage_per_user ? Math.max(0, coupon.usage_per_user - (coupon.user_usage_count ?? 0)) : null;
  const stores = coupon.offered_by?.map(store => store.store_name).filter(Boolean);
  const requirements = [
    Number.isNaN(expiry.getTime()) ? null : t('offers_valid_until', { date: expiry.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' }) }),
    coupon.min_order_value > 0 ? t('offers_minimum', { amount: formatCurrency(coupon.min_order_value) }) : null,
    stores?.length ? t('offers_stores', { stores: stores.join(', ') }) : t('offers_all_stores'),
    t('offers_payment', { methods: text.payment(coupon.payment_method) }),
    t('offers_fulfillment', { types: text.fulfillment(coupon.delivery_type) }),
    usesLeft !== null ? t('offers_uses_left', { count: usesLeft }) : null,
    coupon.applies_to_products?.length ? t('offers_products', { products: coupon.applies_to_product_names?.join(', ') || t('offers_selected_products') }) : null,
    coupon.only_premium_shops ? t('offers_premium') : null,
    coupon.for_new_users ? t('offers_new_customers') : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <View style={[styles.card, { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.border, borderRadius: shape.radius.surface }]}>
      <View style={[styles.heading, { gap: spacing.sm }]}>
        <Ionicons name="ticket-outline" color={colors.primary} size={22} />
        <Text variant="sectionTitle" weight="bold" style={styles.flex}>
          {coupon.discount_type === 'PERCENTAGE' ? t('offers_percent', { value: coupon.discount_value }) : t('offers_amount', { amount: formatCurrency(coupon.discount_value) })}
        </Text>
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text variant="label" weight="semiBold">{coupon.name}</Text>
        {expanded && coupon.description ? <Text variant="supporting" color={colors.textSubtle}>{coupon.description}</Text> : null}
        {coupon.discount_type === 'PERCENTAGE' && Number(coupon.max_discount_cap) > 0 ? <Text variant="caption" color={colors.textSubtle}>{t('offers_cap', { amount: formatCurrency(coupon.max_discount_cap) })}</Text> : null}
      </View>
      {expanded ? <View style={{ gap: spacing.xs }}>
        {requirements.map((requirement, index) => <Text key={index} variant="caption" color={colors.textSubtle}>{requirement}</Text>)}
      </View> : null}
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(value => !value)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 44 }}
      >
        <Text variant="caption" color={colors.textSubtle}>{t(expanded ? 'offers_hide_details' : 'offers_view_details')}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSubtle} />
      </PressableScale>
      {selected ? <Text accessibilityLiveRegion="polite" variant="caption" weight="semiBold" color={issue ? colors.dangerText : confirmed ? colors.successText : colors.textSubtle}>
        {checking ? t('offers_checking') : reason ? t('offers_not_applied') : confirmed ? t('offers_saved', { amount: formatCurrency(preview?.appliedDiscount ?? 0) }) : t('offers_selected')}
      </Text> : null}
      {reason ? <Text accessibilityRole="alert" variant="supporting" color={colors.dangerText}>{reason}</Text> : null}
      <Button label={selected ? t('offers_remove') : t('offers_use')} variant={selected ? 'secondary' : 'primary'} onPress={onToggle} disabled={locked || (!selected && Boolean(disabledReason))} isLoading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  heading: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
});
