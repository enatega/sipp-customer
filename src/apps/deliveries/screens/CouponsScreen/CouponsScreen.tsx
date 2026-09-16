import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../../../general/components/Button';
import { showToast } from '../../../../general/components/AppToast';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { typography } from '../../../../general/theme/typography';
import type { ApiError } from '../../../../general/api/apiClient';
import { useClaimedCouponsQuery } from '../../hooks/useClaimedCouponsQuery';
import { useClaimCouponMutation } from '../../hooks/useClaimCouponMutation';
import { useUseCouponMutation } from '../../hooks/useUseCouponMutation';
import { useCheckoutCouponStore } from '../../stores/useCheckoutCouponStore';
import { deliveryKeys } from '../../api/queryKeys';
import type { Coupon } from '../../types/coupon';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';

function toDayMonthYear(dateIso: string) {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function CouponsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [hasClaimSuccessState, setHasClaimSuccessState] = useState(false);
  const setCheckoutCoupon = useCheckoutCouponStore((state) => state.setCoupon);
  const clearCheckoutCoupon = useCheckoutCouponStore((state) => state.clearCoupon);
  const selectedCheckoutCoupon = useCheckoutCouponStore((state) => state.selectedCoupon);
  const claimedCouponsQuery = useClaimedCouponsQuery();
  const claimCouponMutation = useClaimCouponMutation();
  const useCouponMutation = useUseCouponMutation();
  const trimmedCode = code.trim();
  const isClaimDisabled = trimmedCode.length === 0 || claimCouponMutation.isPending;
  const coupons = useMemo<Coupon[]>(
    () => (claimedCouponsQuery.data?.data ?? []).map((item) => ({
      offeredBy: (item.offered_by ?? []).map((store) => ({
        storeId: store.store_id,
        storeImageUrl: store.store_image ?? store?.store_user_image,
        storeName: store.store_name,
      })),
      amountLabel:
        item.discount_type === 'PERCENTAGE'
          ? `${item.discount_value}%`
          : `${currencyLabel} ${item.discount_value}`,
      badgeLabel: item.status.toLowerCase() === 'expired'
        ? t('coupon_status_expired')
        : t('coupon_valid_until', { date: toDayMonthYear(item.end_date) }),
      code: item.code,
      discountType: item.discount_type,
      discountValue: item.discount_value,
      maxDiscountCap: item.max_discount_cap,
      minOrderValue: item.min_order_value,
      isActive: item.is_active,
      isExpired: item.status.toLowerCase() === 'expired',
      id: item.id,
      minOrderLabel: t('coupon_min_order', { currency: currencyLabel, value: item.min_order_value }),
      status: item.status,
      subtitle: item.description,
      title: item.name,
      validUntil: toDayMonthYear(item.end_date),
    })),
    [claimedCouponsQuery.data?.data, currencyLabel, t],
  );

  const keyExtractor = useCallback((item: Coupon) => item.id, []);

  const handleClaim = useCallback(async () => {
    if (!trimmedCode) {
      return;
    }

    try {
      const response = await claimCouponMutation.mutateAsync({ code: trimmedCode });
      showToast.success(t('coupon_claim_success_title'), response.message);
      setCode('');
      setHasClaimSuccessState(true);
      await claimedCouponsQuery.refetch();
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        t('coupon_claim_error_title'),
        apiError.message || t('coupon_claim_error_fallback'),
      );
    }
  }, [claimCouponMutation, claimedCouponsQuery, t, trimmedCode]);

  const handleUseCoupon = useCallback(async (coupon: Coupon) => {
    try {
      const nextActiveState = !coupon.isActive;
      await useCouponMutation.mutateAsync({ id: coupon.id, isActive: nextActiveState });

      if (nextActiveState) {
        setCheckoutCoupon({
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscountCap: coupon.maxDiscountCap,
          minOrderValue: coupon.minOrderValue,
        });
        showToast.success(
          t('coupon_use_success_title'),
          t('coupon_use_success_message'),
        );
      } else {
        if (selectedCheckoutCoupon?.id === coupon.id) {
          clearCheckoutCoupon();
        }
        showToast.success(
          t('coupon_deactivate_success_title'),
          t('coupon_deactivate_success_message'),
        );
      }

      await claimedCouponsQuery.refetch();
      void queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      void queryClient.invalidateQueries({ queryKey: [...deliveryKeys.all, 'checkout-preview'] });
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        coupon.isActive ? t('coupon_deactivate_error_title') : t('coupon_use_error_title'),
        apiError.message || (coupon.isActive ? t('coupon_deactivate_error_fallback') : t('coupon_use_error_fallback')),
      );
    }
  }, [
    claimedCouponsQuery,
    clearCheckoutCoupon,
    selectedCheckoutCoupon?.id,
    setCheckoutCoupon,
    t,
    useCouponMutation,
    queryClient,
  ]);

  const renderCoupon = useCallback(({ item }: { item: Coupon }) => (
    <View style={[styles.couponCard, { backgroundColor: colors.surface, borderColor: item.isActive ? colors.primary : colors.border }]}> 
      <View style={[styles.valueBlock, { backgroundColor: item.isExpired ? colors.backgroundTertiary : colors.primarySoft }]}> 
        <Ionicons name="ticket-outline" size={20} color={item.isExpired ? colors.iconMuted : colors.primary} />
        <Text
          color={item.isExpired ? colors.mutedText : colors.primary}
          weight="bold"
          style={styles.valueAmount}
        >
          {item.amountLabel}
        </Text>
        <Text
          color={item.isExpired ? colors.mutedText : colors.primary}
          weight="semiBold"
          style={styles.valueOff}
        >
          {t('coupon_off')}
        </Text>
      </View>

      <View style={styles.couponContent}>
        <View style={styles.couponTopRow}>
          <Text color={colors.text} weight="semiBold" numberOfLines={1} style={styles.couponTitle}>{item.title}</Text>
          {item.isActive ? (
            <View style={[styles.activeBadge, { backgroundColor: colors.successSoft }]}> 
              <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
              <Text color={colors.successText} weight="semiBold" style={styles.activeText}>{t('coupon_active')}</Text>
            </View>
          ) : null}
        </View>
        {item.offeredBy.length > 0 ? (
          <View style={styles.storeRow}>
            <View style={styles.storeAvatars}>
              {item.offeredBy.slice(0, 3).map((store, index) => (
                <View
                  key={`${item.id}-${store.storeId}-${index}`}
                  style={[
                    styles.storeAvatarWrap,
                    {
                      borderColor: colors.gray100,
                      marginLeft: index === 0 ? 0 : -10,
                      zIndex: 10 - index,
                    },
                  ]}
                >
                  {store.storeImageUrl ? (
                    <Image source={{ uri: store.storeImageUrl }} style={styles.storeAvatar} />
                  ) : (
                    <View
                      style={[styles.storeAvatarFallback, { backgroundColor: colors.blue100 }]}
                    />
                  )}
                </View>
              ))}
              {item.offeredBy.length > 3 ? (
                <View
                  style={[
                    styles.moreStoresPill,
                    {
                      backgroundColor: colors.blue100,
                      borderColor: colors.gray100,
                      marginLeft: -10,
                    },
                  ]}
                >
                  <Text color={colors.textSubtle} weight="medium" style={styles.moreStoresText}>
                    +{item.offeredBy.length - 3}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text color={colors.text} weight="medium" numberOfLines={1} style={styles.storeName}>
              {item.offeredBy.map((store) => store.storeName).join(', ')}
            </Text>
          </View>
        ) : null}
        <Text color={colors.mutedText} weight="medium" style={styles.couponSubtitle}>
          {item.subtitle}
        </Text>
        <View style={styles.couponFooter}>
          <View style={styles.minOrderRow}>
            <Ionicons name="bag-handle-outline" size={12} color={colors.iconMuted} />
            <Text color={colors.iconMuted} weight="medium" style={styles.validText}>
              {item.minOrderLabel}
            </Text>
          </View>
          <View
            style={[
              styles.validBadge,
              { backgroundColor: item.isExpired ? colors.red100 : colors.warningSoft },
            ]}
          >
            <Text
              color={item.isExpired ? colors.danger : colors.warningText}
              weight="medium"
              style={styles.validText}
            >
              {item.badgeLabel}
            </Text>
          </View>
        </View>
        <View style={[styles.useButtonWrap, { backgroundColor: item.isActive ? colors.backgroundTertiary : colors.primarySoft }]}> 
          <Pressable
            accessibilityRole="button"
            disabled={useCouponMutation.isPending || item.isExpired}
            style={({ pressed }) => [
              styles.useButton,
              {
                backgroundColor: 'transparent',
                opacity: pressed ? 0.85 : item.isExpired ? 0.5 : 1,
              },
            ]}
            onPress={() => {
              void handleUseCoupon(item);
            }}
          >
            <Text color={item.isActive ? colors.text : colors.primary} weight="semiBold" style={styles.useButtonText}>
              {item.isActive ? t('coupon_deactivate') : t('coupon_use')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  ), [colors, handleUseCoupon, t, useCouponMutation.isPending]);

  const renderEmptyCouponsState = useCallback(() => {
    if (claimedCouponsQuery.isPending) {
      return <ActivityIndicator color={colors.primary} style={styles.loading} />;
    }

    if (claimedCouponsQuery.isError) {
      return null;
    }

    return (
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyIllustrationWrap, { backgroundColor: colors.blue50 }]}>
          <Ionicons color={colors.blue800} name="ticket-outline" size={44} />
          <View style={[styles.emptyIllustrationBadge, { backgroundColor: colors.warningSoft }]}>
            <Text color={colors.warningText} weight="medium" style={styles.emptyIllustrationBadgeText}>
              6%
            </Text>
          </View>
        </View>
        <Text color={colors.text} weight="semiBold" style={styles.emptyTitle}>
          {t('coupon_empty_title')}
        </Text>
        <Text color={colors.mutedText} style={styles.emptyDescription}>
          {t('coupon_empty_description')}
        </Text>
      </View>
    );
  }, [claimedCouponsQuery.isError, claimedCouponsQuery.isPending, colors.blue50, colors.blue800, colors.mutedText, colors.primary, colors.text, colors.warningSoft, colors.warningText, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('coupon_title')}
        onBack={hasClaimSuccessState ? () => setHasClaimSuccessState(false) : undefined}
      />
      {hasClaimSuccessState ? (
        <View style={styles.successStateContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.successSoft }]}> 
            <Ionicons name="checkmark" size={44} color={colors.successText} />
            <View style={[styles.successSparkle, { backgroundColor: colors.quickActionDealsSurface }]}> 
              <Ionicons name="sparkles" size={18} color={colors.quickActionDealsForeground} />
            </View>
          </View>
          <Text color={colors.text} weight="extraBold" style={styles.successStateTitle}>
            {t('coupon_claimed_state_title')}
          </Text>
          <Text color={colors.text} weight="medium" style={styles.successStateBody}>
            {t('coupon_claimed_state_body_line_one')}
          </Text>
          <Text color={colors.text} weight="medium" style={styles.successStateBody}>
            {t('coupon_claimed_state_body_line_two')}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={coupons}
            keyExtractor={keyExtractor}
            renderItem={renderCoupon}
            ListEmptyComponent={renderEmptyCouponsState}
            refreshing={claimedCouponsQuery.isRefetching}
            onRefresh={() => {
              void claimedCouponsQuery.refetch();
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            ListHeaderComponent={(
              <View style={styles.headerContent}>
                <Text color={colors.mutedText} style={styles.description}>
                  {t('coupon_description')}
                </Text>
                <Text color={colors.text} weight="semiBold" style={styles.claimLabel}>{t('coupon_claim_label')}</Text>
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={code}
                  onChangeText={setCode}
                  placeholder={t('coupon_input_placeholder')}
                  placeholderTextColor={colors.mutedText}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceSunken,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (!isClaimDisabled) void handleClaim();
                  }}
                />
                {claimedCouponsQuery.isError ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void claimedCouponsQuery.refetch()}
                    style={[styles.errorBanner, { backgroundColor: colors.dangerSoft }]}
                  >
                    <Ionicons name="refresh-outline" size={18} color={colors.dangerText} />
                    <Text color={colors.dangerText} weight="medium" style={styles.errorText}>
                      {claimedCouponsQuery.error.message || t('coupon_list_error_fallback')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          />
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.divider,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <Button
              label={t('coupon_claim')}
              style={styles.submitButton}
              disabled={isClaimDisabled}
              isLoading={claimCouponMutation.isPending}
              onPress={() => {
                void handleClaim();
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: 14,
    paddingBottom: 16,
  },
  couponCard: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 16,
    minHeight: 178,
    overflow: 'hidden',
  },
  couponContent: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  couponFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  couponSubtitle: {
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
  },
  couponTitle: {
    flex: 1,
    fontSize: typography.size.md2,
    lineHeight: typography.lineHeight.md2,
  },
  description: {
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
  },
  emptyDescription: {
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
    maxWidth: 270,
    textAlign: 'center',
  },
  emptyIllustrationBadge: {
    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    right: -4,
    top: -6,
  },
  emptyIllustrationBadgeText: {
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
  },
  emptyIllustrationWrap: {
    alignItems: 'center',
    borderRadius: 500,
    height: 112,
    justifyContent: 'center',
    marginBottom: 4,
    width: 112,
  },
  emptyStateContainer: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 110,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: typography.size.md2,
    lineHeight: typography.lineHeight.md2,
    textAlign: 'center',
  },
  headerContent: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    flex: 1,
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
  },
  errorBanner: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 8, padding: 12 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: typography.size.md2,
    lineHeight: typography.lineHeight.md2,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  loading: { marginTop: 72 },
  separator: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  submitButton: {
    borderRadius: 12,
    height: 52,
  },
  successStateBody: {
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
    textAlign: 'center',
    width: 318,
  },
  successStateContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 44,
  },
  successIcon: { alignItems: 'center', borderRadius: 40, height: 112, justifyContent: 'center', marginBottom: 8, width: 112 },
  successSparkle: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', position: 'absolute', right: -4, top: -4, width: 36 },
  successStateTitle: {
    fontSize: typography.size.h5,
    lineHeight: 38,
    textAlign: 'center',
  },
  useButton: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 34,
    width: '100%',
  },
  useButtonText: {
    fontSize: typography.size.sm2,
    lineHeight: 20,
  },
  useButtonWrap: {
    borderRadius: 10,
    marginTop: 2,
    overflow: 'hidden',
  },
  validBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  validText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  valueAmount: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  valueBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 82,
  },
  valueOff: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  minOrderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  storeAvatar: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  storeAvatarFallback: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  storeAvatarWrap: {
    borderRadius: 14,
    borderWidth: 1.5,
  },
  storeAvatars: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moreStoresPill: {
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 1.5,
    height: 28,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 6,
  },
  moreStoresText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.sm,
  },
  storeName: {
    flex: 1,
    fontSize: typography.size.sm2,
    lineHeight: typography.lineHeight.md,
  },
  storeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeBadge: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 5, paddingHorizontal: 7, paddingVertical: 4 },
  activeDot: { borderRadius: 3, height: 6, width: 6 },
  activeText: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.sm },
  claimLabel: { fontSize: typography.size.sm2, lineHeight: typography.lineHeight.md },
  couponTopRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
