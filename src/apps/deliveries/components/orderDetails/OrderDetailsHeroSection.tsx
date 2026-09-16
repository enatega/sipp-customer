import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";

type Props = {
  logoUri?: string | null;
  orderCode?: string | null;
  orderedAt: string;
  storeName: string;
  storeAddress: string | null;
  statusMessage: string;
  statusTitle: string;
  statusTone: "warning" | "success" | "danger";
};

export default function OrderDetailsHeroSection({
  logoUri,
  orderCode,
  orderedAt,
  storeName,
  storeAddress,
  statusMessage,
  statusTitle,
  statusTone,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const trimmedAddress = storeAddress?.trim() ?? "";
  const normalizedOrderCode = orderCode?.trim() || null;
  const formattedDate = formatHeroOrderDateTime(orderedAt);
  const palette = statusTone === "success"
    ? { background: colors.successSoft, foreground: colors.successText, icon: "checkmark-circle" as const }
    : statusTone === "danger"
      ? { background: colors.dangerSoft, foreground: colors.dangerText, icon: "close-circle" as const }
      : { background: colors.primarySoft, foreground: colors.primary, icon: "time" as const };

  return (
    <View style={{ gap: spacing.lg }}>
      <View
        style={[
          styles.statusPanel,
          {
            backgroundColor: palette.background,
            borderRadius: shape.radius.surface,
            padding: spacing.lg,
          },
        ]}
      >
        <View style={[styles.statusIcon, { backgroundColor: colors.surface, borderRadius: shape.radius.pill }]}>
          <Ionicons color={palette.foreground} name={palette.icon} size={24} />
        </View>
        <View style={styles.statusCopy}>
          <Text color={palette.foreground} variant="cardTitle" weight="bold">
            {statusTitle}
          </Text>
          {statusMessage ? (
            <Text color={palette.foreground} variant="supporting" weight="medium">
              {statusMessage}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.storeRow}>
        <View
          style={[
            styles.logoWrap,
            { backgroundColor: colors.surfaceSunken, borderRadius: shape.radius.surface },
          ]}
        >
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImage} />
          ) : (
            <Ionicons color={colors.primary} name="storefront-outline" size={26} />
          )}
        </View>

        <View style={styles.storeCopy}>
          <Text color={colors.textStrong} numberOfLines={2} variant="cardTitle" weight="bold">
            {storeName}
          </Text>
          {trimmedAddress ? (
            <Text color={colors.textSubtle} numberOfLines={2} variant="supporting" weight="medium">
              {trimmedAddress}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.metaRow, { borderTopColor: colors.divider, paddingTop: spacing.md }]}> 
        {normalizedOrderCode ? (
          <View style={styles.metaItem}>
            <Ionicons color={colors.iconMuted} name="receipt-outline" size={17} />
            <Text color={colors.textSubtle} numberOfLines={1} variant="caption" weight="semiBold">
              {normalizedOrderCode}
            </Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Ionicons color={colors.iconMuted} name="calendar-outline" size={17} />
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption" weight="medium">
            {formattedDate}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    height: "100%",
    width: "100%",
  },
  logoWrap: {
    alignItems: "center",
    height: 64,
    justifyContent: "center",
    overflow: "hidden",
    width: 64,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minWidth: 0,
  },
  metaRow: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  statusCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  statusIcon: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  statusPanel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  storeCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  storeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
});

function formatHeroOrderDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
