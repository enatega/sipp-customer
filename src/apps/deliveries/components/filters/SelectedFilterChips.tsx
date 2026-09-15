import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Icon from "../../../../general/components/Icon";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import type { GenericFilterChip } from "./types";
import PressableScale from "../../../../general/components/PressableScale";

type Props = {
  chips: GenericFilterChip[];
  onRemoveChip: (chip: GenericFilterChip) => void;
  clearAllLabel: string;
  onClearAll: () => void;
};

export default function SelectedFilterChips({
  chips,
  onRemoveChip,
  clearAllLabel,
  onClearAll,
}: Props) {
  const { colors, shape, spacing } = useTheme();

  if (chips.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: spacing.sm }]}>
      <FlatList
        data={chips}
        horizontal
        keyExtractor={(chip) => chip.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipsContent, { gap: spacing.sm, paddingRight: spacing.md }]}
        renderItem={({ item: chip }) => (
          <PressableScale
            accessibilityLabel={chip.label}
            accessibilityRole="button"
            onPress={() => onRemoveChip(chip)}
            pressedScale={0.97}
            style={[
              styles.chip,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: shape.radius.pill,
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <Text
              color={colors.primary}
              variant="caption"
              weight="semiBold"
            >
              {chip.label}
            </Text>
            <View
              style={[
                styles.removeIcon,
                {
                  backgroundColor: colors.surface,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <Icon type="Entypo" name="cross" size={14} color={colors.primary} />
            </View>
          </PressableScale>
        )}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onClearAll}
        style={({ pressed }) => [
          styles.clearButton,
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          color={colors.primary}
          variant="label"
          weight="semiBold"
        >
          {clearAllLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 40,
  },
  chipsContent: {
  },
  clearButton: {
    justifyContent: "center",
    paddingLeft: 4,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
  removeIcon: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
});
