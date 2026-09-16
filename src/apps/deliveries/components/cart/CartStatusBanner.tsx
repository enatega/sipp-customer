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
  const progress = Math.min(Math.max(totalPrice / minimumOrder, 0), 1);
  const accent = hasReachedMinimum ? colors.success : colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: hasReachedMinimum ? colors.successSoft : colors.primarySoft,
          borderRadius: shape.radius.surface,
          gap: spacing.md,
          padding: spacing.lg,
        },
      ]}
    >
      <View style={[styles.messageRow, { gap: spacing.md }]}> 
        <View
          style={[
            styles.icon,
            {
              backgroundColor: colors.surface,
              borderRadius: shape.radius.pill,
            },
          ]}
        >
          <MaterialCommunityIcons
            color={accent}
            name={hasReachedMinimum ? 'check-bold' : 'shopping-outline'}
            size={19}
          />
        </View>
        <Text color={hasReachedMinimum ? colors.successText : colors.text} style={styles.message} variant="label" weight="semiBold">
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
          <MaterialCommunityIcons color={colors.textSubtle} name="information-outline" size={20} />
        </PressableScale>
      </View>

      <View
        accessibilityLabel={t('cart_minimum_progress_accessibility', {
          current: formatCartPrice(totalPrice),
          minimum: formatCartPrice(minimumOrder),
        })}
        accessibilityRole="progressbar"
        accessibilityValue={{ max: minimumOrder, min: 0, now: Math.min(totalPrice, minimumOrder) }}
        style={[
          styles.progressTrack,
          {
            backgroundColor: colors.surface,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: accent,
              borderRadius: shape.radius.pill,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  message: {
    flex: 1,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
  },
  progressTrack: {
    height: 5,
    overflow: 'hidden',
    width: '100%',
  },
});
