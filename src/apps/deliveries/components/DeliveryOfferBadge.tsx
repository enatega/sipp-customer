import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Text from '../../../general/components/Text';
import { useTheme } from '../../../general/theme/theme';

type Props = {
  label: string;
  size?: 'compact' | 'regular';
  style?: StyleProp<ViewStyle>;
};

export default function DeliveryOfferBadge({
  label,
  size = 'regular',
  style,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const isCompact = size === 'compact';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.primary,
          borderRadius: shape.radius.pill,
          gap: spacing.xs,
          minHeight: isCompact ? spacing.xxl : spacing.xxxl,
          paddingHorizontal: isCompact ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      <Ionicons
        color={colors.onPrimary}
        name="pricetag"
        size={isCompact ? 11 : 13}
      />
      <Text
        color={colors.onPrimary}
        numberOfLines={1}
        variant={isCompact ? 'badge' : 'caption'}
        weight="semiBold"
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
