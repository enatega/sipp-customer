import React, { useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../general/theme/theme";
import Text from "../../../../../general/components/Text";
import DeliveriesSeeAllHeader from "../../../screens/SeeAllScreen/components/DeliveriesSeeAllHeader";
import TopBrandsSeeAllContainer from "../../components/TopBrandsSeeAll/TopBrandsSeeAllContainer";
import { useWindowClass } from "../../../../../general/hooks/useWindowClass";

export default function TopBrandsSeeAll() {
  const { colors, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation("deliveries");
  const [searchValue, setSearchValue] = useState("");

  return (
    <Pressable
      style={[styles.screen, { backgroundColor: colors.canvas }]}
      onPress={() => Keyboard.dismiss()}
    >
      <DeliveriesSeeAllHeader
        searchPlaceholder={t("store_details_search_placeholder")}
        searchValue={searchValue}
        onSearchChangeText={setSearchValue}
        isSearchEditable
        onOpenFilters={() => {}}
        onMapPress={() => {}}
        isSearchVisible
        isFilterVisible={false}
        isMapVisible={false}
      />
      <Text
        accessibilityRole="header"
        variant="sectionTitle"
        weight="bold"
        style={[
          styles.title,
          {
            color: colors.text,
            marginBottom: spacing.lg,
            paddingHorizontal: gutter,
          },
        ]}
      >
        {t("multi_vendor_all_brands_title")}
      </Text>
      <TopBrandsSeeAllContainer searchValue={searchValue} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 4,
  },
  screen: { flex: 1 },
});
