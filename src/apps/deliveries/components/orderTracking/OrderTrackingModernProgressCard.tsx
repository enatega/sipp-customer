import React, { useMemo } from "react";
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
  progressTimeLabel: string;
  status: DeliveryOrderStatus;
};

export default function OrderTrackingModernProgressCard({
  progressTimeLabel,
  status,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors } = useTheme();
  const presentation = useMemo(
    () => getOrderStatusPresentation(status, t),
    [status, t],
  );
  const completedSteps = getCompletedSteps(status);
  const accentColor = presentation.tone === "success"
    ? colors.success
    : presentation.tone === "danger"
      ? colors.danger
      : presentation.tone === "warning"
        ? colors.warning
        : colors.primary;
  const stageLabels = [
    t("orders_status_confirmed"),
    t("orders_status_preparing"),
    t("orders_status_on_the_way"),
    t("orders_status_delivered"),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text color={colors.text} style={styles.heading} weight="bold">
          {t("order_tracking_progress")}
        </Text>
        <View style={[styles.collapseHint, { backgroundColor: colors.iconMuted }]} />
      </View>

      <View accessibilityRole="progressbar" style={styles.journeyRow}>
        {stageLabels.map((label, index) => {
          const step = index + 1;
          const isComplete = step <= completedSteps;
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
                      borderColor: isComplete ? accentColor : colors.border,
                    },
                  ]}
                >
                  {isComplete ? <Ionicons color={colors.onPrimary} name="checkmark" size={12} /> : null}
                </View>
                {index < stageLabels.length - 1 ? (
                  <View style={[styles.rail, { backgroundColor: step < completedSteps ? accentColor : colors.border }]} />
                ) : null}
              </View>
              <Text
                color={isComplete ? colors.text : colors.textSubtle}
                numberOfLines={2}
                style={styles.stageLabel}
                weight={isComplete ? "semiBold" : "regular"}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.nextStepBand, { backgroundColor: colors.successSoft }]}> 
        <View style={[styles.nextStepIcon, { backgroundColor: colors.green100 }]}> 
          <Ionicons color={colors.success} name="checkmark" size={20} />
        </View>
        <View style={styles.nextStepCopy}>
          <Text color={colors.text} numberOfLines={2} style={styles.nextStep} weight="semiBold">
            {presentation.label}
          </Text>
        </View>
        <Text color={colors.textSubtle} style={styles.time} weight="medium">
          {progressTimeLabel}
        </Text>
      </View>
    </View>
  );
}

function getCompletedSteps(status: DeliveryOrderStatus) {
  const normalized = status?.toLowerCase?.() ?? "";
  if (["cancelled", "failed", "rejected"].includes(normalized)) return 0;
  if (normalized === "delivered") return 4;
  if (["picked_up", "out_for_delivery", "arrived"].includes(normalized)) return 3;
  if (normalized === "delayed") return 2;
  if (["preparing", "ready", "rider_assigned"].includes(normalized)) return 2;
  return 1;
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
  },
  collapseHint: { borderRadius: 999, height: 2, width: 12 },
  heading: {
    fontSize: 20,
    letterSpacing: -0.35,
    lineHeight: 27,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  journeyRow: { flexDirection: "row", marginHorizontal: -7, marginTop: 20 },
  nextStep: { fontSize: 14, lineHeight: 19 },
  nextStepBand: { alignItems: "center", borderRadius: 16, flexDirection: "row", gap: 12, marginTop: 20, minHeight: 62, paddingHorizontal: 14, paddingVertical: 10 },
  nextStepCopy: { flex: 1, minWidth: 0 },
  nextStepIcon: { alignItems: "center", borderRadius: 21, height: 42, justifyContent: "center", width: 42 },
  rail: { flex: 1, height: 2.5 },
  stage: { alignItems: "center", flex: 1 },
  stageLabel: { fontSize: 9, lineHeight: 12, marginTop: 7, minHeight: 24, paddingHorizontal: 2, textAlign: "center" },
  stageNode: { alignItems: "center", borderRadius: 10, borderWidth: 2, height: 20, justifyContent: "center", width: 20 },
  stageRailRow: { alignItems: "center", flexDirection: "row", width: "100%" },
  time: {
    fontSize: 12,
    lineHeight: 17,
  },
});
