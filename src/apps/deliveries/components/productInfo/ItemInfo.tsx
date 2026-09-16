import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import DeliveryOfferBadge from "../DeliveryOfferBadge";

type Props = {
  categoryLabel?: string | null;
  name: string;
  description?: string | null;
  isAvailable: boolean;
  priceLabel: string;
  originalPriceLabel?: string | null;
  offerLabel?: string | null;
  ratingLabel?: string | null;
  unavailableLabel: string;
};

export default function ItemInfo({
  categoryLabel,
  name,
  description,
  isAvailable,
  priceLabel,
  originalPriceLabel,
  offerLabel,
  ratingLabel,
  unavailableLabel,
}: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={[styles.titleRow, { gap: spacing.md }]}>
        <Text
          accessibilityRole="header"
          numberOfLines={3}
          style={styles.title}
          variant="title"
          weight="extraBold"
        >
          {name}
        </Text>

        <View style={styles.priceBlock}>
          {originalPriceLabel ? (
            <Text color={colors.textSubtle} style={styles.originalPrice} variant="caption">
              {originalPriceLabel}
            </Text>
          ) : null}
          <Text color={colors.textStrong} variant="numeric" weight="extraBold">
            {priceLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.badges, { gap: spacing.sm }]}>
        {offerLabel ? <DeliveryOfferBadge label={offerLabel} size="compact" /> : null}
        {!isAvailable ? (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: colors.dangerSoft,
                borderRadius: shape.radius.pill,
                gap: spacing.xs,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: colors.danger, borderRadius: shape.radius.pill },
              ]}
            />
            <Text color={colors.dangerText} variant="badge" weight="bold">
              {unavailableLabel}
            </Text>
          </View>
        ) : null}
        {ratingLabel ? (
          <View
            style={[
              styles.metadataBadge,
              {
                backgroundColor: colors.warningSoft,
                borderRadius: shape.radius.pill,
                gap: spacing.xs,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <Ionicons color={colors.warning} name="star" size={12} />
            <Text color={colors.warningText} variant="badge" weight="bold">
              {ratingLabel}
            </Text>
          </View>
        ) : null}
        {categoryLabel ? (
          <View
            style={[
              styles.metadataBadge,
              {
                backgroundColor: colors.surfaceSunken,
                borderRadius: shape.radius.pill,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <Text color={colors.textSubtle} numberOfLines={1} variant="badge" weight="semiBold">
              {categoryLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {description ? (
        <Text color={colors.textSubtle} variant="body">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  badges: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metadataBadge: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 26,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  priceBlock: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  statusBadge: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 26,
  },
  statusDot: {
    height: 6,
    width: 6,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
});
