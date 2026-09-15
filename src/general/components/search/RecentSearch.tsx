import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Icon from "../Icon";
import { useTheme } from "../../theme/theme";
import Text from "../Text";
import { RecentSearchProps } from "./types";
import PressableScale from "../PressableScale";
import { useTranslation } from "react-i18next";

const RecentSearch = ({
  search,
  onDeletePress,
  onItemPress,
  isDeleting = false,
  isDeleteDisabled = false,
}: RecentSearchProps) => {
  const { colors, shape, spacing } = useTheme();
  const { t } = useTranslation("general");
  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <PressableScale
        accessibilityLabel={search}
        accessibilityRole="button"
        onPress={onItemPress}
        pressedScale={0.99}
        style={[styles.item, { gap: spacing.md }]}
      >
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor: colors.surfaceSunken,
              borderRadius: shape.radius.control,
            },
          ]}
        >
          <Icon type="Ionicons" name="time-outline" size={19} color={colors.textSubtle} />
        </View>
        <Text
          numberOfLines={1}
          variant="body"
          weight="medium"
          style={styles.label}
        >
          {search}
        </Text>
      </PressableScale>

      <Pressable
        accessibilityLabel={t("search_delete_recent_label", { term: search })}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDeleting || isDeleteDisabled }}
        hitSlop={12}
        onPress={onDeletePress}
        disabled={isDeleting || isDeleteDisabled}
        style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.6 : 1 }]}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.mutedText} />
        ) : (
          <Icon
            type="Entypo"
            name="cross"
            size={20}
            color={colors.mutedText}
          />
        )}
      </Pressable>
    </View>
  );
};

export default RecentSearch;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 64,
    width: "100%",
  },
  item: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingRight: 8,
  },
  deleteButton: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 44,
    width: 44,
  },
  iconWell: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  label: {
    flex: 1,
  },
});
