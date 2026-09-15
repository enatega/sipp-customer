import React from "react";
import { StyleSheet } from "react-native";
import Text from "../Text";
import { useTheme } from "../../theme/theme";
import { SearchChipProps } from "./types";
import PressableScale from "../PressableScale";


export default function SearchChip({ label, onPress }: SearchChipProps) {
  const { colors, shape, spacing } = useTheme();

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[
        styles.chip,
        {
          backgroundColor: colors.primarySoft,
          borderRadius: shape.radius.pill,
          paddingHorizontal: spacing.lg,
        },
      ]}
      onPress={() => onPress(label)}
      pressedScale={0.97}
    >
      <Text
        color={colors.primary}
        variant="label"
        numberOfLines={1}
        weight="semiBold"
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 40,
  },
});
