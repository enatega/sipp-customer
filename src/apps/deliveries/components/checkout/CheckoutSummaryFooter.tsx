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
  isDisabled: boolean;
  isLoading?: boolean;
  onPlaceOrderPress: () => void;
  totalLabel: string;
};

export default function CheckoutSummaryFooter({
  isDisabled,
  isLoading = false,
  onPlaceOrderPress,
  totalLabel,
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
      <View
        style={[
          styles.shadowWrap,
          elevation.floating,
          {
            borderRadius: shape.radius.sheet,
            maxWidth: layout.contentMaxWidth.readable,
          },
        ]}
      >
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
                styles.lockIcon,
                {
                  backgroundColor: colors.primarySoft,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <MaterialCommunityIcons color={colors.primary} name="lock-check-outline" size={22} />
            </View>
            <View style={styles.amountCopy}>
              <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
                {t('checkout_summary_total')}
              </Text>
              <Text numberOfLines={1} variant="numeric" weight="bold">
                {totalLabel}
              </Text>
            </View>
          </View>

          <View style={styles.actionWrap}>
            <Button
              disabled={isDisabled}
              fullWidth
              isLoading={isLoading}
              label={t('checkout_place_order')}
              onPress={onPlaceOrderPress}
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
  glass: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  lockIcon: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
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
