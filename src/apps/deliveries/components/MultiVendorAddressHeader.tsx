import React, { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Text from '../../../general/components/Text';
import Icon from '../../../general/components/Icon';
import IconButton from '../../../general/components/IconButton';
import { useTheme } from '../../../general/theme/theme';
import useAddress from '../../../general/hooks/useAddress';
import { useWindowClass } from '../../../general/hooks/useWindowClass';
import { useReducedMotion } from '../../../general/hooks/useReducedMotion';
import type { ProfileAddress } from '../../../general/api/profileService';
import {
  createSelectedDeliveryAddress,
  formatDeliveryAddressLabel,
} from '../../../general/utils/address';
import DeliveriesChromeMaterial from './navigation/DeliveriesChromeMaterial';

type Props = {
  addresses?: ProfileAddress[];
  addressVariant?: 'button' | 'label';
  backgroundMode?: 'material' | 'transparent';
  includeTopInset?: boolean;
  cartCount?: number;
  onAddAddressPress?: () => void;
  onAddressPress?: () => void;
  onCartPress?: () => void;
  rightAccessory?: ReactNode;
  showCartButton?: boolean;
  showDivider?: boolean;
};

export default function MultiVendorAddressHeader({
  addresses = [],
  addressVariant = 'button',
  backgroundMode = 'material',
  includeTopInset = true,
  cartCount = 0,
  onAddAddressPress,
  onAddressPress,
  onCartPress,
  rightAccessory,
  showCartButton = true,
  showDivider = true,
}: Props) {
  const { colors, layout, motion, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const isReducedMotionEnabled = useReducedMotion();
  const { gutter } = useWindowClass();
  const { selectedAddress, selectedAddressLabel } = useAddress();
  const apiSelectedAddress = useMemo(
    () => createSelectedDeliveryAddress(addresses),
    [addresses],
  );
  const resolvedSelectedAddress = selectedAddress?.id === 'current-location'
    ? selectedAddress
    : selectedAddress ?? apiSelectedAddress;
  const resolvedSelectedAddressLabel = (() => {
    if (resolvedSelectedAddress?.id === 'current-location') {
      return formatDeliveryAddressLabel(resolvedSelectedAddress)
        || resolvedSelectedAddress.address?.trim()
        || resolvedSelectedAddress.locationName?.trim()
        || selectedAddressLabel;
    }

    return formatDeliveryAddressLabel(resolvedSelectedAddress) ?? selectedAddressLabel;
  })();
  const addressLabel = resolvedSelectedAddressLabel ?? t('multi_vendor_address_label');
  const addressTransition = useRef(new Animated.Value(1)).current;
  const isLabelVariant = addressVariant === 'label';
  const handleAddressPress = resolvedSelectedAddress ? onAddressPress : onAddAddressPress;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      addressTransition.setValue(1);
      return;
    }

    addressTransition.setValue(0);
    Animated.timing(addressTransition, {
      duration: motion.duration.quick,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [addressLabel, addressTransition, isReducedMotionEnabled, motion.duration.quick]);

  const content = (
    <View
      style={[
        styles.container,
        {
          gap: spacing.md,
          maxWidth: layout.contentMaxWidth.expanded,
          minHeight: isLabelVariant ? 56 : 64,
          paddingHorizontal: gutter,
          paddingVertical: isLabelVariant ? spacing.sm : spacing.xs + 2,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={addressLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: !handleAddressPress }}
        disabled={!handleAddressPress}
        onPress={handleAddressPress}
        style={[
          styles.addressButton,
          {
            borderRadius: shape.radius.control,
            gap: spacing.sm,
            opacity: handleAddressPress ? 1 : 0.64,
            paddingHorizontal: isLabelVariant ? spacing.xs : spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.locationIcon,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.pill,
              height: isLabelVariant ? 36 : 44,
              width: isLabelVariant ? 36 : 44,
            },
          ]}
        >
          <Icon
            color={colors.primary}
            name={resolvedSelectedAddress ? 'location' : 'add'}
            size={isLabelVariant ? 17 : 20}
            type="Ionicons"
          />
        </View>

        <Animated.View
          style={[
            styles.addressCopy,
            {
              opacity: addressTransition,
              transform: [
                {
                  translateY: addressTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [motion.distance.press, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {!isLabelVariant ? (
            <Text variant="caption" weight="medium" color={colors.textSubtle} numberOfLines={1}>
              {resolvedSelectedAddress
                ? t('delivery_header_deliver_to')
                : t('my_profile_add_address')}
            </Text>
          ) : null}
          <View
            style={[styles.addressValueRow, { gap: spacing.xs }]}
          >
            <Text
              numberOfLines={1}
              variant={isLabelVariant ? 'label' : 'body'}
              weight="semiBold"
              color={resolvedSelectedAddress ? colors.textStrong : colors.primary}
              style={styles.addressText}
            >
              {addressLabel}
            </Text>
            {handleAddressPress && resolvedSelectedAddress ? (
              <Icon color={colors.textSubtle} name="chevron-down" size={16} type="Ionicons" />
            ) : null}
          </View>
        </Animated.View>
      </Pressable>

      {rightAccessory ?? (showCartButton ? (
        <View style={styles.cartContainer}>
          <IconButton
            accessibilityLabel={t('multi_vendor_cart_label')}
            disabled={!onCartPress}
            onPress={onCartPress}
            variant="soft"
            icon={<Icon color={colors.text} name="cart-outline" size={21} type="Ionicons" />}
          />
          {cartCount > 0 ? (
            <View
              pointerEvents="none"
              style={[
                styles.cartBadge,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.surfaceElevated,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <Text
                allowFontScaling={false}
                color={colors.onPrimary}
                variant="badge"
                weight="bold"
                style={styles.cartBadgeText}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null)}
    </View>
  );

  const chromeStyle = [
    showDivider ? styles.chrome : null,
    {
      borderBottomColor: colors.divider,
      paddingTop: includeTopInset ? insets.top : 0,
    },
  ];

  if (backgroundMode === 'transparent') {
    return <View style={chromeStyle}>{content}</View>;
  }

  return (
    <DeliveriesChromeMaterial style={chromeStyle}>
      {content}
    </DeliveriesChromeMaterial>
  );
}

const styles = StyleSheet.create({
  addressButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  addressCopy: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  addressText: {
    flexShrink: 1,
    letterSpacing: -0.1,
  },
  addressValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cartBadge: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -3,
    top: -4,
  },
  cartBadgeText: {
    fontVariant: ['tabular-nums'],
  },
  cartContainer: {
    position: 'relative',
  },
  chrome: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  locationIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
