import React, { useMemo, useState } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../../../general/components/ScreenHeader";
import { showToast } from '../../../../general/components/AppToast';
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import {
  useOrderAgainAction,
  useCancelOrder,
  useOrderDetails,
  useOrderReviewQuery,
  useOrderStatusSocketSync,
} from "../../hooks";
import type { DeliveriesStackParamList } from "../../navigation/types";
import OrderDetailsErrorState from "./OrderDetailsErrorState";
import OrderDetailsActionsSection from "./OrderDetailsActionsSection";
import OrderDetailsHeroSection from "./OrderDetailsHeroSection";
import IncreaseTipBottomSheet from "./IncreaseTipBottomSheet";
import OrderDetailsLoadingSkeleton from "./OrderDetailsLoadingSkeleton";
import OrderDetailsScheduledSection from "./OrderDetailsScheduledSection";
import ExtendableOrderSummary from "../orderSummary/ExtendableOrderSummary";
import {
  formatCurrency,
} from "../../utils/orderDetails/orderDetailsUtils";
import ExtendableOrderItems from "../orderItems/ExtendableOrderItems";
import OrderDetailsSection from "./OrderDetailsSection";
import CartStoreConflictModal from "../cart/CartStoreConflictModal";
import { useWindowClass } from "../../../../general/hooks/useWindowClass";
import OrderDetailsTimelineSection from "./OrderDetailsTimelineSection";

type Props = {
  navigation: NativeStackNavigationProp<
    DeliveriesStackParamList,
    "OrderDetailsScreen"
  >;
  orderId: string;
};

export default function MainContainer({ navigation, orderId }: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, elevation, shape, spacing, typography } = useTheme();
  const { gutter } = useWindowClass();
  useOrderStatusSocketSync(orderId);
  const orderDetailsQuery = useOrderDetails(orderId);
  const orderStatus = orderDetailsQuery.data?.status;
  const isRateableStatus =
    orderStatus === "delivered" || orderStatus === "cancelled";
  const orderReviewQuery = useOrderReviewQuery(orderId, {
    enabled: isRateableStatus,
  });
  const hasSubmittedRating = Boolean(orderReviewQuery.data?.is_reviewed);
  const orderAgainAction = useOrderAgainAction(orderDetailsQuery.data);
  const cancelOrder = useCancelOrder();
  const [isIncreaseTipVisible, setIsIncreaseTipVisible] = useState(false);
  const [tipAmount, setTipAmount] = useState("5.00");
  const order = orderDetailsQuery.data;
  const normalizedOrderCode = useMemo(() => {
    const rawCode =
      order?.orderCode?.trim() ||
      order?.summary.orderNumber?.trim() ||
      order?.orderId;

    if (!rawCode) {
      return null;
    }

    const cleanedCode = rawCode
      .replace(/^order\s*#*\s*/i, "")
      .replace(/^#+\s*/, "")
      .trim();

    if (!cleanedCode) {
      return null;
    }

    return t("order_details_reference", { number: cleanedCode });
  }, [order?.orderCode, order?.orderId, order?.summary.orderNumber, t]);
  const paymentMethodLabel = useMemo(() => {
    const value = order?.paymentMethod?.trim();

    if (!value) {
      return t("order_details_unavailable");
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }, [order?.paymentMethod, t]);
  const isPaid = order?.paymentStatus?.trim().toLowerCase() === "paid";

  if (orderDetailsQuery.isLoading) {
    return <OrderDetailsLoadingSkeleton />;
  }

  if (orderDetailsQuery.isError || !order) {
    return (
      <OrderDetailsErrorState
        isRetrying={orderDetailsQuery.isFetching}
        onRetry={() => {
          void orderDetailsQuery.refetch();
        }}
      />
    );
  }

  const isPastOrder =
    order.status === "delivered"
    || order.status === "cancelled"
    || order.status === "rejected"
    || order.status === "failed";
  const shouldShowRateOrder = isRateableStatus;
  const shouldShowTrackProgress = !isPastOrder;
  const shouldShowIncreaseTip = !isPastOrder;
  const shouldShowCancelOrder =
    order.status === 'pending' || order.status === 'scheduled';
  const shouldShowOrderAgain = true; // in all cases for the time being
  const statusTone =
    order.status === "delivered"
      ? "success"
      : order.status === "cancelled" ||
        order.status === "rejected" ||
        order.status === "failed"
        ? "danger"
        : "warning";

  const cardStyle = [
    styles.card,
    elevation.subtle,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: shape.radius.hero,
      padding: spacing.lg,
    },
  ] as const;

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}> 
      <ScreenHeader
        title={t("order_details_title")}
        style={{ backgroundColor: colors.canvas }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.lg, paddingHorizontal: gutter, paddingBottom: spacing.xxxl },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={cardStyle}>
          <OrderDetailsHeroSection
            logoUri={order.store.logo ?? order.store.image}
            orderCode={normalizedOrderCode}
            orderedAt={order.orderedAt}
            storeName={order.store.name}
            storeAddress={order.store.address}
            statusMessage={order.statusMessage}
            statusTitle={order.statusTitle}
            statusTone={statusTone}
          />
        </View>

        {!isPastOrder && order.timeline?.length > 0 ? (
          <View style={cardStyle}>
            <OrderDetailsTimelineSection items={order.timeline ?? []} />
          </View>
        ) : null}

        {order.scheduledAt ? (
          <View style={cardStyle}>
            <OrderDetailsScheduledSection scheduledAt={order.scheduledAt} />
          </View>
        ) : null}

        <View style={cardStyle}>
          <ExtendableOrderItems orderItems={order.orderItems} />
        </View>

        <View style={cardStyle}>
          <ExtendableOrderSummary
            defaultExpanded
            deliveryDetails={order.deliveryDetails}
            isCollapsible={false}
            orderCode={order.orderCode}
            orderId={order.orderId}
            summary={order.summary}
          />
        </View>

        <View style={cardStyle}>
          <OrderDetailsSection title={t("order_details_payment_details")}>
            <View style={styles.paymentRow}>
              <View style={styles.paymentLeft}>
                <View
                  style={[
                    styles.paymentIconWrap,
                    { backgroundColor: colors.successSoft },
                  ]}
                >
                  <Ionicons color={colors.successText} name="wallet-outline" size={28} />
                </View>

                <View style={styles.paymentTextGroup}>
                  <Text
                    color={colors.mutedText}
                    style={{
                      fontSize: typography.size.md,
                      lineHeight: typography.lineHeight.md,
                    }}
                    weight="medium"
                  >
                    {t("order_details_payment_method")}
                  </Text>
                  <View style={styles.paymentValueRow}>
                    <Text
                      color={colors.text}
                      style={{
                        fontSize: typography.size.md,
                        lineHeight: typography.lineHeight.lg,
                      }}
                      weight="bold"
                    >
                      {paymentMethodLabel}
                    </Text>
                    <Text
                      color={colors.text}
                      style={{
                        fontSize: typography.size.md,
                        lineHeight: typography.lineHeight.md,
                      }}
                      weight="semiBold"
                    >
                      {formatCurrency(order?.summary?.totalAmount)}
                    </Text>
                  </View>

                  {isPaid ? (
                    <View
                      style={[
                        styles.paidBadge,
                        { backgroundColor: colors.successSoft },
                      ]}
                    >
                      <Text
                        color={colors.successText}
                        style={{
                          fontSize: typography.size.sm2,
                          lineHeight: typography.lineHeight.sm2,
                        }}
                        weight="semiBold"
                      >
                        {t("order_details_paid")}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </OrderDetailsSection>
        </View>

        <OrderDetailsActionsSection
          hasSubmittedRating={hasSubmittedRating}
          isOrderAgainLoading={orderAgainAction.isSubmitting}
          isCancelOrderLoading={cancelOrder.isPending}
          onCancelOrder={shouldShowCancelOrder ? () => {
            Alert.alert(
              t('order_cancel_title'),
              t('order_cancel_message'),
              [
                { text: t('order_cancel_keep'), style: 'cancel' },
                {
                  text: t('order_cancel_confirm'),
                  style: 'destructive',
                  onPress: () => {
                    void cancelOrder
                      .mutateAsync(orderId)
                      .then(() => orderDetailsQuery.refetch())
                      .catch((error) => {
                        showToast.error(
                          t('order_cancel_failed'),
                          error instanceof Error ? error.message : t('order_cancel_failed'),
                        );
                      });
                  },
                },
              ],
            );
          } : undefined}
          onIncreaseTip={shouldShowIncreaseTip ? () => setIsIncreaseTipVisible(true) : undefined}
          onOrderAgain={() => {
            void orderAgainAction.handleOrderAgain();
          }}
          shouldShowRateOrder={shouldShowRateOrder}
          shouldShowTrackProgress={shouldShowTrackProgress}
          shouldShowOrderAgain={shouldShowOrderAgain}
          shouldShowCancelOrder={shouldShowCancelOrder}
          navigation={navigation}
          orderId={orderId}
          storeName={order.store.name}
        />
      </ScrollView>

      <IncreaseTipBottomSheet
        isVisible={isIncreaseTipVisible}
        onChangeTipAmount={setTipAmount}
        onClose={() => setIsIncreaseTipVisible(false)}
        onDone={() => setIsIncreaseTipVisible(false)}
        tipAmount={tipAmount}
      />

      <CartStoreConflictModal
        isSubmitting={orderAgainAction.conflictResolution.isResolving}
        onCancel={orderAgainAction.conflictResolution.cancelResolution}
        onConfirm={() => {
          void orderAgainAction.conflictResolution.confirmResolution();
        }}
        prompt={orderAgainAction.conflictResolution.prompt}
        visible={orderAgainAction.conflictResolution.isVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingTop: 8,
  },
  paidBadge: {
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paymentIconWrap: {
    alignItems: "center",
    borderRadius: 18,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  paymentLeft: {
    alignItems: "center",
    columnGap: 16,
    flex: 1,
    flexDirection: "row",
  },
  paymentRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  paymentTextGroup: {
    flex: 1,
    gap: 8,
  },
  paymentValueRow: {
    alignItems: "center",
    columnGap: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  screen: {
    flex: 1,
  },
});
