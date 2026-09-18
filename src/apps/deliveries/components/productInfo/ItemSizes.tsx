import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import ProductOptionRow from "./ProductOptionRow";
import ProductOptionSectionHeader from "./ProductOptionSectionHeader";
import type { ProductVariationOption } from "./useProductSelectionState";

type Props = {
  helperText?: string | null;
  selectedVariationKey: string | null;
  onSelect: (groupId: string, optionId: string) => void;
  formatPrice: (value: number) => string;
  variations: ProductVariationOption[];
};

export default function ItemSizes({
  helperText,
  variations,
  selectedVariationKey,
  onSelect,
  formatPrice,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { spacing } = useTheme();
  const isRequired = variations.some((variation) => variation.required);

  if (variations.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <ProductOptionSectionHeader
        helperText={helperText || t("select_one")}
        isRequired={isRequired}
        optionalLabel={t("optional_label")}
        requiredLabel={t("required_label")}
        title={t("choose_variation")}
      />

      <View
        accessibilityRole="radiogroup"
        style={[styles.options, { gap: spacing.sm }]}
      >
        {variations.map((item) => (
          <ProductOptionRow
            controlType="radio"
            description={item.description}
            isSelected={
              selectedVariationKey === `${item.groupId}:${item.optionId}`
            }
            key={`${item.groupId}:${item.optionId}`}
            label={item.label}
            onPress={() => onSelect(item.groupId, item.optionId)}
            priceLabel={item.price === 0 ? t("free") : formatPrice(item.price ?? 0)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  options: {},
});
