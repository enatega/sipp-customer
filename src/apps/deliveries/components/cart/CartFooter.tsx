import React from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  amountLabel: string;
  disabled?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  onCheckoutPress: () => void;
};

export default function CartFooter({
  amountLabel,
  disabled = false,
  onLayout,
  onCheckoutPress,
}: Props) {
  const { colors, elevation, layout, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.positioner,
        elevation.floating,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          paddingHorizontal: gutter,
          paddingTop: spacing.sm,
          zIndex: layout.layer.floating,
        },
      ]}
    >
      <View style={[styles.content, { gap: spacing.md, maxWidth: layout.contentMaxWidth.readable }]}>
        <View style={styles.amountCopy}>
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
            {t('checkout_summary_total')}
          </Text>
          <Text numberOfLines={1} variant="numeric" weight="bold">
            {amountLabel}
          </Text>
        </View>
        <View style={styles.actionWrap}>
          <Button
            disabled={disabled}
            fullWidth
            label={t('cart_checkout_short')}
            onPress={onCheckoutPress}
            size="large"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionWrap: {
    flex: 1,
  },
  amountCopy: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  positioner: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
