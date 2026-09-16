import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import ProductOptionRow from "./ProductOptionRow";
import ProductOptionSectionHeader from "./ProductOptionSectionHeader";
import type { ProductSelectionSection } from "./useProductSelectionState";

type Props = {
  sections: ProductSelectionSection[];
  selectedOptionIdsByGroup: Record<string, string[]>;
  onToggle: (groupId: string, optionId: string) => void;
  formatPrice: (value: number) => string;
  showValidationErrors?: boolean;
};

export default function ItemFlavour({
  sections,
  selectedOptionIdsByGroup,
  onToggle,
  formatPrice,
  showValidationErrors = false,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { spacing } = useTheme();

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { gap: spacing.xxl }]}>
      <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
        {t("choose_your_addons")}
      </Text>
      {sections.map((section) => {
        const selectionHint =
          section.helperText ||
          (section.minSelect > 1 && section.maxSelect > section.minSelect
            ? t("product_option_choose_range", {
                max: section.maxSelect,
                min: section.minSelect,
              })
            : section.minSelect > 1
            ? t("product_option_choose_at_least", { count: section.minSelect })
            : section.maxSelect > 1
            ? t("product_option_choose_up_to", { count: section.maxSelect })
            : section.selectionType === "single"
            ? t("select_one")
            : null);

        return (
          <View
            key={section.groupId}
            style={[styles.sectionBlock, { gap: spacing.md }]}
          >
            <ProductOptionSectionHeader
              errorMessage={
                showValidationErrors &&
                section.required &&
                (selectedOptionIdsByGroup[section.groupId]?.length ?? 0) <
                  Math.max(1, section.minSelect)
                  ? t("product_option_required_error")
                  : null
              }
              helperText={selectionHint}
              isRequired={section.required}
              optionalLabel={t("optional_label")}
              requiredLabel={t("required_label")}
              title={section.label}
            />

            <View style={[styles.options, { gap: spacing.sm }]}>
              {section.options.map((item) => {
                const selectedIds = selectedOptionIdsByGroup[section.groupId] ?? [];
                const isSelected = selectedIds.includes(item.optionId);
                const isAtSelectionLimit =
                  section.selectionType === "multiple" &&
                  section.maxSelect > 0 &&
                  selectedIds.length >= section.maxSelect;

                return (
                  <ProductOptionRow
                    controlType={
                      section.selectionType === "single" && section.required
                        ? "radio"
                        : "checkbox"
                    }
                    description={item.description}
                    isDisabled={!isSelected && isAtSelectionLimit}
                    isSelected={isSelected}
                    key={item.optionId}
                    label={item.label}
                    onPress={() => onToggle(section.groupId, item.optionId)}
                    priceLabel={item.price === 0 ? t("free") : formatPrice(item.price)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  sectionBlock: {
    width: "100%",
  },
  options: {},
});
