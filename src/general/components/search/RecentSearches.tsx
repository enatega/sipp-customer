import { FlatList, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { ActivityIndicator } from "react-native";
import RecentSearch from "./RecentSearch";
import { useTranslation } from "react-i18next";
import Text from "../Text";
import { useTheme } from "../../theme/theme";
import { RecentSearchesProps } from "./types";

const RecentSearches = ({
  items,
  onDeletePress,
  onDeleteAllPress,
  onItemPress,
  deletingRecentSearchId,
  isDeletingRecentSearch,
  isClearingRecentSearches,
}: RecentSearchesProps) => {
  const { t } = useTranslation("general");
  const { colors, spacing } = useTheme();

  return (
    <>
      <View
        style={[
          styles.headerContainer,
          { paddingBottom: spacing.sm, paddingTop: spacing.sm },
        ]}
      >
        <Text
          accessibilityRole="header"
          variant="sectionTitle"
          weight="extraBold"
        >
          {t("recent_searches")}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: Boolean(isClearingRecentSearches || isDeletingRecentSearch),
          }}
          hitSlop={12}
          onPress={onDeleteAllPress}
          disabled={Boolean(isClearingRecentSearches || isDeletingRecentSearch)}
          style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
        >
          {isClearingRecentSearches ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              color={colors.primary}
              variant="label"
              weight="semiBold"
            >
              {t("clear_all")}
            </Text>
          )}
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyboardShouldPersistTaps="always"
        renderItem={({ item }) => (
          <RecentSearch
            search={item.term}
            onDeletePress={() => onDeletePress(item.id)}
            onItemPress={() => onItemPress(item.term)}
            isDeleting={deletingRecentSearchId === item.id}
            isDeleteDisabled={Boolean(isClearingRecentSearches)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </>
  );
};

export default RecentSearches;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
