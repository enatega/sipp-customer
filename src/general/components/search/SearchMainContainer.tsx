import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Text from "../Text";
import SearchInput from "./SearchInput";
import RecentSearches from "./RecentSearches";
import SearchSuggestions from "./SearchSuggestions";
import SearchSuggestionsSkeleton from "./SearchSuggestionsSkeleton";
import type { GenericSearchMainContainerProps } from "./types";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../theme/theme";
import { useWindowClass } from "../../hooks/useWindowClass";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function SearchMainContainer({
  inputRef,
  searchQuery,
  recommendations,
  recentSearches,
  isLoadingRecommendations,
  deletingRecentSearchId,
  isDeletingRecentSearch,
  isClearingRecentSearches,
  showIdleState,
  showRecentSearches,
  handleChangeText,
  handleFocus,
  handleBlur,
  handleClear,
  dismissKeyboard,
  handleSubmitEditing,
  handleSuggestionPress,
  handleRecentSearchPress,
  onDeleteRecentSearch,
  onClearRecentSearches,
  children,
}: GenericSearchMainContainerProps) {
  const { t } = useTranslation("general");
  const { colors: themeColors, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: themeColors.canvas }]}
        >
          <LinearGradient
            colors={[themeColors.primarySoft, themeColors.canvas]}
            end={{ x: 0.5, y: 1 }}
            locations={[0, 1]}
            pointerEvents="none"
            start={{ x: 0.5, y: 0 }}
            style={styles.atmosphere}
          />
          <KeyboardAvoidingView
            style={[
              styles.content,
              {
                gap: spacing.lg,
                maxWidth: layout.contentMaxWidth.commerce,
                paddingHorizontal: gutter,
              },
            ]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View
              style={{ gap: spacing.xs, paddingTop: spacing.md }}
            >
              <SearchInput
                ref={inputRef}
                value={searchQuery}
                onChangeText={handleChangeText}
                placeholder={t("search_screen_input_placeholder")}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClear={handleClear}
                onSubmitEditing={handleSubmitEditing}
              />


            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                showRecentSearches
                  ? "none"
                  : Platform.OS === "ios"
                    ? "interactive"
                    : "on-drag"
              }
              onScrollBeginDrag={
                showRecentSearches ? undefined : dismissKeyboard
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  gap: spacing.section.default,
                  paddingBottom: tabBarHeight + spacing.lg,
                },
              ]}
            >
              {showRecentSearches ? (
                <RecentSearches
                  items={recentSearches}
                  onItemPress={handleRecentSearchPress}
                  onDeletePress={onDeleteRecentSearch}
                  onDeleteAllPress={onClearRecentSearches}
                  deletingRecentSearchId={deletingRecentSearchId}
                  isDeletingRecentSearch={isDeletingRecentSearch}
                  isClearingRecentSearches={isClearingRecentSearches}
                />
              ) : null}

              {showIdleState ? (
                <View style={{ gap: spacing.xl }}>
                  {isLoadingRecommendations ? (
                    <SearchSuggestionsSkeleton />
                  ) : (
                    <View style={[styles.suggestions, { gap: spacing.md }]}>
                      {recommendations.length > 0 ? (
                        <Text variant="sectionTitle" weight="extraBold">
                          {t("search_suggestions_title")}
                        </Text>
                      ) : null}
                      <SearchSuggestions
                        recommendations={recommendations}
                        onSuggestionPress={handleSuggestionPress}
                      />
                    </View>
                  )}
                </View>
              ) : null}

              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>


    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  atmosphere: {
    height: 176,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  content: {
    alignSelf: "center",
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  suggestions: {},
});
