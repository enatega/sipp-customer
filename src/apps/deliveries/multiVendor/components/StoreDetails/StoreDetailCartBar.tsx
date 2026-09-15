import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PlatformGlassSurface from '../../../../../general/components/PlatformGlassSurface';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import type { CartResponse } from '../../../api/cartServiceTypes';
import { formatCartPrice } from '../../../components/cart/cartUtils';
import type { DeliveriesStackParamList } from '../../../navigation/types';

type Props = {
  bottomInset: number;
  cart?: CartResponse;
  horizontalInset: number;
};

function StoreDetailCartBar({ bottomInset, cart, horizontalInset }: Props) {
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const { colors, elevation, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  if (!cart || cart.isEmpty || cart.totalItems <= 0) {
    return null;
  }

  return (
    <PressableScale
      accessibilityLabel={t('store_details_view_cart')}
      accessibilityRole="button"
      onPress={() => navigation.navigate('Cart')}
      style={[
        styles.position,
        {
          bottom: bottomInset + spacing.sm,
          left: horizontalInset,
          right: horizontalInset,
        },
      ]}
    >
      <PlatformGlassSurface
        effectStyle="regular"
        style={[
          styles.glass,
          elevation.overlay,
          {
            borderColor: colors.glassBorder,
            borderRadius: shape.radius.sheet,
            gap: spacing.md,
            padding: spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.cartIcon,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.control,
            },
          ]}
        >
          <MaterialCommunityIcons color={colors.primary} name="shopping-outline" size={24} />
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
                borderColor: colors.surfaceElevated,
                borderRadius: shape.radius.pill,
              },
            ]}
          >
            <Text color={colors.onPrimary} variant="badge" weight="bold">
              {cart.totalItems > 99 ? '99+' : cart.totalItems}
            </Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text variant="label" weight="bold">
            {t('store_details_view_cart')}
          </Text>
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
            {t('store_details_cart_summary', {
              amount: formatCartPrice(cart.finalPrice),
              count: cart.totalItems,
            })}
          </Text>
        </View>

        <View
          style={[
            styles.cta,
            {
              backgroundColor: colors.primary,
              borderRadius: shape.radius.pill,
              paddingHorizontal: spacing.lg,
            },
          ]}
        >
          <MaterialCommunityIcons color={colors.onPrimary} name="arrow-right" size={22} />
        </View>
      </PlatformGlassSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 24,
    minWidth: 24,
    paddingHorizontal: 5,
    position: 'absolute',
    right: -6,
    top: -6,
  },
  cartIcon: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  cta: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 56,
  },
  glass: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 72,
    overflow: 'hidden',
  },
  position: {
    position: 'absolute',
    zIndex: 40,
  },
});

export default memo(StoreDetailCartBar);
