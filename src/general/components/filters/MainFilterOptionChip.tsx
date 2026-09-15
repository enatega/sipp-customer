import React from 'react';
import { StyleSheet } from 'react-native';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import PressableScale from '../PressableScale';

type Props = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export default function MainFilterOptionChip({
  label,
  isSelected,
  onPress,
}: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      pressedScale={0.97}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : colors.surfaceSunken,
          borderRadius: shape.radius.pill,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <Text
        color={isSelected ? colors.onPrimary : colors.textSubtle}
        style={styles.label}
        variant="label"
        weight={isSelected ? 'semiBold' : 'medium'}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    justifyContent: 'center',
    minHeight: 44,
  },
  label: {
    textAlign: 'center',
  },
});
