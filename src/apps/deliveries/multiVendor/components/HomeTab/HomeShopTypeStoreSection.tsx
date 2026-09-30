import React from 'react';
import { View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useShopTypeStores } from '../../../hooks';
import StoreCard from '../../../components/storeCard/StoreCard';
import { DiscoveryResultsSkeleton, DiscoverySectionState } from '../../../components/discovery';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import type { DeliveryNearbyStore } from '../../../api/types';
import type { MultiVendorStackParamList } from '../../navigation/types';
import type { DeliveriesStackParamList } from '../../../navigation/types';

type Props = {
  shopTypeId: string;
  title: string;
  onClosedStorePress: (store: DeliveryNearbyStore) => void;
};

export default function HomeShopTypeStoreSection({ shopTypeId, title, onClosedStorePress }: Props) {
  const navigation = useNavigation<CompositeNavigationProp<
    NativeStackNavigationProp<MultiVendorStackParamList>,
    NativeStackNavigationProp<DeliveriesStackParamList>
  >>();
  const { t } = useTranslation('deliveries');
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { data = [], isPending, isError } = useShopTypeStores(shopTypeId, { home: true });
  const displayTitle = title.replace(/%amp;|&amp;|&#38;/gi, '&');

  return <View style={{ gap: spacing.md, paddingHorizontal: gutter }}>
    <SectionActionHeader
      title={displayTitle}
      actionLabel={data.length ? t('multi_vendor_see_all') : undefined}
      onActionPress={() => navigation.navigate('SeeAllScreen', {
        queryType: 'shop-type-stores', title: displayTitle, cardType: 'store', shopTypeId,
      })}
    />
    {isPending ? <DiscoveryResultsSkeleton home /> : isError ? <DiscoverySectionState
      tone="error"
      title={t('multi_vendor_home_section_error_title')}
      message={t('multi_vendor_home_section_error_message')}
    /> : data.length === 0 ? <DeliveriesSectionEmptyState
      title={t('home_no_shop_type_stores_title')}
      message={t('multi_vendor_shop_type_stores_empty')}
    /> : <HorizontalList
      data={data}
      keyExtractor={(item) => item.storeId}
      contentContainerStyle={{ paddingBottom: spacing.lg, paddingRight: gutter, paddingTop: spacing.xs }}
      ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      renderItem={({ item }) => <StoreCard
        store={item}
        layout="home"
        showClosedOverlay={item.isAvailable === false || ('isClosed' in item && item.isClosed === true)}
        onClosedPress={item.isAvailable === false || ('isClosed' in item && item.isClosed === true) ? () => onClosedStorePress(item) : undefined}
      />}
    />}
  </View>;
}
