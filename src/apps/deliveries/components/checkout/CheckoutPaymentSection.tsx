import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Surface from '../../../../general/components/Surface';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import CheckoutInfoRow from './CheckoutInfoRow';

type Props = {
  errorMessage?: string | null;
  isPromoApplied?: boolean;
  onPaymentPress?: () => void;
  onPromoPress?: () => void;
  onPromoRemove?: () => void;
  paymentIconName: React.ComponentProps<typeof CheckoutInfoRow>['iconName'];
  paymentSubtitle?: string | null;
  paymentTitle: string;
  promoCode?: string | null;
  promoTitle?: string | null;
  promoSubtitle?: string | null;
};

export default function CheckoutPaymentSection({
  errorMessage,
  isPromoApplied = false,
  onPaymentPress,
  onPromoPress,
  onPromoRemove,
  paymentIconName,
  paymentSubtitle,
  paymentTitle,
  promoCode,
  promoTitle,
  promoSubtitle,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.section, { gap: spacing.md }]}>
      <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
        {t('checkout_payment_title')}
      </Text>

      <Surface outlined style={[styles.surface, { padding: spacing.xs }]}>
        <CheckoutInfoRow
          title={paymentTitle}
          subtitle={paymentSubtitle}
          iconName={paymentIconName}
          onPress={onPaymentPress}
          showDivider
        />

        <CheckoutInfoRow
          title={promoTitle ?? t('checkout_promo_title')}
          subtitle={promoSubtitle ?? t('checkout_promo_subtitle')}
          iconName="ticket-outline"
          onPress={onPromoPress}
        />

        {isPromoApplied && promoCode ? (
          <View style={[styles.appliedRow, { gap: spacing.sm, padding: spacing.sm, paddingTop: spacing.xs }]}>
            <View
              style={[
                styles.codeChip,
                {
                  backgroundColor: colors.successSoft,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <Text color={colors.successText} numberOfLines={1} variant="caption" weight="semiBold">
                {promoCode}
              </Text>
            </View>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('checkout_promo_remove')}
              onPress={onPromoRemove}
              style={[
                styles.removeButton,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: shape.radius.control,
                  minHeight: layout.touchTarget.minimum,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text color={colors.textSubtle} variant="label" weight="semiBold">
                {t('checkout_promo_remove')}
              </Text>
            </PressableScale>
          </View>
        ) : null}
      </Surface>

      {errorMessage ? (
        <View
          style={[
            styles.error,
            {
              backgroundColor: colors.dangerSoft,
              borderRadius: shape.radius.control,
              padding: spacing.md,
            },
          ]}
        >
          <Text color={colors.dangerText} variant="caption" weight="medium">
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appliedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeChip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 80,
    paddingHorizontal: 14,
  },
  error: {},
  removeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {},
  surface: {
    overflow: 'hidden',
  },
});
