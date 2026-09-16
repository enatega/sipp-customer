import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import PressableScale from "../../../../general/components/PressableScale";
import Text from "../../../../general/components/Text";
import { useReducedMotion } from "../../../../general/hooks/useReducedMotion";
import { useDeliveriesCurrencyCode } from "../../../../general/stores/useAppConfigStore";
import { useTheme } from "../../../../general/theme/theme";
import type { DeliveryOrderListItem } from "../../api/ordersServiceTypes";
import { getOrderStatusPresentation } from "./orderPresentation";

type Props = {
  order: DeliveryOrderListItem;
  onPress?: (order: DeliveryOrderListItem) => void;
  title?: string;
};

const PROGRESS_SEGMENTS = 4;

function formatOrderDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatOrderPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

const OrderListCard = ({ order, onPress, title }: Props) => {
  const { t } = useTranslation("deliveries");
  const { colors, elevation, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const currencyCode = useDeliveriesCurrencyCode();
  const imageUri = order.storeImage ?? order.storeLogo ?? undefined;
  const status = getOrderStatusPresentation(order.orderStatus, t);
  const statusOpacity = useRef(new Animated.Value(1)).current;
  const statusTranslate = useRef(new Animated.Value(0)).current;
  const toneColors = status.tone === "success"
    ? { background: colors.successSoft, foreground: colors.successText }
    : status.tone === "danger"
      ? { background: colors.dangerSoft, foreground: colors.dangerText }
      : status.tone === "warning"
        ? { background: colors.warningSoft, foreground: colors.warningText }
        : { background: colors.primarySoft, foreground: colors.primary };

  useEffect(() => {
    if (isReducedMotionEnabled) {
      statusOpacity.setValue(1);
      statusTranslate.setValue(0);
      return;
    }

    statusOpacity.setValue(0);
    statusTranslate.setValue(3);
    Animated.parallel([
      Animated.timing(statusOpacity, {
        duration: motion.duration.quick,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(statusTranslate, {
        duration: motion.duration.quick,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    isReducedMotionEnabled,
    motion.duration.quick,
    order.orderStatus,
    statusOpacity,
    statusTranslate,
  ]);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${order.storeName}, ${status.label}`}
      hitSlop={4}
      onPress={onPress ? () => onPress(order) : undefined}
      style={[
        styles.container,
        elevation.subtle,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: shape.radius.hero,
          padding: spacing.lg,
        },
      ]}
    >
      <View style={styles.topRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={[styles.image, { borderRadius: shape.radius.surface }]} />
        ) : (
          <View
            style={[
              styles.imageFallback,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: shape.radius.surface,
              },
            ]}
          >
            <Text color={colors.primary} variant="cardTitle" weight="extraBold">
              {order.storeName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.primaryContent}>
          <View style={styles.titleRow}>
            <Text
              color={colors.textStrong}
              numberOfLines={2}
              style={styles.name}
              variant="cardTitle"
              weight="bold"
            >
              {title ?? order.storeName}
            </Text>
            <Text
              color={colors.textStrong}
              numberOfLines={1}
              style={styles.price}
              weight="bold"
            >
              {formatOrderPrice(order.orderPrice, currencyCode)}
            </Text>
          </View>

          <Text color={colors.textSubtle} variant="caption" weight="medium">
            {formatOrderDate(order.orderedAt)}
          </Text>

          <Animated.View
            style={[
              styles.statusPill,
              {
                backgroundColor: toneColors.background,
                borderRadius: shape.radius.pill,
                opacity: statusOpacity,
                transform: [{ translateY: statusTranslate }],
              },
            ]}
          >
            <MaterialCommunityIcons color={toneColors.foreground} name={status.icon} size={15} />
            <Text
              color={toneColors.foreground}
              numberOfLines={1}
              style={styles.statusLabel}
              variant="caption"
              weight="semiBold"
            >
              {status.label}
            </Text>
          </Animated.View>
        </View>
      </View>

      {status.progressStep ? (
        <View
          accessibilityLabel={status.label}
          accessibilityRole="progressbar"
          style={[styles.progressRow, { gap: spacing.xs }]}
        >
          {Array.from({ length: PROGRESS_SEGMENTS }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: index < status.progressStep! ? colors.primary : colors.surfaceSunken,
                  borderRadius: shape.radius.pill,
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.divider, marginTop: spacing.md, paddingTop: spacing.md }]}>
        <Text color={colors.primary} variant="label" weight="semiBold">
          {t("orders_view_details")}
        </Text>
        <MaterialCommunityIcons color={colors.primary} name="arrow-right" size={20} />
      </View>
    </PressableScale>
  );
};

export default OrderListCard;

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  footer: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  image: {
    height: 72,
    width: 72,
  },
  imageFallback: {
    alignItems: "center",
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  name: {
    flex: 1,
    minWidth: 0,
  },
  price: {
    flexShrink: 0,
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 10,
  },
  primaryContent: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  progressRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  progressSegment: {
    flex: 1,
    height: 4,
  },
  statusLabel: {
    flexShrink: 1,
  },
  statusPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
});
