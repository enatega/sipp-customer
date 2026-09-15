import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';
import type { ElevationLevel } from '../theme/elevation';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'canvas' | 'surface' | 'elevated' | 'sunken';
  elevation?: ElevationLevel;
  outlined?: boolean;
};

export default function Surface({
  children,
  style,
  tone = 'surface',
  elevation = 'flat',
  outlined = false,
}: Props) {
  const { colors, elevation: elevationStyles, shape } = useTheme();
  const backgroundColor = tone === 'canvas'
    ? colors.canvas
    : tone === 'elevated'
      ? colors.surfaceElevated
      : tone === 'sunken'
        ? colors.surfaceSunken
        : colors.surface;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor: colors.border,
          borderRadius: shape.radius.surface,
          borderWidth: outlined ? shape.borderWidth.hairline : 0,
        },
        elevationStyles[elevation],
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
