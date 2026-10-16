import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";

import type { OrderProductAddonLine } from "../../utils/orderItems/orderItemsUtils";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import { styles } from "./OrderDetailsProductCard.styles";

type Props = {
  addonLines?: OrderProductAddonLine[];
  imageUri?: string | null;
  itemNote?: string | null;
  itemNoteLabel?: string;
  name: string;
  quantityLabel: string;
  priceLabel?: string | null;
  unitPriceLabel?: string | null;
  subtitle?: string | null;
};

export default function OrderDetailsProductCard({
  addonLines = [],
  imageUri,
  itemNote,
  itemNoteLabel,
  name,
  quantityLabel,
  priceLabel,
  unitPriceLabel,
  subtitle,
}: Props) {
  const { colors, typography } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAddons = addonLines.length > 0;
  const hasExpandableAddons = addonLines.length > 1;
  const detailsPreview =
    subtitle || (hasAddons ? addonLines.map((item) => item.label).join(", ") : null);

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.imageFallback,
            { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <Text
            style={{
              color: colors.mutedText,
              fontSize: typography.size.sm2,
              lineHeight: typography.lineHeight.md,
            }}
            weight="extraBold"
          >
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: colors.text,
              fontSize: typography.size.sm2,
              lineHeight: typography.lineHeight.md,
            },
          ]}
          weight="bold"
        >
          {name}
        </Text>

        {detailsPreview ? (
          <View style={styles.subtitleRow}>
            <Text
              numberOfLines={isExpanded ? undefined : 1}
              style={[
                styles.subtitle,
                {
                  color: colors.mutedText,
                  flex: 1,
                  fontSize: typography.size.xs2,
                  lineHeight: typography.lineHeight.sm,
                },
              ]}
              weight="medium"
            >
              {detailsPreview}
            </Text>

            {hasExpandableAddons ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsExpanded((previousState) => !previousState)}
                style={styles.chevronButton}
              >
                <MaterialCommunityIcons
                  color={colors.iconColor}
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {isExpanded && hasExpandableAddons ? (
          <View style={styles.addonList}>
            {addonLines.map((addonLine, index) => (
              <View key={`${addonLine.label}-${index}`} style={styles.addonRow}>
                <Text
                  style={[
                    styles.addonText,
                    styles.addonLabel,
                    {
                      color: colors.mutedText,
                      fontSize: typography.size.xs2,
                      lineHeight: typography.lineHeight.sm,
                    },
                  ]}
                  weight="medium"
                >
                  {addonLine.label}
                </Text>
                {addonLine.priceLabel ? (
                  <Text
                    style={[
                      styles.addonText,
                      styles.addonPrice,
                      {
                        color: colors.mutedText,
                        fontSize: typography.size.xs2,
                        lineHeight: typography.lineHeight.sm,
                      },
                    ]}
                    weight="medium"
                  >
                    {addonLine.priceLabel}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {itemNote ? (
          <View style={[styles.itemNote, { backgroundColor: colors.primarySoft }]}>
            <Text color={colors.primary} variant="caption" weight="semiBold">
              {itemNoteLabel}
            </Text>
            <Text color={colors.text} variant="caption">
              {itemNote}
            </Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <View>
            <Text
              style={{
                color: colors.mutedText,
                fontSize: typography.size.xs2,
                lineHeight: typography.lineHeight.sm,
              }}
              weight="medium"
            >
              {quantityLabel}
            </Text>
            {unitPriceLabel ? <Text color={colors.mutedText} variant="caption">{unitPriceLabel}</Text> : null}
          </View>

          {priceLabel ? (
            <Text
              style={{
                color: colors.text,
                fontSize: typography.size.xs2,
                lineHeight: typography.lineHeight.sm,
              }}
              weight="semiBold"
            >
              {priceLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
