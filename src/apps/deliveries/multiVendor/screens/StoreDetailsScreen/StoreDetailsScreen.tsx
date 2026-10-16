import React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { MultiVendorStackParamList } from '../../navigation/types';
import StoreDetailsContent from '../../components/StoreDetails/StoreDetailsContent';

export default function StoreDetailsScreen() {
  const route = useRoute<RouteProp<MultiVendorStackParamList, 'StoreDetails'>>();
  const storeId = route.params?.storeId ?? route.params?.store?.storeId;
  return <StoreDetailsContent key={storeId ?? 'missing'} selectedStore={route.params?.store} sharedStoreId={storeId} />;
}
