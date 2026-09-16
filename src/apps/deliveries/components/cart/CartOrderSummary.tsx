import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { formatCartPrice } from './cartUtils';

type Props = {
  discountAmount: number;
  finalPrice: number;
  onFeeInfoPress: () => void;
  onPromoPress: () => void;
  promoCode?: string | null;
  subtotal: number;
};

export default function CartOrderSummary({
  discountAmount,
  finalPrice,
  onFeeInfoPress,
  onPromoPress,
  promoCode,
  subtotal,
}: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, elevation, layout, shape, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        elevation.subtle,
        {
          backgroundColor: colors.surface,
          borderRadius: shape.radius.surface,
          gap: spacing.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
        {t('cart_order_summary')}
      </Text>

      <PressableScale
        accessibilityRole="button"
        onPress={onPromoPress}
        style={[
          styles.promoRow,
          {
            backgroundColor: promoCode ? colors.successSoft : colors.surfaceSunken,
            borderRadius: shape.radius.control,
            gap: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <View
          style={[
            styles.promoIcon,
            {
              backgroundColor: promoCode ? colors.success : colors.primarySoft,
              borderRadius: shape.radius.pill,
            },
          ]}
        >
          <MaterialCommunityIcons
            color={promoCode ? colors.white : colors.primary}
            name="ticket-percent-outline"
            size={20}
          />
        </View>
        <View style={styles.promoCopy}>
          <Text numberOfLines={1} variant="label" weight="bold">
            {promoCode || t('cart_promo_title')}
          </Text>
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
            {promoCode ? t('cart_promo_applied') : t('cart_promo_subtitle')}
          </Text>
        </View>
        <Text color={colors.primary} variant="label" weight="semiBold">
          {promoCode ? t('cart_promo_change') : t('cart_promo_add')}
        </Text>
      </PressableScale>

      <View style={[styles.lines, { gap: spacing.sm }]}>
        <View style={styles.line}>
          <Text color={colors.textSubtle} variant="body">
            {t('checkout_summary_subtotal')}
          </Text>
          <Text color={colors.textSubtle} variant="body" weight="semiBold">
            {formatCartPrice(subtotal)}
          </Text>
        </View>
        {discountAmount > 0 ? (
          <View style={styles.line}>
            <Text color={colors.successText} variant="body">
              {t('checkout_summary_discount')}
            </Text>
            <Text color={colors.successText} variant="body" weight="semiBold">
              {`- ${formatCartPrice(discountAmount)}`}
            </Text>
          </View>
        ) : null}
        <PressableScale
          accessibilityLabel={t('cart_info_label')}
          accessibilityRole="button"
          onPress={onFeeInfoPress}
          style={[
            styles.feeInfo,
            {
              borderRadius: shape.radius.control,
              minHeight: layout.touchTarget.minimum,
            },
          ]}
        >
          <Text color={colors.textSubtle} variant="caption">
            {t('cart_fees_at_checkout')}
          </Text>
          <MaterialCommunityIcons color={colors.textSubtle} name="information-outline" size={17} />
        </PressableScale>
      </View>

      <View style={[styles.totalRow, { borderTopColor: colors.divider, paddingTop: spacing.md }]}>
        <Text variant="cardTitle" weight="bold">
          {t('checkout_summary_total')}
        </Text>
        <Text variant="numeric" weight="extraBold">
          {formatCartPrice(finalPrice)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  feeInfo: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  line: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lines: {},
  promoCopy: {
    flex: 1,
    minWidth: 0,
  },
  promoIcon: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  promoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  totalRow: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
