import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import type {
  DeliveryOrderLogItem,
  DeliveryOrderTimelineItem,
} from "../../api/ordersServiceTypes";
import {
  getOrderTrackingTimelineEntries,
} from "../../utils/orderTracking/orderTrackingUtils";
import OrderTrackingTimelineItem from "./OrderTrackingTimelineItem";

type Props = {
  timeline: DeliveryOrderTimelineItem[];
  orderLogs?: DeliveryOrderLogItem[] | null;
};

export default function OrderTrackingTimelineSection({ timeline, orderLogs }: Props) {
  const { t } = useTranslation("deliveries");
  const entries = getOrderTrackingTimelineEntries(timeline, orderLogs, t);

  return (
    <View style={styles.container}>
      {entries.map((item) => (
        <OrderTrackingTimelineItem
          completedAt={item.completedAt}
          key={item.key}
          stepKey={item.stepKey}
          title={item.title}
          tone={item.tone}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
