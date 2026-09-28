import React from "react";
import { View, type ImageProps } from "react-native";
import Image from "../../../../../general/components/Image";
import Text from "../../../../../general/components/Text";
import { useTheme } from "../../../../../general/theme/theme";
import DeliveryOfferBadge from "../../DeliveryOfferBadge";
import { styles } from "../styles";

interface StoreImageProps {
  imageUrl: string;
  offer?: string | number | undefined;
  actionSlot?: React.ReactNode;
  isClosed?: boolean;
  closedLabel?: string;
  openLabel?: string;
  layout?: "compact" | "fullWidth" | "resultRow" | "home";
  resizeMode?: ImageProps["resizeMode"];
}

export default function StoreImage({
  imageUrl,
  offer,
  actionSlot,
  isClosed = false,
  closedLabel,
  openLabel,
  layout = "compact",
  resizeMode = "cover",
}: StoreImageProps) {
  const { colors, shape } = useTheme();
  const isResultRow = layout === "resultRow";
  const isCompact = layout === "compact";
  const isHome = layout === "home";

  return (
    <View
      style={[
        styles.imageContainer,
        isCompact ? styles.compactImageContainer : null,
        isHome ? styles.homeImageContainer : null,
        isResultRow ? styles.resultRowImageContainer : null,
        {
          borderTopLeftRadius: shape.radius.surface,
          borderBottomLeftRadius: isResultRow ? shape.radius.surface : undefined,
          borderTopRightRadius: isResultRow ? undefined : shape.radius.surface,
        },
      ]}
    >
      <Image
        resizeMode={resizeMode}
        source={{ uri: imageUrl }}
        style={styles.image}
      />

      {isClosed && !isHome ? (
        <View style={[styles.closedOverlay, { backgroundColor: colors.scrim }]}>
          <Text
            variant="caption"
            weight="bold"
            style={[styles.closedLabel, { color: colors.white }]}
          >
            {closedLabel}
          </Text>
        </View>
      ) : null}

      {isHome && (isClosed || openLabel) ? (
        <View style={[styles.availabilityBadge, { backgroundColor: isClosed ? colors.surfaceElevated : colors.successSoft }]}>
          <View style={[styles.availabilityDot, { backgroundColor: isClosed ? colors.textSubtle : colors.success }]} />
          <Text variant="caption" weight="semiBold" color={isClosed ? colors.text : colors.successText}>
            {isClosed ? closedLabel : openLabel}
          </Text>
        </View>
      ) : null}

      {offer ? (
        <DeliveryOfferBadge
          label={String(offer)}
          size={isResultRow || isHome ? "compact" : "regular"}
          style={styles.offerBadge}
        />
      ) : null}

      {actionSlot ?? null}
    </View>
  );
}
