import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  DeliveryNearbyStore,
  DeliveryTopBrand,
} from '../../api/types';
import { useNearbyStores } from '../../hooks';
import type { MultiVendorStackParamList } from '../navigation/types';
import { pushStoreDetails } from '../../navigation/storeDetailsNavigation';

type NavigationProp = NativeStackNavigationProp<MultiVendorStackParamList>;

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function isBrandStoreNameMatch(
  brandName: string,
  storeName: string,
) {
  return (
    storeName === brandName ||
    storeName.includes(brandName) ||
    brandName.includes(storeName)
  );
}

function buildStoreFromBrand(brand: DeliveryTopBrand): DeliveryNearbyStore | undefined {
  if (!brand.storeId) {
    return undefined;
  }

  return {
    storeId: brand.storeId,
    vendorId: brand.vendorId ?? '',
    name: brand.name,
    logo: brand.logo ?? null,
    deal: brand.deal ?? null,
    dealType: brand.dealType ?? null,
    dealAmount: brand.dealAmount ?? null,
  };
}

function isStoreClosed(store: DeliveryNearbyStore) {
  return (
    store.isAvailable === false
    || ('isClosed' in store && store.isClosed === true)
  );
}

export default function useTopBrandNavigation() {
  const navigation = useNavigation<NavigationProp>();
  const { data: nearbyStores = [] } = useNearbyStores();

  const resolveStoreFromBrand = useCallback(
    (brand: DeliveryTopBrand): DeliveryNearbyStore | undefined => {
      if (brand.storeId) {
        const nearbyMatch = nearbyStores.find(
          (store) => store.storeId === brand.storeId,
        );

        return nearbyMatch ?? buildStoreFromBrand(brand);
      }

      const normalizedBrandName = normalizeValue(brand.name);

      if (!normalizedBrandName) {
        if (!brand.vendorId) {
          return undefined;
        }

        const vendorMatches = nearbyStores.filter(
          (store) => store.vendorId === brand.vendorId,
        );

        return vendorMatches.length === 1 ? vendorMatches[0] : undefined;
      }

      const exactNameMatch = nearbyStores.find(
        (store) => normalizeValue(store.name) === normalizedBrandName,
      );

      if (exactNameMatch) {
        return exactNameMatch;
      }

      const partialNameMatch = nearbyStores.find((store) =>
        isBrandStoreNameMatch(
          normalizedBrandName,
          normalizeValue(store.name),
        ),
      );

      if (partialNameMatch) {
        return partialNameMatch;
      }

      if (!brand.vendorId) {
        return undefined;
      }

      const vendorMatches = nearbyStores.filter(
        (store) => store.vendorId === brand.vendorId,
      );

      return vendorMatches.length === 1 ? vendorMatches[0] : undefined;
    },
    [nearbyStores],
  );

  const canOpenBrand = useCallback(
    (brand: DeliveryTopBrand) =>
      Boolean(resolveStoreFromBrand(brand) || brand.vendorId),
    [resolveStoreFromBrand],
  );

  const openTopBrand = useCallback(
    (
      brand: DeliveryTopBrand,
      onClosedStorePress?: (store: DeliveryNearbyStore) => void,
    ) => {
      const matchedStore = resolveStoreFromBrand(brand);

      if (matchedStore) {
        if (isStoreClosed(matchedStore) && onClosedStorePress) {
          onClosedStorePress(matchedStore);
          return;
        }

        pushStoreDetails(navigation, matchedStore);
        return;
      }

      if (!brand.vendorId) {
        return;
      }

      navigation.navigate('SeeAllScreen', {
        queryType: 'top-brand-stores',
        title: brand.name,
        cardType: 'store',
        vendorId: brand.vendorId,
      });
    },
    [navigation, resolveStoreFromBrand],
  );

  return {
    canOpenBrand,
    openTopBrand,
  };
}
