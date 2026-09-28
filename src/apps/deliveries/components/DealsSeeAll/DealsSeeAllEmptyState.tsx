import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";

export default function DealsSeeAllEmptyState() {
  const { t } = useTranslation("deliveries");
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="pricetag-outline" size={32} color={colors.primary} />
      </View>

      <Text
        weight="bold"
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.size.h5,
            lineHeight: typography.lineHeight.h5,
          },
        ]}
      >
        {t("deals_page_empty_title")}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: colors.mutedText,
            lineHeight: typography.lineHeight.md,
          },
        ]}
      >
        {t("deals_page_empty_description")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  description: {
    marginTop: 8,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginBottom: 16,
    width: 68,
  },
  title: {
    textAlign: "center",
  },
});
