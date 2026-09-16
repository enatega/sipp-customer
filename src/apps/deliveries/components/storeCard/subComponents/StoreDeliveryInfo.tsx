import React from "react";
import { View } from "react-native";
import Icon from "../../../../../general/components/Icon";
import Text from "../../../../../general/components/Text";
import { useDeliveriesCurrencyLabel } from "../../../../../general/stores/useAppConfigStore";
import { useTheme } from "../../../../../general/theme/theme";
import { styles } from "../styles";

interface StoreDeliveryInfoProps {
  price?: number | null;
  deliveryTime?: number | string | null;
  distance?: number | null;
  fallbackLabels?: {
    price: string;
    deliveryTime: string;
    distance: string;
  };
}

function formatDeliveryTime(value: number | string) {
  if (typeof value === "string") {
    return value;
  }

  return `${value} mins`;
}

function formatPrice(value: number, currencyLabel: string) {
  return `${currencyLabel} ${value}`;
}

function toPositiveNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

export default function StoreDeliveryInfo({
  price,
  deliveryTime,
  distance,
  fallbackLabels,
}: StoreDeliveryInfoProps) {
  const { colors, spacing } = useTheme();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const deliveryTimeValue = toPositiveNumber(deliveryTime);
  const distanceValue = toPositiveNumber(distance);
  const priceValue = toPositiveNumber(price);
  const priceLabel =
    priceValue != null
      ? formatPrice(priceValue, currencyLabel)
      : fallbackLabels?.price;
  const deliveryTimeLabel =
    deliveryTimeValue != null && deliveryTime != null
      ? formatDeliveryTime(deliveryTime)
      : fallbackLabels?.deliveryTime;
  const distanceLabel =
    distanceValue != null ? `${distanceValue} km` : fallbackLabels?.distance;
  const infoItems = [
    priceLabel
      ? {
          iconName: "bicycle",
          iconType: "Ionicons" as const,
          label: priceLabel,
        }
      : null,
    deliveryTimeLabel
      ? {
          iconName: "time-outline",
          iconType: "Ionicons" as const,
          label: deliveryTimeLabel,
        }
      : null,
    distanceLabel
      ? {
          iconName: "location-outline",
          iconType: "Ionicons" as const,
          label: distanceLabel,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item != null);

  if (infoItems.length === 0) {
    return null;
  }

  return (
    <View
      style={[styles.deliveryInfoRow, { gap: spacing.md }]}
    >
      {infoItems.map((item) => (
        <View key={`${item.iconName}-${item.label}`} style={styles.infoItem}>
          <Icon
            type={item.iconType}
            name={item.iconName}
            size={16}
            color={colors.textSubtle}
          />
          <Text
            numberOfLines={1}
            variant="caption"
            weight="medium"
            style={[styles.infoText, { color: colors.textSubtle }]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
