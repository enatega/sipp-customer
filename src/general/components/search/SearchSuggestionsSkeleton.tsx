import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "../Skeleton";
import { useTheme } from "../../theme/theme";

export default function SearchSuggestionsSkeleton() {
  const { shape, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton
          key={`search-chip-skeleton-${index}`}
          width={index % 3 === 0 ? 96 : index % 3 === 1 ? 74 : 118}
          height={40}
          borderRadius={shape.radius.pill}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
