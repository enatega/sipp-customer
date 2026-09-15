import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { useNearbyStores } from '../../../hooks';
import type { DeliveryNearbyStore } from '../../../api/types';
import {
  DiscoveryResultsSkeleton,
} from '../../../components/discovery';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import StoreCard from '../../../components/storeCard/StoreCard';
import type { MultiVendorStackParamList } from '../../navigation/types';
import type { GenericListFilters } from '../../../components/filters/types';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { pushStoreDetails } from '../../../navigation/storeDetailsNavigation';
import ClosedStoreMenuPopup from '../../../components/storeCard/ClosedStoreMenuPopup';

type NavProp = NativeStackNavigationProp<
  MultiVendorStackParamList,
  "SeeAllScreen"
>;

type Props = {
  search?: string;
  selectedCategoryId?: string | null;
  selectedShopTypeId?: string | null;
  filters?: GenericListFilters;
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
};

export default function NearbyStoreList(props: Props) {
  const { search, selectedCategoryId, selectedShopTypeId, filters } = props;
  const { onClosedStorePress } = props;
  const { t } = useTranslation('deliveries');
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const navigation = useNavigation<NavProp>();
  const resolvedCategoryIds =
    selectedCategoryId ? [selectedCategoryId] : (filters?.category_ids ?? []);
  const resolvedCategoryId = resolvedCategoryIds[0] ?? undefined;
  const hasSelectedShopTypeProp = Object.prototype.hasOwnProperty.call(
    props,
    'selectedShopTypeId',
  );
  const activeShopTypeId =
    selectedShopTypeId && selectedShopTypeId.trim().length > 0
      ? selectedShopTypeId
      : undefined;
  const shouldSkipBecauseEmptyShopType =
    hasSelectedShopTypeProp && !activeShopTypeId;

  const { data: nearbyStoresData = [], isPending: isNearbyStoresPending } = useNearbyStores({
    enabled: !shouldSkipBecauseEmptyShopType,
    search,
    filters: {
      category_ids: resolvedCategoryIds,
      price_tiers: filters?.price_tiers ?? null,
      address_id: filters?.address_id ?? null,
      stock: filters?.stock ?? null,
      sort_by: filters?.sort_by ?? null,
    },
    requestParams: {
      category_id: resolvedCategoryId,
      shop_type_id: activeShopTypeId,
    },
  });
  const [selectedClosedStore, setSelectedClosedStore] = useState<DeliveryNearbyStore | null>(null);
  const isEmpty = !isNearbyStoresPending && nearbyStoresData.length === 0;
  const shouldShowSeeAll = !isNearbyStoresPending && nearbyStoresData.length > 0;
  const handleClosedStorePress = useCallback((store: DeliveryNearbyStore) => {
    if (onClosedStorePress) {
      onClosedStorePress(store);
      return;
    }

    setSelectedClosedStore(store);
  }, [onClosedStorePress]);

  const handleSeeAllNearbyRestaurants = useCallback(() => {
    navigation.navigate('SeeAllScreen', {
      queryType: 'nearby-stores',
      title: t('multi_vendor_nearby_store_title'),
      cardType: 'store',
    });
  }, [navigation, t]);

  const renderItem = ({ item }: { item: DeliveryNearbyStore }) => (
    <StoreCard
      store={item}
      showClosedOverlay={
        item.isAvailable === false
        || ('isClosed' in item && item.isClosed === true)
      }
      onClosedPress={
        item.isAvailable === false
        || ('isClosed' in item && item.isClosed === true)
          ? () => handleClosedStorePress(item)
          : undefined
      }
    />
  );

  return (
    <View style={[styles.section, { gap: spacing.md, paddingHorizontal: gutter }]}>
      <SectionActionHeader
        actionLabel={shouldShowSeeAll ? t('multi_vendor_see_all') : undefined}
        density="compact"
        title={t('multi_vendor_nearby_store_title')}
        onActionPress={handleSeeAllNearbyRestaurants}
      />

      {isNearbyStoresPending ? (
        <DiscoveryResultsSkeleton />
      ) : isEmpty ? (
        <DeliveriesSectionEmptyState
          title={t('multi_vendor_home_section_empty_title')}
          message={t('multi_vendor_location_stores_empty')}
        />
      ) : (
        <HorizontalList
          data={nearbyStoresData}
          keyExtractor={(item) => item.storeId}
          contentContainerStyle={{
            paddingBottom: spacing.lg,
            paddingRight: gutter,
            paddingTop: spacing.xs,
          }}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={renderItem}
        />
      )}

      {onClosedStorePress ? null : (
        <ClosedStoreMenuPopup
          onClose={() => setSelectedClosedStore(null)}
          onSeeMenu={(store) => {
            pushStoreDetails(navigation, store);
            setSelectedClosedStore(null);
          }}
          store={selectedClosedStore}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
});
