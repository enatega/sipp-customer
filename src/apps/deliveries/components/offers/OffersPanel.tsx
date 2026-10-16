import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import Button from '../../../../general/components/Button';
import { useTheme } from '../../../../general/theme/theme';
import { useOffers } from '../../hooks/useOffers';
import { useCouponText } from '../../hooks/useCouponText';
import { cartCouponIds, couponDisabledIssue, type CouponContext } from '../../utils/couponRules';
import type { CheckoutPreviewCoupon } from '../../api/orderServiceTypes';
import OfferCard from './OfferCard';

type Props = {
  context?: CouponContext;
  selectedIds?: string[];
  previews?: CheckoutPreviewCoupon[];
  checking?: boolean;
  previewFailed?: boolean;
  onRefreshPreview?: () => Promise<unknown>;
};

export default function OffersPanel({ context, selectedIds, previews = [], checking = false, previewFailed = false, onRefreshPreview }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, spacing, shape, typography } = useTheme();
  const offers = useOffers(onRefreshPreview);
  const text = useCouponText();
  const items = useMemo(() => offers.coupons.data?.pages.flatMap(page => page.data) ?? [], [offers.coupons.data]);
  const selected = selectedIds ?? [...new Set([...cartCouponIds(offers.cart.data), ...items.filter(item => item.is_active).map(item => item.id)])];
  const ids = [...new Set([...selected, ...items.map(item => item.id)])];
  const hasSyncError = (offers.syncPending && !offers.busyId) || offers.cart.isError;
  return (
    <FlatList
      style={styles.list}
      data={ids}
      keyExtractor={id => id}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
      refreshing={offers.refreshing}
      onRefresh={() => void offers.refresh()}
      ListHeaderComponent={<View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <TextInput
          accessibilityLabel={t('offers_code')}
          placeholder={t('offers_code')}
          placeholderTextColor={colors.mutedText}
          value={offers.code}
          onChangeText={value => offers.setCode(value.toUpperCase())}
          maxLength={64}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => void offers.claimCode()}
          style={{ flex: 1, minWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: shape.radius.control, color: colors.text, backgroundColor: colors.surface, padding: spacing.md, fontSize: typography.size.md2 }}
        />
        <Button label={t('offers_claim')} onPress={() => void offers.claimCode()} disabled={!offers.code.trim() || offers.claiming} isLoading={offers.claiming} />
        </View>
        {offers.notice ? <Text accessibilityLiveRegion="polite" color={offers.notice.error ? colors.dangerText : colors.successText}>{offers.notice.text}</Text> : null}
        {hasSyncError || previewFailed ? <View style={{ gap: spacing.sm }}>
          <Text color={colors.textSubtle}>{t('offers_sync_error')}</Text>
          <Button variant="secondary" label={t('generic_list_retry')} onPress={() => void offers.refresh()} disabled={offers.refreshing || Boolean(offers.busyId)} />
        </View> : null}
        <Text variant="sectionTitle" weight="bold">{t('offers_your_offers')}</Text>
        {offers.coupons.isPending ? <ActivityIndicator color={colors.primary} /> : null}
        {offers.coupons.isError ? <Button variant="secondary" label={t('generic_list_retry')} onPress={() => void offers.refresh()} /> : null}
        {!offers.coupons.isPending && !offers.coupons.isError && !ids.length ? <Text color={colors.textSubtle}>{t('offers_empty')}</Text> : null}
      </View>}
      renderItem={({ item: id }) => {
        const coupon = items.find(item => item.id === id);
        const preview = previews.find(item => item.id === id);
        const isSelected = selected.includes(id);
        if (!coupon) return <View style={[styles.missing, { borderColor: colors.border, borderRadius: shape.radius.surface, padding: spacing.lg, gap: spacing.sm }]}>
          <Text weight="semiBold">{preview?.name || preview?.code || t('offers_selected')}</Text>
          {checking ? <Text color={colors.textSubtle}>{t('offers_checking')}</Text> : preview?.issue ? <Text color={colors.dangerText}>{text.issue(preview.issue)}</Text> : null}
          <Button label={t('offers_remove')} variant="secondary" onPress={() => void offers.toggle(id, true)} disabled={offers.locked} isLoading={offers.busyId === id} />
        </View>;
        const disabled = couponDisabledIssue(coupon, context);
        return <OfferCard coupon={coupon} selected={isSelected} preview={preview} checking={checking} disabledReason={disabled ? text.issue(disabled) : undefined} busy={offers.busyId === id} locked={offers.locked || (!isSelected && Boolean(context) && checking)} onToggle={() => void offers.toggle(id, isSelected)} />;
      }}
      ListFooterComponent={offers.coupons.hasNextPage ? <Button variant="secondary" label={t('offers_more')} isLoading={offers.coupons.isFetchingNextPage} disabled={offers.coupons.isFetchingNextPage} onPress={() => { void offers.coupons.fetchNextPage(); }} /> : null}
    />
  );
}
const styles = StyleSheet.create({ list: { flex: 1 }, missing: { borderWidth: 1 } });
