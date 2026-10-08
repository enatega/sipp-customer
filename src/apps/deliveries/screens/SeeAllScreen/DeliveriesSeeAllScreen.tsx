import React, { useCallback, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import SeeAllScreen from '../../../../general/screens/SeeAllScreen/SeeAllScreen';
import type { SupportedCardType } from '../../../../general/components/filterablePaginatedList';
import SelectedFilterChips from '../../components/filters/SelectedFilterChips';
import type { GenericFilterChip } from '../../components/filters/types';
import type { DeliveriesSeeAllParamList, SeeAllItem } from '../../navigation/sharedTypes';
import type { DeliveriesStackParamList } from '../../navigation/types';
import DeliveriesSeeAllHeader from './components/DeliveriesSeeAllHeader';
import DeliveriesSeeAllFilterSheet from './components/DeliveriesSeeAllFilterSheet';
import { renderSeeAllItemCard } from './components/renderers';
import useDeliveriesSeeAllScreenConfig from './useDeliveriesSeeAllScreenConfig';
import useDeliveriesSeeAllScreenState from './useDeliveriesSeeAllScreenState';
import type { DeliveryNearbyStore } from '../../api/types';
import AppPopup from '../../../../general/components/AppPopup';
import { pushStoreDetails } from '../../navigation/storeDetailsNavigation';
import FavouriteFoodResultCard from '../../components/discovery/FavouriteFoodResultCard';
import { useTheme } from '../../../../general/theme/theme';

type NavigationProp = NativeStackNavigationProp<DeliveriesStackParamList>;
type SeeAllRouteProp = RouteProp<DeliveriesSeeAllParamList, 'SeeAllScreen'>;

export default function DeliveriesSeeAllScreen() {
  const { t } = useTranslation('general');
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SeeAllRouteProp>();
  const { queryType, title, shopTypeId, vendorId, categoryId, foodId, cardType, cardVariant } =
    route.params;

  const {
    filterValues,
    searchText,
    setSearchText,
    debouncedSearch,
    appliedFilters,
    draftFilters,
    isFilterSheetVisible,
    openFilters,
    closeFilters,
    applyFilters,
    clearAllFilters,
    clearDraftFilters,
    toggleCategory,
    selectPrice,
    selectAddress,
    selectStock,
    selectSort,
    removeChip,
    chips,
    hasAppliedFilters,
    hasDraftFilters,
  } = useDeliveriesSeeAllScreenState();
  const [selectedClosedStore, setSelectedClosedStore] = useState<DeliveryNearbyStore | null>(null);

  const {
    listQuery,
    itemKeyExtractor,
    loadingComponent,
    paginationLoadingComponent,
  } = useDeliveriesSeeAllScreenConfig({
    enabled: true,
    filters: appliedFilters,
    search: debouncedSearch,
    queryType,
    shopTypeId,
    vendorId,
    categoryId,
    foodId,
  });

  const items = listQuery.data ?? [];
  const closedStoreName = useMemo(
    () => selectedClosedStore?.name?.trim() || t('store_details_closed_store_fallback_name', { ns: 'deliveries' }),
    [selectedClosedStore?.name, t],
  );
  const isMapVisible =
    cardType === 'product'
      ? false
      : listQuery.isPending || listQuery.isRefetching || items.length > 0;

  const handleMapPress = useCallback(() => {
    if (!items.length) {
      return;
    }

    navigation.navigate('SeeAllMapView', {
      items,
      title,
    });
  }, [items, navigation, title]);

  const renderItemCard = useCallback(
    (item: SeeAllItem) => {
      if (queryType === 'favourite-food-products' && 'productId' in item) {
        return (
          <FavouriteFoodResultCard
            product={item}
            onPress={() => navigation.navigate('ProductInfo', { productId: item.productId })}
          />
        );
      }
      return renderSeeAllItemCard(
        cardType as SupportedCardType,
        item,
        undefined,
        cardVariant,
        true,
        {
          showClosedOverlay: true,
          onClosedPress: (store) => {
            setSelectedClosedStore(store);
          },
        },
      );
    },
    [cardType, cardVariant, navigation, queryType],
  );

  return (
    <>
      <SeeAllScreen<SeeAllItem, GenericFilterChip>
        title={title}
        screenBackgroundColor={queryType === 'favourite-food-products' && !isDark ? colors.white : undefined}
        data={items}
        totalCount={listQuery.totalCount}
        isPending={listQuery.isPending}
        isError={listQuery.isError}
        error={listQuery.error}
        refetch={listQuery.refetch}
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        fetchNextPage={listQuery.fetchNextPage}
        isRefetching={listQuery.isRefetching}
        itemKeyExtractor={itemKeyExtractor}
        chips={chips}
        clearAllLabel={t('clear_all')}
        onRemoveChip={removeChip}
        onClearAll={clearAllFilters}
        renderSelectedFilters={({ chips, clearAllLabel, onRemoveChip, onClearAll }) => (
          <SelectedFilterChips
            chips={chips}
            clearAllLabel={clearAllLabel}
            onRemoveChip={onRemoveChip}
            onClearAll={onClearAll}
          />
        )}
        renderItemCard={renderItemCard}
        header={
          <DeliveriesSeeAllHeader
            searchPlaceholder={t('generic_list_search_placeholder')}
            searchValue={searchText}
            onSearchChangeText={setSearchText}
            isSearchEditable
            onOpenFilters={openFilters}
            onMapPress={handleMapPress}
            isSearchVisible
            isFilterVisible={queryType !== 'favourite-food-products'}
            isMapVisible={isMapVisible}
          />
        }
        filterSheet={
          <DeliveriesSeeAllFilterSheet
            visible={isFilterSheetVisible}
            draftFilters={draftFilters}
            isApplyDisabled={!hasDraftFilters && !hasAppliedFilters}
            onClose={closeFilters}
            onApply={applyFilters}
            onClear={clearDraftFilters}
            onToggleCategory={toggleCategory}
            onSelectPrice={selectPrice}
            onSelectAddress={selectAddress}
            onSelectStock={selectStock}
            onSelectSort={selectSort}
            filters={filterValues?.filters}
          />
        }
        emptyTitle={queryType === 'favourite-food-products'
          ? t('favourite_foods_empty_title', { ns: 'deliveries' }) : t('generic_list_empty_title')}
        emptyDescription={queryType === 'favourite-food-products'
          ? t('favourite_foods_empty_description', { ns: 'deliveries' }) : t('generic_list_empty_description')}
        loadingComponent={loadingComponent}
        paginationLoadingComponent={paginationLoadingComponent}
      />

      <AppPopup
        description={t(
          'store_details_closed_store_description',
          { storeName: closedStoreName, ns: 'deliveries' },
        )}
        dismissOnOverlayPress
        onRequestClose={() => setSelectedClosedStore(null)}
        primaryAction={{
          label: t('store_details_close', { ns: 'deliveries' }),
          onPress: () => setSelectedClosedStore(null),
        }}
        secondaryAction={{
          label: t('store_closed_see_menu', { ns: 'deliveries' }),
          onPress: () => {
            if (!selectedClosedStore) {
              return;
            }

            pushStoreDetails(navigation, selectedClosedStore);
            setSelectedClosedStore(null);
          },
          variant: 'secondary',
        }}
        title={t('store_closed_modal_title', { storeName: closedStoreName, ns: 'deliveries' })}
        visible={Boolean(selectedClosedStore)}
      />
    </>
  );
}
