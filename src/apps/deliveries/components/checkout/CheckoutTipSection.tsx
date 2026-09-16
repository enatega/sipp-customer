import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  selectedTip: number;
  onCustomTipPress: () => void;
  onSelectTip: (amount: number) => void;
};

const TIP_OPTIONS = [5, 10, 20, 50] as const;

export default function CheckoutTipSection({
  selectedTip,
  onCustomTipPress,
  onSelectTip,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const currencyLabel = useDeliveriesCurrencyLabel();
  const isCustomSelected = selectedTip > 0 && !TIP_OPTIONS.includes(selectedTip as (typeof TIP_OPTIONS)[number]);
  const choices = [0, ...TIP_OPTIONS];

  return (
    <View style={[styles.section, { gap: spacing.md }]}>
      <View style={[styles.header, { gap: spacing.xs }]}>
        <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
          {t('checkout_tip_title')}
        </Text>
        <Text color={colors.textSubtle} variant="supporting">
          {t('checkout_tip_description')}
        </Text>
      </View>

      <ScrollView
        horizontal
        bounces={false}
        contentContainerStyle={[styles.optionsRow, { gap: spacing.sm }]}
        showsHorizontalScrollIndicator={false}
      >
        {choices.map((amount) => {
          const isSelected = selectedTip === amount;

          return (
            <PressableScale
              key={amount}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectTip(amount)}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: shape.radius.pill,
                  minHeight: layout.touchTarget.minimum,
                  paddingHorizontal: spacing.lg,
                },
              ]}
            >
              <Text
                color={isSelected ? colors.primary : colors.text}
                variant="label"
                weight={isSelected ? 'semiBold' : 'medium'}
              >
                {amount === 0 ? t('checkout_tip_none') : `${currencyLabel} ${amount}`}
              </Text>
            </PressableScale>
          );
        })}

        <PressableScale
          accessibilityRole="radio"
          accessibilityState={{ selected: isCustomSelected }}
          onPress={onCustomTipPress}
          style={[
            styles.optionButton,
            {
              backgroundColor: isCustomSelected ? colors.primarySoft : colors.surface,
              borderColor: isCustomSelected ? colors.primary : colors.border,
              borderRadius: shape.radius.pill,
              gap: spacing.xs,
              minHeight: layout.touchTarget.minimum,
              paddingHorizontal: spacing.lg,
            },
          ]}
        >
          <Ionicons color={isCustomSelected ? colors.primary : colors.text} name="add" size={16} />
          <Text
            color={isCustomSelected ? colors.primary : colors.text}
            variant="label"
            weight={isCustomSelected ? 'semiBold' : 'medium'}
          >
            {t('checkout_tip_custom')}
          </Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
  optionButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
  },
  section: {},
});
