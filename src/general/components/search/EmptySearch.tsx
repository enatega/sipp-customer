import { StyleSheet, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import Text from "../Text";
import { useTheme } from "../../theme/theme";
import { useTranslation } from "react-i18next";
import { EmptySearchProps } from "./types";

const EmptySearch = ({
  title = "no_results_found",
  subtitle = "generic_list_empty_description",
  showIcon = true,
}: EmptySearchProps) => {
  const { t } = useTranslation('general');
  const { colors, shape, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      {showIcon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.surface,
            },
          ]}
        >
          <Ionicons color={colors.primary} name="search-outline" size={34} />
        </View>
      )}

      <Text
        variant="title"
        weight="bold"
        style={[styles.title, { color: colors.text }]}
      >
        {t(title)}
      </Text>

      {subtitle && (
        <Text
          variant="body"
          weight="regular"
          style={[styles.subtitle, { color: colors.textSubtle }]}
        >
          {t(subtitle)}
        </Text>
      )}
    </View>
  );
};

export default EmptySearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
