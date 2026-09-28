import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../general/theme/theme";
import DiscoveryListingHeader from "../../../components/discovery/DiscoveryListingHeader";
import TopBrandsSeeAllContainer from "../../components/TopBrandsSeeAll/TopBrandsSeeAllContainer";

export default function TopBrandsSeeAll() {
  const { colors } = useTheme();
  const { t } = useTranslation("deliveries");
  const [searchValue, setSearchValue] = useState("");

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <DiscoveryListingHeader
        title={t("multi_vendor_all_brands_title")}
        searchValue={searchValue}
        onSearchChangeText={setSearchValue}
        searchPlaceholder={t("multi_vendor_search_brands_placeholder")}
        showFilters={false}
      />
      <TopBrandsSeeAllContainer searchValue={searchValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
