import React from "react";
import { StyleSheet, View } from "react-native";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";

type Props = {
  errorMessage?: string | null;
  helperText?: string | null;
  isRequired: boolean;
  optionalLabel: string;
  requiredLabel: string;
  title: string;
};

export default function ProductOptionSectionHeader({
  errorMessage,
  helperText,
  isRequired,
  optionalLabel,
  requiredLabel,
  title,
}: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={[styles.titleRow, { gap: spacing.sm }]}>
        <Text accessibilityRole="header" style={styles.title} variant="cardTitle" weight="bold">
          {title}
        </Text>
        <View
          style={[
            styles.status,
            {
              backgroundColor: isRequired ? colors.primarySoft : colors.surfaceSunken,
              borderRadius: shape.radius.pill,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            },
          ]}
        >
          <Text
            color={isRequired ? colors.primary : colors.textSubtle}
            variant="badge"
            weight="bold"
          >
            {isRequired ? requiredLabel : optionalLabel}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text color={colors.dangerText} variant="caption" weight="semiBold">
          {errorMessage}
        </Text>
      ) : helperText ? (
        <Text color={colors.textSubtle} variant="caption">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    flexShrink: 0,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});
