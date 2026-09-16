import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  amountLabel: string;
  disabled?: boolean;
  itemCount: number;
  onCheckoutPress: () => void;
};

export default function CartFooter({
  amountLabel,
  disabled = false,
  itemCount,
  onCheckoutPress,
}: Props) {
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.positioner,
        {
          bottom: Math.max(insets.bottom, spacing.md),
          paddingHorizontal: gutter,
          zIndex: layout.layer.floating,
        },
      ]}
    >
      <View style={[styles.shadowWrap, elevation.floating, { borderRadius: shape.radius.sheet, maxWidth: layout.contentMaxWidth.readable }]}>
        <PlatformGlassSurface
          effectStyle="regular"
          style={[
            styles.glass,
            {
              borderRadius: shape.radius.sheet,
              gap: spacing.md,
              padding: spacing.sm,
            },
          ]}
        >
          <View style={[styles.summary, { gap: spacing.sm, paddingLeft: spacing.sm }]}>
            <View
              style={[
                styles.bagIcon,
                {
                  backgroundColor: colors.primarySoft,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <MaterialCommunityIcons color={colors.primary} name="shopping-outline" size={22} />
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.surface,
                    borderRadius: shape.radius.pill,
                  },
                ]}
              >
                <Text color={colors.onPrimary} variant="badge" weight="bold">
                  {itemCount}
                </Text>
              </View>
            </View>
            <View style={styles.amountCopy}>
              <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
                {t('checkout_summary_total')}
              </Text>
              <Text numberOfLines={1} variant="numeric" weight="bold">
                {amountLabel}
              </Text>
            </View>
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
        </PlatformGlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionWrap: {
    flex: 1.25,
  },
  amountCopy: {
    flex: 1,
    minWidth: 0,
  },
  bagIcon: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
  },
  countBadge: {
    alignItems: 'center',
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -4,
    top: -5,
  },
  glass: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  positioner: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  shadowWrap: {
    width: '100%',
  },
  summary: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
});
