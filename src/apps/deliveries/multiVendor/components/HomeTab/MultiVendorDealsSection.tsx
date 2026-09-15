import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Deals from '../../../components/deals/Deals';
import { useDeals } from '../../../hooks';
import type { DeliveriesStackParamList } from '../../../navigation/types';
import type { GenericListFilters } from '../../../components/filters/types';
import type { DeliveryNearbyStore } from '../../../api/types';

type NavigationProp = NativeStackNavigationProp<DeliveriesStackParamList>;

type Props = {
  search?: string;
  selectedCategoryId?: string | null;
  selectedShopTypeId?: string | null;
  filters?: GenericListFilters;
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
};

export default function MultiVendorDealsSection(props: Props) {
  const {
    search,
    selectedCategoryId,
    selectedShopTypeId,
    filters,
    onClosedStorePress,
  } = props;
  const { t } = useTranslation('deliveries');
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

  const {
    data: dealsData = [],
    isPending: isDealsPending,
    isError: hasDealsError,
  } = useDeals(
    {
      search,
      category_id: resolvedCategoryId,
      category_ids: resolvedCategoryIds.length > 0 ? resolvedCategoryIds : undefined,
      subcategory_id: undefined,
      shop_type_id: activeShopTypeId,
    },
    {
      enabled: !shouldSkipBecauseEmptyShopType,
    },
  );
  const navigation = useNavigation<NavigationProp>();

  return (
    <Deals
      actionLabel={t('multi_vendor_see_all')}
      isError={hasDealsError}
      isPending={isDealsPending}
      items={dealsData}
      onClosedStorePress={onClosedStorePress}
      onActionPress={() => {
        navigation.navigate('DealsSeeAll');
      }}
      title={t('multi_vendor_deals_title')}
    />
  );
}
