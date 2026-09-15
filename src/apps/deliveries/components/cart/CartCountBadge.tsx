import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  count: number;
  style?: StyleProp<ViewStyle>;
};

export default function CartCountBadge({ count, style }: Props) {
  const { colors, shape, spacing } = useTheme();

  if (count <= 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.primary,
          borderRadius: shape.radius.pill,
          paddingHorizontal: spacing.sm,
        },
        style,
      ]}
    >
      <Text color={colors.onPrimary} variant="badge" style={styles.label} weight="bold">
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    paddingVertical: 2,
  },
  label: {
    fontVariant: ['tabular-nums'],
  },
});
