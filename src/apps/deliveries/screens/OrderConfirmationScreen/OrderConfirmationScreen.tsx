import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import IconButton from '../../../../general/components/IconButton';
import Image from '../../../../general/components/Image';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import Surface from '../../../../general/components/Surface';
import Text from '../../../../general/components/Text';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';
import { useOrderDetails } from '../../hooks/useOrders';
import type { DeliveriesStackParamList } from '../../navigation/types';
import {
  formatCurrency,
  formatScheduledDateTime,
} from '../../utils/orderDetails/orderDetailsUtils';

type Props = NativeStackScreenProps<DeliveriesStackParamList, 'OrderConfirmation'>;

const DELIVERY_ROOT_ROUTES = ['SingleVendor', 'MultiVendor', 'Chain'] as const;

function getConfirmationRootRoute(
  navigation: Props['navigation'],
): (typeof DELIVERY_ROOT_ROUTES)[number] {
  const routes = navigation.getState().routes;

  for (let index = routes.length - 1; index >= 0; index -= 1) {
    const routeName = routes[index]?.name;

    if (DELIVERY_ROOT_ROUTES.includes(routeName as (typeof DELIVERY_ROOT_ROUTES)[number])) {
      return routeName as (typeof DELIVERY_ROOT_ROUTES)[number];
    }
  }

  return 'MultiVendor';
}

function cleanOrderReference(value: string | null | undefined) {
  return value
    ?.replace(/^order\s*#*\s*/i, '')
    .replace(/^#+\s*/, '')
    .trim() || null;
}

function ConfirmationMilestone({
  icon,
  label,
  state,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  state: 'complete' | 'active' | 'upcoming';
}) {
  const { colors, shape, spacing } = useTheme();
  const isComplete = state === 'complete';
  const isActive = state === 'active';
  const foreground = isComplete
    ? colors.successText
    : isActive
      ? colors.primary
      : colors.textSubtle;
  const background = isComplete
    ? colors.successSoft
    : isActive
      ? colors.primarySoft
      : colors.surfaceSunken;

  return (
    <View style={[styles.milestone, { gap: spacing.sm }]}>
      <View
        style={[
          styles.milestoneIcon,
          {
            backgroundColor: background,
            borderColor: isActive ? colors.primary : colors.border,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <MaterialCommunityIcons color={foreground} name={icon} size={22} />
      </View>
      <Text
        color={isActive ? colors.text : colors.textSubtle}
        numberOfLines={2}
        style={styles.milestoneLabel}
        variant="caption"
        weight={isActive || isComplete ? 'semiBold' : 'medium'}
      >
        {label}
      </Text>
    </View>
  );
}

export default function OrderConfirmationScreen({ navigation, route }: Props) {
  const { orderId, snapshot } = route.params;
  const { t } = useTranslation('deliveries');
  const { colors, elevation, layout, motion, shape, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();
  const isReducedMotionEnabled = useReducedMotion();
  const orderDetailsQuery = useOrderDetails(orderId);
  const order = orderDetailsQuery.data;
  const successScale = React.useRef(new Animated.Value(0.82)).current;
  const contentEntrance = React.useRef(new Animated.Value(0)).current;
  const [hasImageError, setHasImageError] = React.useState(false);

  React.useEffect(() => {
    if (isReducedMotionEnabled) {
      successScale.setValue(1);
      contentEntrance.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(successScale, {
        duration: motion.duration.standard,
        easing: Easing.out(Easing.back(1.35)),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(contentEntrance, {
        delay: motion.duration.instant,
        duration: motion.duration.standard,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentEntrance, isReducedMotionEnabled, motion.duration, successScale]);

  const storeName = order?.store.name || snapshot?.storeName || t('order_confirmation_store_fallback');
  const storeImage = order?.store.logo || order?.store.image || snapshot?.storeImage || null;
  const orderReference = cleanOrderReference(
    order?.orderCode || order?.summary.orderNumber || order?.orderId || orderId,
  );
  const itemCount = order?.orderItems?.products?.reduce(
    (count, product) => count + Math.max(1, Number(product.quantity) || 1),
    0,
  ) ?? snapshot?.itemCount;
  const totalAmount = order?.summary.totalAmount ?? snapshot?.totalAmount;
  const orderType = order?.orderType || snapshot?.orderType || 'delivery';
  const scheduledAt = order?.scheduledAt ?? snapshot?.scheduledAt;
  const estimate = order?.store.estimatedDeliveryTime;
  const estimateValue = scheduledAt
    ? formatScheduledDateTime(scheduledAt)
    : estimate
      ? String(estimate).toLowerCase().includes('min')
        ? String(estimate)
        : t('order_confirmation_minutes', { estimate })
      : t('order_confirmation_eta_pending');
  const isPickup = orderType === 'pickup';
  const preparationStepLabel = scheduledAt
    ? t('order_confirmation_step_scheduled')
    : order?.status === 'accepted' || order?.status === 'preparing' || order?.status === 'ready'
      ? t('order_confirmation_step_preparing')
      : t('order_confirmation_step_store');

  React.useEffect(() => {
    setHasImageError(false);
  }, [storeImage]);

  const handleDone = React.useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: getConfirmationRootRoute(navigation) }],
    } as never);
  }, [navigation]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <LinearGradient
        colors={[colors.successSoft, colors.canvas, colors.canvas]}
        locations={[0, 0.34, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.topAction,
          {
            paddingHorizontal: gutter,
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <IconButton
          accessibilityLabel={t('order_confirmation_done')}
          icon={<MaterialCommunityIcons color={colors.text} name="close" size={23} />}
          onPress={handleDone}
          variant="outlined"
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 184,
            paddingHorizontal: gutter,
            paddingTop: spacing.sm,
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.successMarkWrap,
            {
              opacity: successScale,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.successHalo,
              {
                backgroundColor: colors.successSoft,
                borderColor: colors.success,
                borderRadius: shape.radius.pill,
              },
            ]}
          />
          <View
            style={[
              styles.successMark,
              {
                backgroundColor: colors.success,
                borderRadius: shape.radius.pill,
                shadowColor: colors.shadowColor,
              },
              elevation.floating,
            ]}
          >
            <MaterialCommunityIcons color={colors.white} name="check-bold" size={40} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            {
              gap: spacing.lg,
              maxWidth: layout.contentMaxWidth.readable,
              opacity: contentEntrance,
              transform: [
                {
                  translateY: contentEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [motion.distance.medium, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.heroCopy, { gap: spacing.sm }]}>
            <Text accessibilityRole="header" style={styles.centeredText} variant="screenTitle" weight="bold">
              {t('order_confirmation_title')}
            </Text>
            {orderReference ? (
              <Text color={colors.primary} style={styles.centeredText} variant="label" weight="semiBold">
                {t('order_confirmation_number', { number: orderReference })}
              </Text>
            ) : null}
            <Text color={colors.textSubtle} style={styles.centeredText} variant="body">
              {order?.statusMessage || t('order_confirmation_message', { store: storeName })}
            </Text>
          </View>

          <View style={styles.pathRow}>
            <ConfirmationMilestone
              icon="check"
              label={t('order_confirmation_step_confirmed')}
              state="complete"
            />
            <View style={[styles.pathConnector, { backgroundColor: colors.success }]} />
            <ConfirmationMilestone
              icon="storefront-outline"
              label={preparationStepLabel}
              state="active"
            />
            <View style={[styles.pathConnector, { backgroundColor: colors.border }]} />
            <ConfirmationMilestone
              icon={isPickup ? 'shopping-outline' : 'home-outline'}
              label={t(isPickup ? 'order_confirmation_step_pickup' : 'order_confirmation_step_delivery')}
              state="upcoming"
            />
          </View>

          <Surface
            outlined
            style={[
              styles.etaSurface,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.primary,
                gap: spacing.md,
                padding: spacing.md,
              },
            ]}
          >
            <View
              style={[
                styles.etaIcon,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <MaterialCommunityIcons
                color={colors.primary}
                name={scheduledAt ? 'calendar-clock-outline' : 'clock-outline'}
                size={24}
              />
            </View>
            <View style={[styles.flexCopy, { gap: spacing.xxs }]}>
              <Text color={colors.textSubtle} variant="caption" weight="medium">
                {t(isPickup ? 'order_confirmation_ready_label' : 'order_confirmation_eta_label')}
              </Text>
              <Text numberOfLines={2} variant="cardTitle" weight="bold">
                {estimateValue}
              </Text>
            </View>
          </Surface>

          <Surface
            elevation="subtle"
            outlined
            style={[styles.summarySurface, { gap: spacing.md, padding: spacing.md }]}
          >
            <View style={[styles.merchantRow, { gap: spacing.md }]}>
              {storeImage && !hasImageError ? (
                <Image
                  accessibilityLabel={storeName}
                  onError={() => setHasImageError(true)}
                  resizeMode="cover"
                  source={{ uri: storeImage }}
                  style={[styles.storeImage, { borderRadius: shape.radius.control }]}
                />
              ) : (
                <View
                  style={[
                    styles.storeImageFallback,
                    {
                      backgroundColor: colors.surfaceSunken,
                      borderRadius: shape.radius.control,
                    },
                  ]}
                >
                  <MaterialCommunityIcons color={colors.primary} name="storefront-outline" size={25} />
                </View>
              )}

              <View style={[styles.flexCopy, { gap: spacing.xs }]}>
                <Text color={colors.textSubtle} variant="caption">
                  {t('order_confirmation_order_from')}
                </Text>
                <Text numberOfLines={1} variant="cardTitle" weight="bold">
                  {storeName}
                </Text>
                {typeof itemCount === 'number' ? (
                  <Text color={colors.textSubtle} variant="caption">
                    {t('checkout_item_count', { count: itemCount })}
                  </Text>
                ) : null}
              </View>

              {typeof totalAmount === 'number' ? (
                <View style={[styles.totalCopy, { gap: spacing.xxs }]}>
                  <Text color={colors.textSubtle} variant="caption">
                    {t('checkout_summary_total')}
                  </Text>
                  <Text numberOfLines={1} variant="numeric" weight="bold">
                    {formatCurrency(totalAmount)}
                  </Text>
                </View>
              ) : null}
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.footerPositioner,
          {
            bottom: Math.max(insets.bottom, spacing.md),
            paddingHorizontal: gutter,
            zIndex: layout.layer.floating,
          },
        ]}
      >
        <View
          style={[
            styles.footerShadow,
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
              styles.footer,
              {
                borderRadius: shape.radius.sheet,
                gap: spacing.sm,
                padding: spacing.sm,
              },
            ]}
          >
            <Button
              fullWidth
              icon={<MaterialCommunityIcons color={colors.onPrimary} name="map-marker-path" size={21} />}
              label={t('order_confirmation_track')}
              onPress={() => navigation.replace('OrderTrackingScreen', { orderId })}
              size="large"
            />
            <View style={[styles.secondaryActions, { gap: spacing.sm }]}>
              <View style={styles.secondaryAction}>
                <Button
                  fullWidth
                  label={t('order_confirmation_receipt')}
                  onPress={() => navigation.replace('OrderDetailsScreen', { orderId })}
                  size="compact"
                  variant="secondary"
                />
              </View>
              <View style={styles.secondaryAction}>
                <Button
                  fullWidth
                  label={t('order_confirmation_help')}
                  onPress={() => navigation.navigate('Support')}
                  size="compact"
                  variant="ghost"
                />
              </View>
            </View>
          </PlatformGlassSurface>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredText: {
    textAlign: 'center',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
  },
  etaIcon: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  etaSurface: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  flexCopy: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    overflow: 'hidden',
    width: '100%',
  },
  footerPositioner: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  footerShadow: {
    width: '100%',
  },
  heroCopy: {
    alignItems: 'center',
  },
  merchantRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  milestone: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  milestoneIcon: {
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  milestoneLabel: {
    minHeight: 32,
    textAlign: 'center',
  },
  pathConnector: {
    height: 2,
    marginHorizontal: -8,
    marginTop: 23,
    width: 32,
  },
  pathRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  secondaryAction: {
    flex: 1,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  storeImage: {
    height: 58,
    width: 58,
  },
  storeImageFallback: {
    alignItems: 'center',
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  successHalo: {
    borderWidth: 1,
    height: 106,
    opacity: 0.34,
    position: 'absolute',
    width: 106,
  },
  successMark: {
    alignItems: 'center',
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  successMarkWrap: {
    alignItems: 'center',
    height: 118,
    justifyContent: 'center',
  },
  summarySurface: {
    overflow: 'visible',
  },
  topAction: {
    alignItems: 'flex-end',
  },
  totalCopy: {
    alignItems: 'flex-end',
    maxWidth: '38%',
  },
});
