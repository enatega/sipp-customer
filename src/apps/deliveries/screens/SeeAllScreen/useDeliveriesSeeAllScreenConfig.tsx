import React from 'react';
import type { ApiError } from '../../../../general/api/apiClient';
import type { GenericListFilters } from '../../components/filters';
import {
  useNearbyStores,
  useShopTypeProducts,
  useShopTypeStores,
  useVendorStores,
} from '../../hooks';
import useChainCategoryProducts from '../../chain/hooks/useChainCategoryProducts';
import useSingleVendorCategoryProducts from '../../singleVendor/hooks/useSingleVendorCategoryProducts';
import VerticalStoreListSkeleton from '../../components/VerticalStoreListSkeleton';
import { useFavouriteFoodProducts } from '../../hooks/useFavouriteFoods';
import { useProductSearch } from '../../hooks/useSearchQueries';
import { useBrowseCity } from '../../stores/useBrowseCityStore';
import FavouriteFoodProductsSkeleton from '../../components/discovery/FavouriteFoodProductsSkeleton';
import type {
  DeliveriesSeeAllParamList,
  SeeAllItem,
} from '../../navigation/sharedTypes';

type SeeAllRawQueryResult =
  | ReturnType<typeof useNearbyStores>
  | ReturnType<typeof useChainCategoryProducts>
  | ReturnType<typeof useShopTypeProducts>
  | ReturnType<typeof useShopTypeStores>
  | ReturnType<typeof useProductSearch>
  | ReturnType<typeof useVendorStores>
  | ReturnType<typeof useSingleVendorCategoryProducts>;

type SeeAllListQueryResult = {
  data: SeeAllItem[];
  totalCount?: number;
  isPending: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: SeeAllRawQueryResult['refetch'];
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: SeeAllRawQueryResult['fetchNextPage'];
  isRefetching: boolean;
};

type UseDeliveriesSeeAllScreenConfigParams = {
  enabled: boolean;
  filters: GenericListFilters;
  search: string;
  searchText: string;
  queryType: DeliveriesSeeAllParamList['SeeAllScreen']['queryType'];
  shopTypeId?: string;
  vendorId?: string;
  categoryId?: string;
  foodId?: string;
};

type UseDeliveriesSeeAllScreenConfigResult = {
  itemKeyExtractor: (item: SeeAllItem, index: number) => string;
  listQuery: SeeAllListQueryResult;
  loadingComponent: React.ReactNode;
  paginationLoadingComponent: React.ReactNode;
};

const STORE_LIST_SKELETON: React.ReactNode =
  React.createElement(VerticalStoreListSkeleton);

function normalizeListQuery(query: SeeAllRawQueryResult): SeeAllListQueryResult {
  return {
    data: (query.data ?? []) as SeeAllItem[],
    totalCount: query.totalCount,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    isRefetching: query.isRefetching,
  };
}

export default function useDeliveriesSeeAllScreenConfig({
  enabled,
  filters,
  search,
  searchText,
  queryType,
  shopTypeId,
  vendorId,
  categoryId,
  foodId,
}: UseDeliveriesSeeAllScreenConfigParams): UseDeliveriesSeeAllScreenConfigResult {
  const city = useBrowseCity();
  const isFavouriteFoodSearch = queryType === 'favourite-food-products' && searchText.trim().length > 0;
  const isFavouriteFoodSearchReady = isFavouriteFoodSearch && searchText.trim() === search;
  const nearbyStoresQuery = useNearbyStores({
    mode: 'paginated',
    enabled: enabled && queryType === 'nearby-stores',
    filters,
    search,
  });
  const shopTypeProductsQuery = useShopTypeProducts(shopTypeId ?? '', {
    mode: 'paginated',
    enabled: enabled && queryType === 'shop-type-products' && Boolean(shopTypeId),
    filters,
    search,
  });
  const shopTypeStoresQuery = useShopTypeStores(shopTypeId ?? '', {
    mode: 'paginated',
    enabled: enabled && queryType === 'shop-type-stores' && Boolean(shopTypeId),
    filters,
    search,
  });
  const vendorStoresQuery = useVendorStores(vendorId ?? '', {
    mode: 'paginated',
    enabled: enabled && queryType === 'top-brand-stores' && Boolean(vendorId),
    filters,
    search,
  });
  const singleVendorCategoryProductsQuery = useSingleVendorCategoryProducts(
    categoryId ?? '',
    {
      mode: 'paginated',
      enabled:
        enabled &&
        queryType === 'single-vendor-category-products' &&
        Boolean(categoryId),
      filters,
      search,
    },
  );
  const chainCategoryProductsQuery = useChainCategoryProducts(categoryId ?? '', {
    mode: 'paginated',
    enabled:
      enabled &&
      queryType === 'chain-category-products' &&
      Boolean(categoryId),
    filters,
    search,
  });

  const favouriteFoodProductsQuery = useFavouriteFoodProducts(
    enabled && queryType === 'favourite-food-products' && !isFavouriteFoodSearch ? foodId ?? '' : '',
    shopTypeId,
  );
  const favouriteFoodSearchQuery = useProductSearch(search, {
    latitude: city?.latitude,
    longitude: city?.longitude,
    shopTypeId,
    favouriteFoodId: foodId,
  }, { enabled: enabled && isFavouriteFoodSearchReady && Boolean(foodId) });

  if (queryType === 'favourite-food-products') {
    const searchPage = favouriteFoodSearchQuery.data?.pages[0];
    const searchProducts = favouriteFoodSearchQuery.data?.pages.flatMap((page) =>
      page.items.map((item, index) => ({
        ...item,
        searchQueryId: page.searchMeta?.queryId,
        searchPosition: page.offset + index + 1,
      })),
    ) ?? [];
    return {
      itemKeyExtractor: (item, index) => 'productId' in item
        ? `${item.productId}-${item.storeId}-${index}` : `${item.storeId}-${index}`,
      listQuery: {
        data: isFavouriteFoodSearch ? (isFavouriteFoodSearchReady ? searchProducts : []) : favouriteFoodProductsQuery.products,
        totalCount: isFavouriteFoodSearch ? (isFavouriteFoodSearchReady ? searchPage?.total : undefined) : favouriteFoodProductsQuery.total,
        isPending: isFavouriteFoodSearch ? !isFavouriteFoodSearchReady || favouriteFoodSearchQuery.isPending : favouriteFoodProductsQuery.isPending,
        isError: isFavouriteFoodSearch ? isFavouriteFoodSearchReady && favouriteFoodSearchQuery.isError : favouriteFoodProductsQuery.isError,
        error: isFavouriteFoodSearch ? favouriteFoodSearchQuery.error : favouriteFoodProductsQuery.error,
        refetch: isFavouriteFoodSearch ? favouriteFoodSearchQuery.refetch : favouriteFoodProductsQuery.refetch,
        hasNextPage: isFavouriteFoodSearch ? favouriteFoodSearchQuery.hasNextPage : favouriteFoodProductsQuery.hasNextPage,
        isFetchingNextPage: isFavouriteFoodSearch ? favouriteFoodSearchQuery.isFetchingNextPage : favouriteFoodProductsQuery.isFetchingNextPage,
        fetchNextPage: isFavouriteFoodSearch ? favouriteFoodSearchQuery.fetchNextPage : favouriteFoodProductsQuery.fetchNextPage,
        isRefetching: isFavouriteFoodSearch ? favouriteFoodSearchQuery.isRefetching : favouriteFoodProductsQuery.isRefetching,
      },
      loadingComponent: React.createElement(FavouriteFoodProductsSkeleton),
      paginationLoadingComponent: React.createElement(FavouriteFoodProductsSkeleton),
    };
  }

  if (queryType === 'shop-type-stores') {
    return {
      itemKeyExtractor: (item, index) => `${item.storeId}-${index}`,
      listQuery: normalizeListQuery(shopTypeStoresQuery),
      loadingComponent: STORE_LIST_SKELETON,
      paginationLoadingComponent: STORE_LIST_SKELETON,
    };
  }

  if (queryType === 'shop-type-products') {
    return {
      itemKeyExtractor: (item, index) =>
        'productId' in item
          ? `${item.productId}-${item.storeId}-${index}`
          : `${item.storeId}-${index}`,
      listQuery: normalizeListQuery(shopTypeProductsQuery),
      loadingComponent: STORE_LIST_SKELETON,
      paginationLoadingComponent: STORE_LIST_SKELETON,
    };
  }

  if (queryType === 'top-brand-stores') {
    return {
      itemKeyExtractor: (item, index) => `${item.storeId}-${index}`,
      listQuery: normalizeListQuery(vendorStoresQuery),
      loadingComponent: STORE_LIST_SKELETON,
      paginationLoadingComponent: STORE_LIST_SKELETON,
    };
  }

  if (queryType === 'single-vendor-category-products') {
    return {
      itemKeyExtractor: (item, index) =>
        'productId' in item
          ? `${item.productId}-${item.storeId}-${index}`
          : `${item.storeId}-${index}`,
      listQuery: normalizeListQuery(singleVendorCategoryProductsQuery),
      loadingComponent: STORE_LIST_SKELETON,
      paginationLoadingComponent: STORE_LIST_SKELETON,
    };
  }

  if (queryType === 'chain-category-products') {
    return {
      itemKeyExtractor: (item, index) =>
        'productId' in item
          ? `${item.productId}-${item.storeId}-${index}`
          : `${item.storeId}-${index}`,
      listQuery: normalizeListQuery(chainCategoryProductsQuery),
      loadingComponent: STORE_LIST_SKELETON,
      paginationLoadingComponent: STORE_LIST_SKELETON,
    };
  }

  return {
    itemKeyExtractor: (item, index) =>
      'productId' in item ? `${item.productId}-${index}` : item.storeId,
    listQuery: normalizeListQuery(nearbyStoresQuery),
    loadingComponent: STORE_LIST_SKELETON,
    paginationLoadingComponent: STORE_LIST_SKELETON,
  };
}
