import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

export type DeliveriesEmptyStateVariant = 'discovery' | 'offers' | 'orderAgain';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  variant?: DeliveriesEmptyStateVariant;
};

const ILLUSTRATIONS = {
  discovery: require('../../assets/emptyStates/nearby-stores.png'),
  offers: require('../../assets/emptyStates/deals.png'),
  orderAgain: require('../../assets/emptyStates/order-again.png'),
};

export default function DeliveriesSectionEmptyState({
  title,
  message,
  actionLabel,
  onActionPress,
  variant = 'discovery',
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const surface = variant === 'offers'
    ? colors.cardLavender
    : variant === 'orderAgain'
      ? colors.cardPeach
      : colors.cardMint;

  return (
    <View style={[styles.container, { backgroundColor: surface, borderRadius: shape.radius.surface }]}>
      <View style={[styles.copy, { gap: spacing.xs }]}>
        <Text color={colors.textStrong} variant="label" weight="bold" numberOfLines={2}>{title}</Text>
        <Text color={colors.textSubtle} variant="caption" numberOfLines={3}>{message}</Text>
        {actionLabel && onActionPress ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onActionPress}
            style={[styles.action, { backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.pill }]}
          >
            <Text color={colors.primary} variant="label" weight="semiBold" numberOfLines={1}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.primary} />
          </PressableScale>
        ) : null}
      </View>
      <Image accessible={false} source={ILLUSTRATIONS[variant]} resizeMode="contain" style={styles.illustration} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', minHeight: 140, overflow: 'hidden', paddingLeft: 18, paddingRight: 4, paddingVertical: 12 },
  copy: { flex: 1, minWidth: 0 },
  action: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 5, marginTop: 8, minHeight: 36, paddingHorizontal: 12 },
  illustration: { height: 124, width: 124 },
});
