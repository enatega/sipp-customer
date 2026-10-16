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
  subtotal: number;
};

export default function CartOrderSummary({
  discountAmount,
  finalPrice,
  onFeeInfoPress,
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
  totalRow: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
