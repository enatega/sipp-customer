import React from "react";
import { View, StyleSheet } from "react-native";
import SearchChip from "./SearchChip";
import { SearchSuggestionsProps } from "./types";
import { useTheme } from "../../theme/theme";


export default function SearchSuggestions({
  recommendations,
  onSuggestionPress,
}: SearchSuggestionsProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.wrapContainer, { gap: spacing.sm }]}>
      {recommendations?.map((item) => (
        <View key={item?.id}>
          <SearchChip label={item?.name} onPress={onSuggestionPress} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
