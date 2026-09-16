import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import type { DeliveryOrderTimelineItem } from "../../api/ordersServiceTypes";
import OrderDetailsSection from "./OrderDetailsSection";

type Props = {
  items: DeliveryOrderTimelineItem[];
};

export default function OrderDetailsTimelineSection({ items }: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, shape, spacing } = useTheme();

  if (items.length === 0) {
    return null;
  }

  return (
    <OrderDetailsSection title={t("order_details_progress")}>
      <View style={{ gap: spacing.sm }}>
        {items.slice(0, 5).map((item, index) => {
          const isHighlighted = item.active || item.completed;
          const dotColor = item.completed || item.active ? colors.primary : colors.iconDisabled;

          return (
            <View key={`${item.key}-${index}`} style={styles.row}>
              <View style={styles.railColumn}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: item.completed ? colors.primary : colors.surface,
                      borderColor: dotColor,
                      borderRadius: shape.radius.pill,
                    },
                  ]}
                >
                  {item.completed ? (
                    <Ionicons color={colors.onPrimary} name="checkmark" size={12} />
                  ) : null}
                </View>
                {index < Math.min(items.length, 5) - 1 ? (
                  <View
                    style={[
                      styles.rail,
                      { backgroundColor: item.completed ? colors.primary : colors.divider },
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.copy}>
                <Text
                  color={isHighlighted ? colors.textStrong : colors.textSubtle}
                  variant="supporting"
                  weight={item.active ? "bold" : "medium"}
                >
                  {item.title}
                </Text>
                {item.completedAt ? (
                  <Text color={colors.textSubtle} variant="caption" weight="medium">
                    {formatTimelineTime(item.completedAt)}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </OrderDetailsSection>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 1,
    minHeight: 38,
    paddingBottom: 4,
  },
  dot: {
    alignItems: "center",
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  rail: {
    flex: 1,
    marginVertical: 3,
    width: 2,
  },
  railColumn: {
    alignItems: "center",
    alignSelf: "stretch",
    width: 24,
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
});

function formatTimelineTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
