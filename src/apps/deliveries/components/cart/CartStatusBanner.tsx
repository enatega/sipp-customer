import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { formatCartPrice } from './cartUtils';

type Props = {
  minimumOrder?: number | null;
  onInfoPress: () => void;
  totalPrice: number;
};

export default function CartStatusBanner({ minimumOrder, onInfoPress, totalPrice }: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  if (!minimumOrder || minimumOrder <= 0) return null;

  const remaining = Math.max(minimumOrder - totalPrice, 0);
  const hasReachedMinimum = remaining === 0;
  const accent = hasReachedMinimum ? colors.success : colors.primary;

  return (
    <View style={[styles.container, { gap: spacing.xs }]}>
      <MaterialCommunityIcons
        color={accent}
        name={hasReachedMinimum ? 'check-circle-outline' : 'cart-outline'}
        size={17}
      />
      <Text
        color={hasReachedMinimum ? colors.textSubtle : colors.text}
        numberOfLines={2}
        style={styles.message}
        variant="caption"
        weight={hasReachedMinimum ? 'regular' : 'semiBold'}
      >
        {hasReachedMinimum
          ? t('cart_minimum_reached')
          : t('cart_minimum_remaining', { amount: formatCartPrice(remaining) })}
      </Text>
      <PressableScale
        accessibilityLabel={t('cart_info_label')}
        accessibilityRole="button"
        onPress={onInfoPress}
        style={[
          styles.infoButton,
          {
            borderRadius: shape.radius.pill,
            height: layout.touchTarget.minimum,
            width: layout.touchTarget.minimum,
          },
        ]}
      >
        <MaterialCommunityIcons color={colors.textSubtle} name="information-outline" size={18} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 40,
    width: '100%',
  },
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
  },
});
