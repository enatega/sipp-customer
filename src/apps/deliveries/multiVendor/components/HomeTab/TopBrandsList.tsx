import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { useTopBrands } from '../../../hooks';
import TopBrandsListSkeleton from './HomeTabSkeletons/TopBrandsListSkeleton';
import TopBrandCircleCard from './TopBrandCircleCard';
import type { MultiVendorStackParamList } from '../../navigation/types';
import useTopBrandNavigation from '../../hooks/useTopBrandNavigation';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import type { DeliveryNearbyStore } from '../../../api/types';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';

type NavigationProp = NativeStackNavigationProp<
  MultiVendorStackParamList,
  'TopBrandsSeeAll'
>;

type Props = {
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
};

export default function TopBrandsList({ onClosedStorePress }: Props) {
  const { t } = useTranslation('deliveries');
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const navigation = useNavigation<NavigationProp>();
  const { data: topBrands = [], isPending: isTopBrandsPending } = useTopBrands();
  const { canOpenBrand, openTopBrand } = useTopBrandNavigation();
  const handleSeeAllPress = useCallback(() => {
    navigation.navigate('TopBrandsSeeAll');
  }, [navigation]);
  return (
    <View style={{ gap: spacing.sm, paddingHorizontal: gutter }}>
      <SectionActionHeader
        actionLabel={topBrands.length ? t('multi_vendor_see_all') : undefined}
        title={t('multi_vendor_top_brands_title')}
        onActionPress={handleSeeAllPress}
      />

      {isTopBrandsPending ? (
        <TopBrandsListSkeleton />
      ) : topBrands.length === 0 ? (
        <DeliveriesSectionEmptyState title={t('multi_vendor_top_brands_title')} message={t('multi_vendor_location_stores_empty')} />
      ) : (
        <HorizontalList
          data={topBrands}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={{
            paddingBottom: spacing.xs,
            paddingRight: gutter,
            paddingTop: spacing.xs,
          }}
          ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
          renderItem={({ item }) => (
            <TopBrandCircleCard
              brand={item}
              isDisabled={!canOpenBrand(item)}
              onPress={() => openTopBrand(item, onClosedStorePress)}
            />
          )}
        />
      )}
    </View>
  );
}
