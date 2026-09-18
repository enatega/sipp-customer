import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  label: string;
  description?: string | null;
  priceLabel: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  controlType?: 'radio' | 'checkbox';
  style?: StyleProp<ViewStyle>;
};

export default function ProductOptionRow({
  label,
  description,
  priceLabel,
  isSelected,
  isDisabled = false,
  onPress,
  controlType = 'radio',
  style,
}: Props) {
  const { colors, elevation, layout, shape, spacing } = useTheme();

  const selectionControl = (
    <View
      style={[
        controlType === 'checkbox' ? styles.checkboxOuter : styles.radioOuter,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      {isSelected ? (
        controlType === 'checkbox' ? (
          <Ionicons color={colors.onPrimary} name="checkmark" size={14} />
        ) : (
          <View style={[styles.radioInner, { backgroundColor: colors.onPrimary }]} />
        )
      ) : null}
    </View>
  );

  return (
    <PressableScale
      accessibilityRole={controlType === 'checkbox' ? 'checkbox' : 'radio'}
      accessibilityState={
        controlType === 'checkbox'
          ? { checked: isSelected, disabled: isDisabled }
          : { selected: isSelected, disabled: isDisabled }
      }
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.primarySoft : colors.surface,
          borderColor: isSelected ? colors.primary : colors.divider,
          borderRadius: shape.radius.surface,
          borderWidth: isSelected ? shape.borderWidth.selected : StyleSheet.hairlineWidth,
          gap: spacing.md,
          minHeight: layout.touchTarget.comfortable,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          ...(isSelected ? elevation.subtle : null),
        },
        style,
      ]}
    >
      {selectionControl}

      <View style={styles.copy}>
        <Text numberOfLines={2} variant="label" weight={isSelected ? 'bold' : 'semiBold'}>
          {label}
        </Text>
        {description ? (
          <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
            {description}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.priceBadge,
          {
            backgroundColor: isSelected ? colors.primary : colors.surfaceSunken,
            borderRadius: shape.radius.pill,
            paddingHorizontal: spacing.sm + 2,
            paddingVertical: spacing.xxs + 1,
          },
        ]}
      >
        <Text
          color={isSelected ? colors.onPrimary : colors.textSubtle}
          numberOfLines={1}
          variant="caption"
          weight="bold"
        >
          {priceLabel}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  checkboxOuter: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  container: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    width: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  priceBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioInner: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
});
