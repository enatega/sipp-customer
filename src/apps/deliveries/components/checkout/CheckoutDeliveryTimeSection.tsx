import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { CheckoutOrderType } from '../../api/orderServiceTypes';
import type { CheckoutDeliveryTimeMode } from './checkoutScheduleUtils';

type Props = {
  isScheduleEnabled: boolean;
  onSchedulePress: () => void;
  onSelectMode: (mode: CheckoutDeliveryTimeMode) => void;
  orderType: CheckoutOrderType;
  scheduledLabel?: string | null;
  selectedMode: CheckoutDeliveryTimeMode;
};

export default function CheckoutDeliveryTimeSection({
  isScheduleEnabled,
  onSchedulePress,
  orderType,
  selectedMode,
  scheduledLabel,
  onSelectMode,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.section, { gap: spacing.md }]}>
      <Text
        accessibilityRole="header"
        variant="sectionTitle"
        weight="bold"
      >
        {t(orderType === 'pickup'
          ? 'checkout_collection_time_title'
          : 'checkout_delivery_time_title')}
      </Text>

      <View style={[styles.options, { gap: spacing.sm }]}>
      <PressableScale
        accessibilityRole="radio"
        accessibilityState={{ selected: selectedMode === 'standard' }}
        onPress={() => onSelectMode('standard')}
        style={[
          styles.option,
          {
            backgroundColor: selectedMode === 'standard' ? colors.primarySoft : colors.surface,
            borderColor: selectedMode === 'standard' ? colors.primary : colors.border,
            borderRadius: shape.radius.control,
            gap: spacing.sm,
            minHeight: layout.touchTarget.comfortable + 12,
            padding: spacing.md,
          },
        ]}
      >
        <Ionicons
          color={selectedMode === 'standard' ? colors.primary : colors.iconMuted}
          name={selectedMode === 'standard' ? 'radio-button-on' : 'radio-button-off'}
          size={20}
        />
        <View style={[styles.optionText, { gap: spacing.xs }]}>
          <Text
            numberOfLines={1}
            variant="label"
            weight="semiBold"
          >
            {t('checkout_delivery_time_standard')}
          </Text>
          <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
            {t('checkout_delivery_time_standard_eta')}
          </Text>
        </View>
      </PressableScale>

      <PressableScale
        accessibilityRole="radio"
        accessibilityState={{ selected: selectedMode === 'schedule', disabled: !isScheduleEnabled }}
        disabled={!isScheduleEnabled}
        onPress={selectedMode === 'schedule'
          ? onSchedulePress
          : () => onSelectMode('schedule')}
        style={[
          styles.option,
          {
            backgroundColor: selectedMode === 'schedule' ? colors.primarySoft : colors.surface,
            borderColor: selectedMode === 'schedule' ? colors.primary : colors.border,
            borderRadius: shape.radius.control,
            gap: spacing.sm,
            minHeight: layout.touchTarget.comfortable + 12,
            padding: spacing.md,
          },
        ]}
      >
        <Ionicons
          color={selectedMode === 'schedule' ? colors.primary : colors.iconMuted}
          name={selectedMode === 'schedule' ? 'radio-button-on' : 'radio-button-off'}
          size={20}
        />
        <View style={[styles.optionText, { gap: spacing.xs }]}>
          <Text
            numberOfLines={1}
            variant="label"
            weight="semiBold"
          >
            {t('checkout_delivery_time_schedule')}
          </Text>
          <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
            {selectedMode === 'schedule' && scheduledLabel
              ? scheduledLabel
              : t('checkout_delivery_time_schedule_hint')}
          </Text>
        </View>
      </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionText: {
    flex: 1,
  },
  options: {
    flexDirection: 'row',
  },
  option: {
    alignItems: 'flex-start',
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
  },
  section: {},
});
