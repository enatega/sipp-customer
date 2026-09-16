import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import PressableScale from "../../../../general/components/PressableScale";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import ExtendableOrderItems from "../orderItems/ExtendableOrderItems";
import ExtendableOrderSummary from "../orderSummary/ExtendableOrderSummary";
import OrderDetailsSection from "../orderDetails/OrderDetailsSection";
import OrderDetailsSummaryRow from "../orderDetails/OrderDetailsSummaryRow";
import OrderTrackingInfoRow from "./OrderTrackingInfoRow";
import type { OrderTrackingViewModel } from "./useOrderTrackingViewModel";
import { getPreviewImages } from "./OrderTrackingModern.shared";

type Props = {
  isOrderItemsExpanded: boolean;
  onToggleItems: () => void;
  order: NonNullable<OrderTrackingViewModel["order"]>;
  viewModel: OrderTrackingViewModel;
};

export default function OrderTrackingModernSections({
  isOrderItemsExpanded,
  onToggleItems,
  order,
  viewModel,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, shape } = useTheme();
  const isPickup = order.orderType === "pickup";
  const locationTitle = isPickup
    ? order.store.name || t("order_tracking_collection_details")
    : order.deliveryDetails.label || t("order_tracking_delivery_details");
  const locationSubtitle = isPickup
    ? order.store.address
    : order.deliveryDetails.address;
  const expectsCourier = [
    "rider_assigned",
    "picked_up",
    "out_for_delivery",
    "arrived",
  ].includes(order.status?.toLowerCase?.() ?? "");

  return (
    <>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <SectionTitle>{t(isPickup ? "order_tracking_collection_details" : "order_tracking_delivery_details")}</SectionTitle>
      <OrderTrackingInfoRow
        containerStyle={styles.rowItem}
        iconName={isPickup ? "storefront-outline" : "home-outline"}
        isCompact
        isIconContained={false}
        onPress={viewModel.onOpenOrderDetails}
        subtitle={locationSubtitle || t("order_details_unavailable")}
        subtitleNumberOfLines={2}
        title={locationTitle}
      />

      {order.rider || expectsCourier ? (
        <View style={[styles.courierPanel, { backgroundColor: colors.surfaceSunken, borderRadius: shape.radius.surface }]}> 
          {viewModel.riderAvatarUri ? (
            <Image source={{ uri: viewModel.riderAvatarUri }} style={styles.courierAvatar} />
          ) : (
            <View style={[styles.courierAvatarFallback, { backgroundColor: colors.blue100 }]}> 
              <Ionicons color={colors.primary} name="bicycle-outline" size={22} />
            </View>
          )}
          <View style={styles.courierCopy}>
            <Text color={colors.textSubtle} style={styles.courierEyebrow} weight="medium">
              {t("order_tracking_courier_role")}
            </Text>
            <Text color={colors.text} numberOfLines={1} style={styles.courierName} weight="semiBold">
              {order.rider ? viewModel.riderName : t("order_tracking_courier_pending")}
            </Text>
          </View>
          {viewModel.canContactCourier ? (
            <PressableScale
              accessibilityLabel={t("order_tracking_message_courier")}
              accessibilityRole="button"
              onPress={viewModel.onContactCourierPress}
              style={[styles.messageButton, { backgroundColor: colors.primary, borderRadius: shape.radius.pill }]}
            >
              <Ionicons color={colors.onPrimary} name="chatbubble-ellipses-outline" size={19} />
            </PressableScale>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <SectionTitle>{t("order_tracking_order_items")}</SectionTitle>
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ expanded: isOrderItemsExpanded }}
        onPress={onToggleItems}
        style={[styles.itemsRow, { borderRadius: shape.radius.control }]}
      >
        <View style={styles.itemsRowContent}>
          <View style={styles.avatarsRow}>
            {getPreviewImages(order.orderItems.previewImages).map((imageUri, index) => (
              <Image
                key={`${imageUri}-${index}`}
                source={{ uri: imageUri }}
                style={[
                  styles.avatar,
                  { borderColor: colors.surface },
                  index > 0 && styles.avatarOverlap,
                ]}
              />
            ))}
            {order.orderItems.additionalItemsCount > 0 ? (
              <View
                style={[
                  styles.avatar,
                  styles.avatarCount,
                  styles.avatarOverlap,
                  { backgroundColor: colors.surfaceSunken, borderColor: colors.surface },
                ]}
              >
                <Text color={colors.mutedText} style={styles.avatarCountText} weight="medium">
                  +{order.orderItems.additionalItemsCount}
                </Text>
              </View>
            ) : null}
          </View>
          <Text color={colors.text} numberOfLines={1} style={styles.orderItemsLabel} weight="medium">
            {order.orderItems.summaryLabel || t("order_tracking_order_items")}
          </Text>
        </View>
        <Ionicons
          color={colors.iconMuted}
          name={isOrderItemsExpanded ? "chevron-up" : "chevron-down"}
          size={19}
        />
      </PressableScale>
      {isOrderItemsExpanded ? (
        <View style={styles.itemsExpandedContainer}>
          <ExtendableOrderItems
            collapsedVariant="tracking"
            hideHeading
            isCollapsible={false}
            orderItems={order.orderItems}
          />
        </View>
      ) : null}

      {viewModel.shouldShowNotes ? (
        <View style={styles.notesWrap}>
          <OrderDetailsSection title={t("order_details_notes")}>
            {viewModel.restaurantNote ? (
              <OrderDetailsSummaryRow
                label={t("order_details_restaurant_note")}
                value={viewModel.restaurantNote}
              />
            ) : null}
            {viewModel.courierNote ? (
              <OrderDetailsSummaryRow
                label={t("order_details_courier_note")}
                value={viewModel.courierNote}
              />
            ) : null}
          </OrderDetailsSection>
        </View>
      ) : null}

      <ExtendableOrderSummary
        deliveryDetails={order.deliveryDetails}
        orderCode={order.orderCode}
        orderId={order.orderId}
        summary={order.summary}
        title={t("order_tracking_summary")}
      />
    </>
  );
}

function SectionTitle({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text color={colors.text} style={styles.sectionTitle} weight="bold">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: 19, borderWidth: 2, height: 38, width: 38 },
  avatarCount: { alignItems: "center", justifyContent: "center" },
  avatarCountText: { fontSize: 13, lineHeight: 18 },
  avatarOverlap: { marginLeft: -10 },
  avatarsRow: { alignItems: "center", flexDirection: "row" },
  courierAvatar: { borderRadius: 23, height: 46, width: 46 },
  courierAvatarFallback: { alignItems: "center", borderRadius: 23, height: 46, justifyContent: "center", width: 46 },
  courierCopy: { flex: 1, minWidth: 0 },
  courierEyebrow: { fontSize: 11, lineHeight: 15 },
  courierName: { fontSize: 16, lineHeight: 22, marginTop: 1 },
  courierPanel: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 10, padding: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginTop: 20 },
  itemsExpandedContainer: { marginHorizontal: -4, paddingTop: 2 },
  itemsRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 58, paddingHorizontal: 4, paddingVertical: 8 },
  itemsRowContent: { alignItems: "center", flex: 1, flexDirection: "row", gap: 12, minWidth: 0, paddingRight: 10 },
  messageButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  notesWrap: { marginBottom: 10, marginTop: 22 },
  orderItemsLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
  rowItem: { paddingHorizontal: 0 },
  sectionTitle: { fontSize: 19, letterSpacing: -0.25, lineHeight: 26, paddingTop: 18 },
});
