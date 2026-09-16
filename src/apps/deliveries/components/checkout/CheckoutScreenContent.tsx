import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ListStateView from '../../../../general/components/filterablePaginatedList/ListStateView';
import Surface from '../../../../general/components/Surface';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';
import type {
  CheckoutOrderType,
  CheckoutPreviewResponse,
} from '../../api/orderServiceTypes';
import CheckoutDeliveryTimeSection from './CheckoutDeliveryTimeSection';
import CheckoutHeader from './CheckoutHeader';
import CheckoutInfoRow from './CheckoutInfoRow';
import CheckoutMerchantSummary from './CheckoutMerchantSummary';
import CheckoutModeTabs from './CheckoutModeTabs';
import CheckoutPaymentSection from './CheckoutPaymentSection';
import CheckoutSummaryDetails from './CheckoutSummaryDetails';
import CheckoutSummaryFooter from './CheckoutSummaryFooter';
import CheckoutTipSection from './CheckoutTipSection';
import { getCheckoutMessagePreview } from './checkoutMessageUtils';
import { formatCheckoutScheduledAt, type CheckoutDeliveryTimeMode } from './checkoutScheduleUtils';

type Props = {
  canShowLeaveAtDoor?: boolean;
  deliveryTimeMode: CheckoutDeliveryTimeMode;
  hasAddressRequirement: boolean;
  isPickupEnabled: boolean;
  isPromoApplied?: boolean;
  isPlacingOrder?: boolean;
  isPaymentBlocked?: boolean;
  isPreviewEnabled: boolean;
  isPreviewError: boolean;
  isStoreClosedError?: boolean;
  isPreviewPending: boolean;
  leaveAtDoor: boolean;
  onAddressPress: () => void;
  onBackPress: () => void;
  onCourierMessagePress: () => void;
  onDeliveryTimeModeChange: (mode: CheckoutDeliveryTimeMode) => void;
  onLeaveAtDoorChange: (value: boolean) => void;
  onOrderTypeChange: (mode: CheckoutOrderType) => void;
  onPlaceOrderPress: () => void;
  onPaymentPress: () => void;
  onPromoPress: () => void;
  onPromoRemove?: () => void;
  onRestaurantMessagePress: () => void;
  onSchedulePress: () => void;
  onRetryPreview: () => void;
  onCustomTipPress: () => void;
  onTipChange: (amount: number) => void;
  orderType: CheckoutOrderType;
  paymentErrorMessage?: string | null;
  paymentIconName: React.ComponentProps<typeof CheckoutInfoRow>['iconName'];
  paymentSubtitle?: string | null;
  paymentTitle: string;
  promoCode?: string | null;
  promoTitle?: string | null;
  promoSubtitle?: string | null;
  preview: CheckoutPreviewResponse | null;
  courierMessage: string;
  restaurantMessage: string;
  scheduledAt?: string | null;
  selectedAddressLabel?: string | null;
  selectedTip: number;
  totalLabel: string;
};

export default function CheckoutScreenContent({
  canShowLeaveAtDoor = true,
  deliveryTimeMode,
  hasAddressRequirement,
  isPickupEnabled,
  isPromoApplied = false,
  isPlacingOrder = false,
  isPaymentBlocked = false,
  isPreviewEnabled,
  isPreviewError,
  isStoreClosedError = false,
  isPreviewPending,
  leaveAtDoor,
  onAddressPress,
  onBackPress,
  onCourierMessagePress,
  onDeliveryTimeModeChange,
  onLeaveAtDoorChange,
  onOrderTypeChange,
  onPlaceOrderPress,
  onPaymentPress,
  onPromoPress,
  onPromoRemove,
  onRestaurantMessagePress,
  onSchedulePress,
  onRetryPreview,
  onCustomTipPress,
  onTipChange,
  orderType,
  paymentErrorMessage,
  paymentIconName,
  paymentSubtitle,
  paymentTitle,
  promoCode,
  promoTitle,
  promoSubtitle,
  preview,
  courierMessage,
  restaurantMessage,
  scheduledAt,
  selectedAddressLabel,
  selectedTip,
  totalLabel,
}: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, layout, shape, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const isDeliveryOrder = orderType === 'delivery';
  const canPlaceOrder = Boolean(preview)
    && !hasAddressRequirement
    && !isPreviewPending
    && !isPaymentBlocked
    && !isPlacingOrder;
  const addressTitle = orderType === 'pickup'
    ? preview?.store.name ?? t('checkout_pickup_title')
    : selectedAddressLabel ?? preview?.fulfillment.delivery?.label ?? t('checkout_address_title');
  const addressSubtitle = orderType === 'pickup'
    ? preview?.fulfillment.pickup?.address ?? t('checkout_pickup_subtitle')
    : selectedAddressLabel
      ? preview?.fulfillment.delivery?.address ?? t('checkout_address_selected_subtitle')
      : t('checkout_address_subtitle');
  const restaurantMessageSubtitle = getCheckoutMessagePreview(
    restaurantMessage,
    t('checkout_message_restaurant_subtitle'),
  );
  const courierMessageSubtitle = getCheckoutMessagePreview(
    courierMessage,
    t('checkout_message_courier_subtitle'),
  );
  const scheduledLabel = scheduledAt ? formatCheckoutScheduledAt(scheduledAt) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <CheckoutHeader onBackPress={onBackPress} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            gap: spacing.section.default,
            paddingBottom: 132,
            paddingHorizontal: gutter,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              gap: spacing.section.default,
              maxWidth: layout.contentMaxWidth.readable,
            },
          ]}
        >
          <CheckoutMerchantSummary preview={preview} />

          <View style={[styles.section, { gap: spacing.md }]}>
            <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
              {t('checkout_fulfillment_title')}
            </Text>
            <CheckoutModeTabs
              activeMode={orderType}
              isDeliveryEnabled
              isPickupEnabled={isPickupEnabled}
              onModeChange={onOrderTypeChange}
            />
          </View>

          <View style={[styles.section, { gap: spacing.md }]}>
            <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
              {t(isDeliveryOrder ? 'checkout_delivery_details_title' : 'checkout_pickup_details_title')}
            </Text>
            <Surface outlined style={[styles.groupSurface, { padding: spacing.xs }]}>
              <CheckoutInfoRow
                title={addressTitle}
                subtitle={addressSubtitle}
                iconName={isDeliveryOrder ? 'location-outline' : 'storefront-outline'}
                onPress={isDeliveryOrder ? onAddressPress : undefined}
                showDivider={isDeliveryOrder && canShowLeaveAtDoor}
              />

              {isDeliveryOrder && canShowLeaveAtDoor ? (
                <CheckoutInfoRow
                  title={t('checkout_leave_at_door_title')}
                  subtitle={t('checkout_leave_at_door_subtitle')}
                  iconName="home-outline"
                  rightAccessory={(
                    <Switch
                      accessibilityLabel={t('checkout_leave_at_door_title')}
                      onValueChange={onLeaveAtDoorChange}
                      thumbColor={colors.white}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      value={leaveAtDoor}
                    />
                  )}
                />
              ) : null}
            </Surface>
          </View>

          <CheckoutDeliveryTimeSection
            isScheduleEnabled={preview?.schedule.scheduleAllowed ?? false}
            onSchedulePress={onSchedulePress}
            orderType={orderType}
            scheduledLabel={scheduledLabel}
            selectedMode={deliveryTimeMode}
            onSelectMode={onDeliveryTimeModeChange}
          />

          <View style={[styles.section, { gap: spacing.md }]}>
            <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
              {t('checkout_notes_title')}
            </Text>
            <Surface outlined style={[styles.groupSurface, { padding: spacing.xs }]}>
              <CheckoutInfoRow
                title={t('checkout_message_restaurant_title')}
                subtitle={restaurantMessageSubtitle}
                iconName="restaurant-outline"
                onPress={onRestaurantMessagePress}
                showDivider={isDeliveryOrder}
              />

              {isDeliveryOrder ? (
                <CheckoutInfoRow
                  title={t('checkout_message_courier_title')}
                  subtitle={courierMessageSubtitle}
                  iconName="bicycle-outline"
                  onPress={onCourierMessagePress}
                />
              ) : null}
            </Surface>
          </View>

          <CheckoutPaymentSection
            errorMessage={paymentErrorMessage}
            isPromoApplied={isPromoApplied}
            onPaymentPress={onPaymentPress}
            onPromoPress={onPromoPress}
            onPromoRemove={onPromoRemove}
            paymentIconName={paymentIconName}
            paymentSubtitle={paymentSubtitle}
            paymentTitle={paymentTitle}
            promoCode={promoCode}
            promoTitle={promoTitle}
            promoSubtitle={promoSubtitle}
          />

          {isDeliveryOrder ? (
            <CheckoutTipSection
              onCustomTipPress={onCustomTipPress}
              selectedTip={selectedTip}
              onSelectTip={onTipChange}
            />
          ) : null}

          {isPreviewPending ? (
            <View
              style={[
                styles.updatingRow,
                {
                  backgroundColor: colors.primarySoft,
                  borderRadius: shape.radius.control,
                  gap: spacing.sm,
                  padding: spacing.md,
                },
              ]}
            >
              <ActivityIndicator color={colors.primary} size="small" />
              <Text color={colors.textSubtle} variant="caption" weight="medium">
                {t('checkout_preview_updating')}
              </Text>
            </View>
          ) : null}

          {isPreviewEnabled && isPreviewError && !isPaymentBlocked ? (
            <ListStateView
              variant="error"
              title={t(
                isStoreClosedError
                  ? 'checkout_store_closed_title'
                  : 'checkout_preview_error_title',
              )}
              description={t(
                isStoreClosedError
                  ? 'checkout_store_closed_message'
                  : 'checkout_preview_error_message',
              )}
              actionLabel={t('generic_list_retry')}
              onActionPress={onRetryPreview}
              containerStyle={styles.stateBlock}
            />
          ) : null}

          {preview ? (
            <View style={[styles.section, { gap: spacing.md }]}>
              <View style={styles.summaryHeading}>
                <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
                  {t('checkout_summary_title')}
                </Text>
                <Text color={colors.textSubtle} variant="caption">
                  {t('checkout_summary_hint')}
                </Text>
              </View>
              <Surface outlined style={{ padding: spacing.lg }}>
                <CheckoutSummaryDetails
                  orderType={orderType}
                  pricing={preview.pricing}
                  totalLabel={totalLabel}
                />
              </Surface>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <CheckoutSummaryFooter
        isDisabled={!canPlaceOrder}
        isLoading={isPlacingOrder}
        onPlaceOrderPress={onPlaceOrderPress}
        totalLabel={totalLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginHorizontal: 'auto',
    width: '100%',
  },
  groupSurface: {
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 10,
  },
  section: {},
  stateBlock: {
    minHeight: 180,
  },
  summaryHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
