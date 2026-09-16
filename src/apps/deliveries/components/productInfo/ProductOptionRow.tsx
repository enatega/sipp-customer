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
  presentation?: 'row' | 'tile';
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
  presentation = 'row',
  style,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const isTile = presentation === 'tile';

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
        isTile ? styles.tile : styles.row,
        {
          backgroundColor: isSelected ? colors.primarySoft : colors.surface,
          borderColor: isSelected ? colors.primary : colors.divider,
          borderRadius: shape.radius.control,
          gap: spacing.sm,
          minHeight: isTile ? 68 : layout.touchTarget.comfortable,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      {isTile ? selectionControl : null}

      <View style={styles.copy}>
        <Text numberOfLines={2} variant="label" weight={isSelected ? 'bold' : 'semiBold'}>
          {label}
        </Text>
        {description ? (
          <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
            {description}
          </Text>
        ) : null}
        <Text
          color={isSelected ? colors.primary : colors.textSubtle}
          numberOfLines={1}
          variant="caption"
          weight="semiBold"
        >
          {priceLabel}
        </Text>
      </View>

      {!isTile ? selectionControl : null}
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
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    width: '100%',
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
  tile: {
    alignItems: 'flex-start',
    flexBasis: '48%',
    flexGrow: 1,
    maxWidth: '100%',
  },
});
