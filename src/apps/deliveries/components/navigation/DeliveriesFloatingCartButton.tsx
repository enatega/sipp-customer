import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCartCount } from '../../hooks/useCart';
import type { DeliveriesStackParamList } from '../../navigation/types';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import PressableScale from '../../../../general/components/PressableScale';

type Props = {
  style?: StyleProp<ViewStyle>;
};

function DeliveriesFloatingCartButton({ style }: Props) {
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const { colors, elevation, motion, shape, spacing, typography } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const { t } = useTranslation('deliveries');
  const { data } = useCartCount();

  const totalItems = data?.totalItems ?? 0;
  const countLabel = useMemo(
    () => (totalItems > 99 ? '99+' : String(totalItems)),
    [totalItems],
  );
  const appearance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      appearance.setValue(1);
      return;
    }

    appearance.setValue(0.92);
    Animated.spring(appearance, {
      toValue: 1,
      damping: motion.spring.responsive.damping,
      stiffness: motion.spring.responsive.stiffness,
      mass: motion.spring.responsive.mass,
      useNativeDriver: true,
    }).start();
  }, [appearance, isReducedMotionEnabled, motion.spring.responsive, totalItems]);

  return (
    <PressableScale
      accessibilityLabel={t('cart_title')}
      accessibilityRole="button"
      onPress={() => navigation.navigate('Cart')}
      pressedScale={motion.scale.pressed}
      style={[
        style,
        styles.target,
        elevation.overlay,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: shape.radius.pill,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            borderColor: colors.onPrimary,
            borderRadius: shape.radius.pill,
            opacity: appearance,
            transform: [{ scale: appearance }],
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.iconHalo, { backgroundColor: colors.statePressed, borderRadius: shape.radius.pill }]}
        />
        <MaterialCommunityIcons color={colors.onPrimary} name="cart-outline" size={28} />
        {totalItems > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.badge,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.primary,
                borderRadius: shape.radius.pill,
                paddingHorizontal: spacing.xs + 2,
              },
            ]}
          >
            <Text
              color={colors.primary}
              variant="caption"
              style={{
                fontFamily: typography.fontFamily.semiBold,
                fontVariant: ['tabular-nums'],
              }}
              weight="semiBold"
            >
              {countLabel}
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 20,
    minWidth: 20,
    paddingVertical: 1,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  button: {
    alignItems: 'center',
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  iconHalo: {
    height: 28,
    position: 'absolute',
    width: 28,
  },
  target: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
});

export default memo(DeliveriesFloatingCartButton);
