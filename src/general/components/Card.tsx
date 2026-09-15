import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';
import type { ElevationLevel } from '../theme/elevation';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'soft' | 'outlined';
  elevation?: ElevationLevel;
  padding?: 'none' | 'compact' | 'default' | 'comfortable';
};

export default function Card({
  children,
  style,
  variant = 'surface',
  elevation = 'flat',
  padding = 'default',
}: Props) {
  const { colors, shape, spacing, elevation: elevationStyles } = useTheme();

  const variantStyle: ViewStyle = (() => {
    switch (variant) {
      case 'soft':
        return { backgroundColor: colors.surfaceSunken };
      case 'outlined':
        return { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 };
      default:
        return { backgroundColor: colors.surface };
    }
  })();

  const resolvedPadding = padding === 'none'
    ? spacing.none
    : padding === 'compact'
      ? spacing.component.compact
      : padding === 'comfortable'
        ? spacing.component.comfortable
        : spacing.component.default;

  return (
    <View
      style={[
        styles.base,
        { borderRadius: shape.radius.surface, padding: resolvedPadding },
        elevationStyles[elevation],
        variantStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
});
