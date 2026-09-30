import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import CategorySeeAllGrid from "../../../components/categorySeeAll/CategorySeeAllGrid";
import type { DeliveryDiscoveryCategoryItem } from "../../../components/discovery";
import { usePaginatedShopTypes } from "../../../hooks";
import type { DeliveriesStackParamList } from "../../../navigation/types";
import { translateShopTypeName } from "../../../utils/shopTypeLocalization";

type NavigationProp = NativeStackNavigationProp<
  DeliveriesStackParamList,
  "SeeAllScreen"
>;

const ShopTypesSeeAllContainer = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation("deliveries");
  const {
    data: shopTypes = [],
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = usePaginatedShopTypes({
    mode: "paginated",
  });

  const handleShopTypePress = useCallback(
    (shopType: DeliveryDiscoveryCategoryItem) => {
      navigation.navigate("SeeAllScreen", {
        queryType: "shop-type-stores",
        title: translateShopTypeName(shopType.name, t),
        cardType: "store",
        shopTypeId: shopType.id,
      });
    },
    [navigation, t],
  );

  return (
    <CategorySeeAllGrid
      data={shopTypes.map((shopType) => ({
        id: shopType.id,
        name: translateShopTypeName(shopType.name, t),
        imageUrl: shopType.image ?? null,
      }))}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      isPending={isPending}
      isRefetching={isRefetching}
      onItemPress={handleShopTypePress}
      refetch={refetch}
      title={t("multi_vendor_shop_types_title")}
    />
  );
};

export default ShopTypesSeeAllContainer;
