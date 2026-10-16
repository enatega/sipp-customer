import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import type {
  DeliveryOrderStatus,
} from "../../api/ordersServiceTypes";
import { getOrderStatusPresentation } from "../orders/orderPresentation";

type Props = {
  status: DeliveryOrderStatus;
};

export default function OrderTrackingModernProgressCard({
  status,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors } = useTheme();
  const presentation = getOrderStatusPresentation(status, t);
  const completedSteps = getCompletedSteps(status);
  const isPending = status?.toLowerCase?.() === "pending";
  const accentColor = presentation.tone === "success"
    ? colors.success
    : presentation.tone === "danger"
      ? colors.danger
      : presentation.tone === "warning"
        ? colors.warning
        : colors.primary;
  const stageLabels = [
    t(isPending ? "orders_status_pending" : status === "scheduled" ? "orders_status_scheduled" : "orders_status_confirmed"),
    t("orders_status_preparing"),
    t("orders_status_on_the_way"),
    t("orders_status_delivered"),
  ];

  return (
    <View style={styles.container}>
      <Text color={colors.text} style={styles.heading} weight="bold">
        {t("order_tracking_progress")}
      </Text>

      <View accessibilityRole="progressbar" style={styles.journeyRow}>
        {stageLabels.map((label, index) => {
          const step = index + 1;
          const isComplete = step <= completedSteps;
          const isActive = isPending && index === 0;
          return (
            <View key={label} style={styles.stage}>
              <View style={styles.stageRailRow}>
                {index > 0 ? (
                  <View style={[styles.rail, { backgroundColor: isComplete ? accentColor : colors.border }]} />
                ) : null}
                <View
                  style={[
                    styles.stageNode,
                    {
                      backgroundColor: isComplete ? accentColor : colors.surface,
                      borderColor: isComplete || isActive ? accentColor : colors.border,
                    },
                  ]}
                >
                  {isComplete ? <Ionicons color={colors.onPrimary} name="checkmark" size={12} /> : null}
                  {isActive ? <View style={[styles.activeDot, { backgroundColor: accentColor }]} /> : null}
                </View>
                {index < stageLabels.length - 1 ? (
                  <View style={[styles.rail, { backgroundColor: step < completedSteps ? accentColor : colors.border }]} />
                ) : null}
              </View>
              <Text
                color={isComplete || isActive ? colors.text : colors.textSubtle}
                numberOfLines={2}
                style={styles.stageLabel}
                weight={isComplete || isActive ? "semiBold" : "regular"}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getCompletedSteps(status: DeliveryOrderStatus) {
  const normalized = status?.toLowerCase?.() ?? "";
  if (["cancelled", "failed", "rejected"].includes(normalized)) return 0;
  if (normalized === "pending") return 0;
  if (normalized === "delivered") return 4;
  if (["picked_up", "out_for_delivery", "arrived"].includes(normalized)) return 3;
  if (normalized === "delayed") return 2;
  if (["preparing", "ready", "rider_assigned"].includes(normalized)) return 2;
  return 1;
}

const styles = StyleSheet.create({
  activeDot: { borderRadius: 4, height: 7, width: 7 },
  container: {
    paddingTop: 18,
  },
  heading: {
    fontSize: 20,
    letterSpacing: -0.35,
    lineHeight: 27,
  },
  journeyRow: { flexDirection: "row", marginHorizontal: -7, marginTop: 20 },
  rail: { flex: 1, height: 2.5 },
  stage: { alignItems: "center", flex: 1 },
  stageLabel: { fontSize: 9, lineHeight: 12, marginTop: 7, minHeight: 24, paddingHorizontal: 2, textAlign: "center" },
  stageNode: { alignItems: "center", borderRadius: 10, borderWidth: 2, height: 20, justifyContent: "center", width: 20 },
  stageRailRow: { alignItems: "center", flexDirection: "row", width: "100%" },
});
