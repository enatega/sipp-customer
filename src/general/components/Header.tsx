import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Text from './Text';
import { useTheme } from '../theme/theme';

type Props = {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};

export default function Header({ title, subtitle, style }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.sm }, style]}>
      <Text accessibilityRole="header" variant="title" weight="semiBold" style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="supporting" color={colors.textSubtle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    letterSpacing: -0.4,
  },
});
