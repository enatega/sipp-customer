import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import Text from '../../../../general/components/Text';
import useDebouncedValue from '../../../../general/hooks/useDebouncedValue';
import DiscoveryListingHeader from '../../components/discovery/DiscoveryListingHeader';
import DeliveriesSeeAllFilterSheet from '../../screens/SeeAllScreen/components/DeliveriesSeeAllFilterSheet';
import SelectedFilterChips from '../../components/filters/SelectedFilterChips';
import DeliveriesSectionEmptyState from '../../components/home/DeliveriesSectionEmptyState';
import StoreCard from '../../components/storeCard/StoreCard';
import ClosedStoreMenuPopup from '../../components/storeCard/ClosedStoreMenuPopup';
import type { DeliveryNearbyStore } from '../../api/types';
import useGenericListFilters from '../../hooks/filterablePaginatedList/useGenericListFilters';
import { useFilterValues, useNearbyStores, useShopTypes } from '../../hooks';
import { MainSeeAllShopTypeTabs, MainSeeAllStoreListSkeleton } from '../components/MainSeeAll';
import type { MultiVendorStackParamList } from '../navigation/types';
import { pushStoreDetails } from '../../navigation/storeDetailsNavigation';
import { translateShopTypeName } from '../../utils/shopTypeLocalization';
import type { DeliveriesStackParamList } from '../../navigation/types';
import type { DeliveryFavouriteFood } from '../../api/types';
import FavouriteFoodsCarousel from '../components/favouriteFoods/FavouriteFoodsCarousel';
import { getLocalizedProductName } from '../../utils/productTranslation';
import { useStoreSearch } from '../../hooks/useSearchQueries';
import { useBrowseCity } from '../../stores/useBrowseCityStore';
import { searchService } from '../../api/searchService';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MultiVendorStackParamList, 'MainSeeAllScreen'>,
  NativeStackNavigationProp<DeliveriesStackParamList>
>;
type MainSeeAllRouteProp = RouteProp<MultiVendorStackParamList, 'MainSeeAllScreen'>;

export default function MainSeeAllScreen() {
  const { colors, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t, i18n } = useTranslation('deliveries');
  const { t: tGeneral } = useTranslation('general');
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MainSeeAllRouteProp>();
  const [searchValue, setSearchValue] = useState('');
  const [selectedShopTypeId, setSelectedShopTypeId] = useState<string | null>(route.params?.initialShopTypeId ?? null);
  const [selectedClosedStore, setSelectedClosedStore] = useState<DeliveryNearbyStore | null>(null);
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 450);
  const city = useBrowseCity();
  const isSearching = searchValue.trim().length > 0;
  const isSearchReady = isSearching && searchValue.trim() === debouncedSearch;
  const { data: shopTypes = [] } = useShopTypes();
  const { data: filterValues } = useFilterValues();
  const filterState = useGenericListFilters({ filterData: filterValues?.filters });

  useEffect(() => {
    setSelectedShopTypeId(route.params?.initialShopTypeId ?? null);
  }, [route.params?.initialShopTypeId]);

  const listQuery = useNearbyStores({
    mode: 'paginated',
    enabled: !isSearching,
    filters: filterState.appliedFilters,
    requestParams: {
      shop_type_id: selectedShopTypeId ?? undefined,
    },
  });
  const searchQuery = useStoreSearch(debouncedSearch, {
    latitude: city?.latitude,
    longitude: city?.longitude,
    shopTypeId: selectedShopTypeId ?? undefined,
  }, { enabled: isSearchReady });
  const {
    data: browseStores = [], totalCount: browseTotalCount,
  } = listQuery;
  const searchStores = searchQuery.data?.pages.flatMap((page) =>
    page.items.map((item, index) => ({
      ...item,
      searchQueryId: page.searchMeta?.queryId,
      searchPosition: page.offset + index + 1,
    })),
  ) ?? [];
  const stores = isSearching ? (isSearchReady ? searchStores : []) : browseStores;
  const totalCount = isSearching ? (isSearchReady ? searchQuery.data?.pages[0]?.total : undefined) : browseTotalCount;
  const isPending = isSearching ? !isSearchReady || searchQuery.isPending : listQuery.isPending;
  const isError = isSearching ? isSearchReady && searchQuery.isError : listQuery.isError;
  const isRefetching = isSearching ? searchQuery.isRefetching : listQuery.isRefetching;
  const isFetchingNextPage = isSearching ? searchQuery.isFetchingNextPage : listQuery.isFetchingNextPage;

  const selectShopType = useCallback((id: string | null) => {
    setSelectedShopTypeId(id);
  }, []);
  const refresh = useCallback(() => {
    if (isSearching) {
      if (isSearchReady) void searchQuery.refetch();
    } else {
      void listQuery.refetch();
    }
  }, [isSearchReady, isSearching, listQuery, searchQuery]);
  const loadMore = useCallback(() => {
    if (isSearching) {
      if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) void searchQuery.fetchNextPage();
    } else if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
      void listQuery.fetchNextPage();
    }
  }, [isSearching, listQuery, searchQuery]);

  const openStore = useCallback((store: DeliveryNearbyStore & { searchQueryId?: string; searchPosition?: number }) => {
    if (store.searchQueryId) {
      void searchService.trackEvent({
        eventType: 'click',
        resourceType: 'store',
        eventName: 'Store Opened',
        queryId: store.searchQueryId,
        objectId: store.storeId,
        position: store.searchPosition,
      }).catch(() => undefined);
    }
    pushStoreDetails(navigation, store);
  }, [navigation]);

  const selectedShopTypeName = selectedShopTypeId
    ? translateShopTypeName(
        shopTypes.find((item) => item.id === selectedShopTypeId)?.name ?? t('home_all_stores'),
        t,
      )
    : t('home_all_stores');

  const openFavouriteFood = useCallback((food: DeliveryFavouriteFood) => {
    navigation.navigate('SeeAllScreen', {
      queryType: 'favourite-food-products',
      foodId: food.id,
      shopTypeId: selectedShopTypeId ?? undefined,
      title: getLocalizedProductName(food, i18n.language),
      cardType: 'product',
    });
  }, [i18n.language, navigation, selectedShopTypeId]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <DiscoveryListingHeader
        title={selectedShopTypeName}
        searchValue={searchValue}
        onSearchChangeText={setSearchValue}
        onOpenFilters={filterState.openFilters}
        showFilters={!isSearching}
      />
      <MainSeeAllShopTypeTabs
        items={shopTypes}
        selectedShopTypeId={selectedShopTypeId}
        onSelectShopType={selectShopType}
      />
      <FlatList
        data={stores}
        keyExtractor={(item) => item.storeId}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { maxWidth: layout.contentMaxWidth.commerce, paddingHorizontal: gutter, paddingBottom: spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={(
          <View style={styles.listHeader}>
            <View style={{ marginHorizontal: -gutter }}>
              <FavouriteFoodsCarousel shopTypeId={selectedShopTypeId} onFoodPress={openFavouriteFood} />
            </View>
            {!isSearching ? <SelectedFilterChips
              chips={filterState.chips}
              clearAllLabel={tGeneral('clear_all')}
              onRemoveChip={filterState.removeChip}
              onClearAll={filterState.clearAllFilters}
            /> : null}
            <View style={styles.intro}>
              <Text color={colors.textSubtle} variant="supporting">
                {typeof totalCount === 'number'
                  ? t('home_store_count', { count: totalCount })
                  : t('home_store_list_subtitle')}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={isPending ? (
          <MainSeeAllStoreListSkeleton />
        ) : isError ? (
          <DeliveriesSectionEmptyState
            title={t('generic_list_error_title')}
            message={t('generic_list_error_description')}
            actionLabel={t('generic_list_retry')}
            onActionPress={refresh}
          />
        ) : (
          <DeliveriesSectionEmptyState
            title={t('multi_vendor_home_section_empty_title')}
            message={t('multi_vendor_location_stores_empty')}
          />
        )}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            layout="resultRow"
            showClosedOverlay={item.isAvailable === false || ('isClosed' in item && item.isClosed === true)}
            onClosedPress={() => setSelectedClosedStore(item)}
            onPress={isSearching ? () => openStore(item) : undefined}
          />
        )}
      />
      <DeliveriesSeeAllFilterSheet
        isCategoryVisible={false}
        visible={filterState.isFilterSheetVisible}
        draftFilters={filterState.draftFilters}
        isApplyDisabled={!filterState.hasDraftFilters && !filterState.hasAppliedFilters}
        onClose={filterState.closeFilters}
        onApply={filterState.applyFilters}
        onClear={filterState.clearDraftFilters}
        onToggleCategory={filterState.toggleCategory}
        onSelectPrice={filterState.selectPrice}
        onSelectAddress={filterState.selectAddress}
        onSelectStock={filterState.selectStock}
        onSelectSort={filterState.selectSort}
        filters={filterValues?.filters}
      />
      <ClosedStoreMenuPopup
        store={selectedClosedStore}
        onClose={() => setSelectedClosedStore(null)}
        onSeeMenu={(store) => {
          setSelectedClosedStore(null);
          pushStoreDetails(navigation, store);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flexGrow: 1, paddingTop: 16, width: '100%' },
  listHeader: { gap: 20, paddingBottom: 16 },
  intro: { gap: 2 },
  separator: { height: 12 },
  footer: { paddingVertical: 20 },
});
