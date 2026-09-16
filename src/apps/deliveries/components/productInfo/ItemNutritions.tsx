import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import { NutritionItem } from "./ProductInfoData";

type Props = {
  ingredients?: string;
  usage?: string;
  amountPer?: string;
  nutrition: NutritionItem[];
  nutritionTitle?: string;
};

export default function ItemNutritions({
  ingredients,
  usage,
  amountPer,
  nutrition,
  nutritionTitle,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, spacing } = useTheme();
  const hasIngredients = Boolean(ingredients?.trim());
  const hasUsage = Boolean(usage?.trim());
  const hasNutrition = nutrition.length > 0;

  return (
    <View style={[styles.container, { gap: spacing.lg, paddingVertical: spacing.lg }]}>
      {hasIngredients ? (
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text color={colors.text} variant="cardTitle" weight="bold">
            {t("ingredients")}
          </Text>
          <Text color={colors.textSubtle} variant="body">
            {ingredients}
          </Text>
        </View>
      ) : null}

      {hasIngredients && (hasUsage || hasNutrition) ? (
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      ) : null}

      {hasUsage ? (
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text color={colors.text} variant="cardTitle" weight="bold">
            {t("usage")}
          </Text>
          <Text color={colors.textSubtle} variant="body">
            {usage}
          </Text>
        </View>
      ) : null}

      {hasUsage && hasNutrition ? (
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      ) : null}

      {hasNutrition ? (
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text color={colors.text} variant="cardTitle" weight="bold">
            {nutritionTitle || t("nutrition_facts")}
          </Text>
          {amountPer ? (
            <Text color={colors.textSubtle} variant="caption">
              {`${t("amount_per")} ${amountPer}`}
            </Text>
          ) : null}

          <View style={[styles.nutritionList, { gap: spacing.sm }]}>
            {nutrition.map((item) => (
              <View key={item.id} style={styles.nutritionRow}>
                <Text color={colors.text} variant="body">
                  {item.label}
                </Text>
                <Text color={colors.textSubtle} variant="body" weight="semiBold">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  nutritionList: {
    marginTop: 4,
  },
  nutritionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {},
});
