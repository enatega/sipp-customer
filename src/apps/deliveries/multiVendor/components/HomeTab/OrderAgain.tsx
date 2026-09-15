import React from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { useOrderAgain } from '../../../hooks';
import ProductCard from '../../../components/productCard/ProductCard';
import StoreMiniCardSkeleton from './HomeTabSkeletons/StoreMiniCardSkeleton';
import type { MultiVendorBottomTabParamList } from '../../navigation/types';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import type { GenericListFilters } from '../../../components/filters/types';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';

type NavigationProp = BottomTabNavigationProp<MultiVendorBottomTabParamList>;

type Props = {
  search?: string;
  selectedCategoryId?: string | null;
  selectedShopTypeId?: string | null;
  filters?: GenericListFilters;
};

export default function OrderAgain(props: Props) {
  const { search, selectedCategoryId, selectedShopTypeId, filters } = props;
  const { t } = useTranslation('deliveries');
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
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

  const { data: orderAgainData = [], isPending: isOrderAgainPending } = useOrderAgain(
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
  const isEmpty = !isOrderAgainPending && orderAgainData.length === 0;
  const shouldShowSeeAll = !isOrderAgainPending && orderAgainData.length > 0;
  const navigation = useNavigation<NavigationProp>();

  const handleSeeAllPress = () => {
    navigation.navigate('MultiVendorTabOrders');
  };
  const handleDiscoverPress = () => {
    navigation.navigate('MultiVendorTabSearch');
  };
  return (
    <View
      style={[styles.section, { gap: spacing.md, paddingHorizontal: gutter }]}
    >
      <SectionActionHeader
        actionLabel={shouldShowSeeAll ? t('multi_vendor_see_all') : undefined}
        title={t('multi_vendor_order_again_title')}
        onActionPress={handleSeeAllPress}
      />

      {isOrderAgainPending ? (
        <StoreMiniCardSkeleton />
      ) : isEmpty ? (
        <DeliveriesSectionEmptyState
          actionLabel={t('multi_vendor_home_empty_order_action')}
          message={t('multi_vendor_home_section_empty_order_again')}
          onActionPress={handleDiscoverPress}
          title={t('multi_vendor_home_empty_order_again_title')}
          variant="orderAgain"
        />
      ) : (
        <HorizontalList
          data={orderAgainData}
          keyExtractor={(item) => item.productId}
          contentContainerStyle={{
            paddingBottom: spacing.lg,
            paddingRight: gutter,
            paddingTop: spacing.xs,
          }}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <ProductCard product={item} variant="orderAgain" />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
});
