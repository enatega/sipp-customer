import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Surface from '../../../../general/components/Surface';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import CheckoutInfoRow from './CheckoutInfoRow';

type Props = {
  errorMessage?: string | null;
  onPaymentPress?: () => void;
  paymentIconName: React.ComponentProps<typeof CheckoutInfoRow>['iconName'];
  paymentSubtitle?: string | null;
  paymentTitle: string;
};

export default function CheckoutPaymentSection({
  errorMessage,
  onPaymentPress,
  paymentIconName,
  paymentSubtitle,
  paymentTitle,
}: Props) {
  const { colors, shape, spacing } = useTheme();
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
        />

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
  error: {},
  section: {},
  surface: {
    overflow: 'hidden',
  },
});
