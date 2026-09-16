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
  layout?: "compact" | "fullWidth" | "resultRow";
  resizeMode?: ImageProps["resizeMode"];
}

export default function StoreImage({
  imageUrl,
  offer,
  actionSlot,
  isClosed = false,
  closedLabel,
  layout = "compact",
  resizeMode = "cover",
}: StoreImageProps) {
  const { colors, shape } = useTheme();
  const isResultRow = layout === "resultRow";
  const isCompact = layout === "compact";

  return (
    <View
      style={[
        styles.imageContainer,
        isCompact ? styles.compactImageContainer : null,
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

      {isClosed ? (
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

      {offer ? (
        <DeliveryOfferBadge
          label={String(offer)}
          size={isResultRow ? "compact" : "regular"}
          style={styles.offerBadge}
        />
      ) : null}

      {actionSlot ?? null}
    </View>
  );
}
