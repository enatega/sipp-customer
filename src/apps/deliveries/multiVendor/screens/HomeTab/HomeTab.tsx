import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../../general/theme/theme';
import { showToast } from '../../../../../general/components/AppToast';
import AddressSelectionBottomSheet from '../../../../../general/components/address/AddressSelectionBottomSheet';
import type { DeliveriesStackParamList } from '../../../navigation/types';
import ShopTypeList from '../../components/HomeTab/ShopTypeList';
import ShopTypeStoreSections from '../../components/HomeTab/ShopTypeStoreSections';
import MultiVendorSpecialOffers from '../../components/HomeTab/SpecialOffersBanner';
import TopBrandsList from '../../components/HomeTab/TopBrandsList';
import NearbyStoreList from '../../components/HomeTab/NearbyStoreList';
import MultiVendorDealsSection from '../../components/HomeTab/MultiVendorDealsSection';
import OrderAgain from '../../components/HomeTab/OrderAgain';
import AllInOneQuickActions, {
  type HomeQuickActionId,
} from '../../components/HomeTab/AllInOneQuickActions';
import useAddressSelectionSheet from '../../../../../general/hooks/useAddressSelectionSheet';
import type { ProfileAddress } from '../../../../../general/api/profileService';
import useSavedAddresses from '../../../../../general/hooks/useSavedAddresses';
import { styles } from './HomeTabStyle';
import useAddress from '../../../../../general/hooks/useAddress';
import useCurrentLocation from '../../../../../general/hooks/useCurrentLocation';
import useSelectSavedAddress from '../../../../../general/hooks/useSelectSavedAddress';
import { deliveryKeys } from '../../../api/queryKeys';
import HomeEntrance from '../../../components/home/HomeEntrance';
import DeliveryHomeScaffold from '../../../components/home/DeliveryHomeScaffold';
import type { DeliveryNearbyStore } from '../../../api/types';
import ClosedStoreMenuPopup from '../../../components/storeCard/ClosedStoreMenuPopup';
import { pushStoreDetails } from '../../../navigation/storeDetailsNavigation';
import IconButton from '../../../../../general/components/IconButton';
import Icon from '../../../../../general/components/Icon';
import type {
  MultiVendorBottomTabParamList,
  MultiVendorStackParamList,
} from '../../navigation/types';
import useDeliveriesTabSheetOffset from '../../../hooks/useDeliveriesTabSheetOffset';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MultiVendorBottomTabParamList, 'MultiVendorTabHome'>,
  CompositeNavigationProp<
    NativeStackNavigationProp<MultiVendorStackParamList>,
    NativeStackNavigationProp<DeliveriesStackParamList>
  >
>;

export default function HomeTab() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<NavProp>();
  const addressSheetBottomOffset = useDeliveriesTabSheetOffset();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClosedStore, setSelectedClosedStore] =
    useState<DeliveryNearbyStore | null>(null);
  const {
    addresses,
    isLoading: isAddressesLoading,
    refetch,
  } = useSavedAddresses("deliveries");
  const { selectedAddress, setSelectedAddress } = useAddress();
  const { currentCoordinates, refreshCurrentLocation } = useCurrentLocation();
  const { selectSavedAddress, selectingAddressId } = useSelectSavedAddress("deliveries");
  const {
    isVisible: isAddressSheetVisible,
    open: handleOpenAddressSheet,
    close: handleCloseAddressSheet,
  } = useAddressSelectionSheet({
    addressesCount: addresses.length,
    isLoading: isAddressesLoading,
  });

  const handleSelectAddress = useCallback(
    async (address: ProfileAddress) => {
      try {
        const isSelected = await selectSavedAddress(address.id);

        if (!isSelected) {
          return;
        }

        void refetch();
        handleCloseAddressSheet();
      } catch {
        showToast.error(t('address_select_error'));
      }
    },
    [handleCloseAddressSheet, refetch, selectSavedAddress, t],
  );

  const handleAddAddressPress = useCallback(() => {
    handleCloseAddressSheet();
    navigation.navigate('AddressSearch', {
      appPrefix: "deliveries",
      origin: 'multi-vendor-home'
    });
  }, [handleCloseAddressSheet, navigation]);

  const handleUseCurrentLocation = useCallback(async () => {
    handleCloseAddressSheet();
    const currentLocation = await refreshCurrentLocation();
    navigation.navigate('AddressChooseOnMap', {
      appPrefix: "deliveries",
      initialLatitude: currentLocation?.latitude,
      initialLongitude: currentLocation?.longitude,
      origin: 'multi-vendor-home'
    });
  }, [handleCloseAddressSheet, navigation, refreshCurrentLocation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('MultiVendorTabSearch', {
      autoFocusRequestId: Date.now(),
    });
  }, [navigation]);

  const handleQuickActionPress = useCallback((actionId: HomeQuickActionId) => {
    switch (actionId) {
      case 'browse':
        navigation.navigate('MainSeeAllScreen');
        break;
      case 'deals':
        navigation.navigate('DealsSeeAll');
        break;
      case 'orders':
        navigation.navigate('MultiVendorTabOrders');
        break;
      case 'favourites':
        navigation.navigate('Favourites');
        break;
    }
  }, [navigation]);

  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleClosedStorePress = useCallback((store: DeliveryNearbyStore) => {
    setSelectedClosedStore(store);
  }, []);

  const handleCloseClosedStorePopup = useCallback(() => {
    setSelectedClosedStore(null);
  }, []);

  const handleSeeClosedStoreMenu = useCallback((store: DeliveryNearbyStore) => {
    setSelectedClosedStore(null);
    pushStoreDetails(navigation, store);
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        refetch(),
        queryClient.refetchQueries({
          queryKey: deliveryKeys.discovery(),
          type: 'active',
        }),
        queryClient.refetchQueries({
          queryKey: deliveryKeys.cartCount(),
          type: 'active',
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetch]);

  useEffect(() => {
    if (!currentCoordinates || isAddressesLoading) {
      return;
    }

    if (selectedAddress?.id && selectedAddress.id !== 'current-location') {
      return;
    }

    const hasSelectedSavedAddress = addresses.some((address) => address.is_selected);

    if (hasSelectedSavedAddress && selectedAddress?.id !== 'current-location') {
      return;
    }

    if (
      selectedAddress?.id === 'current-location' &&
      selectedAddress.latitude === currentCoordinates.latitude &&
      selectedAddress.longitude === currentCoordinates.longitude
    ) {
      return;
    }

    let isMounted = true;

    const hydrateCurrentLocationAddress = async () => {
      try {
        const [result] = await Location.reverseGeocodeAsync(currentCoordinates);
        const locationName =
          result?.district ||
          result?.subregion ||
          result?.city ||
          result?.name ||
          t('address_selector_use_current_location');
        const addressParts = [
          result?.streetNumber,
          result?.street,
          result?.city,
          result?.region,
          result?.country,
        ]
          .filter(Boolean)
          .join(', ');
        const resolvedAddress = addressParts || locationName || t('address_selected_location');

        if (!isMounted) {
          return;
        }

        setSelectedAddress({
          id: 'current-location',
          locationName,
          address: resolvedAddress,
          latitude: currentCoordinates.latitude,
          longitude: currentCoordinates.longitude,
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setSelectedAddress({
          id: 'current-location',
          locationName: t('address_selector_use_current_location'),
          address: t('address_selected_location'),
          latitude: currentCoordinates.latitude,
          longitude: currentCoordinates.longitude,
        });
      }
    };

    void hydrateCurrentLocationAddress();

    return () => {
      isMounted = false;
    };
  }, [
    addresses,
    currentCoordinates,
    isAddressesLoading,
    selectedAddress,
    setSelectedAddress,
    t,
  ]);

  return (
    <>
      <DeliveryHomeScaffold
        contentContainerStyle={styles.contentContainer}
        headerProps={{
          addresses,
          onAddAddressPress: handleOpenAddressSheet,
          onAddressPress: handleOpenAddressSheet,
          rightAccessory: (
            <IconButton
              accessibilityLabel={t('profile_menu_notifications')}
              icon={(
                <Icon
                  color={colors.text}
                  name="notifications-outline"
                  size={20}
                  type="Ionicons"
                />
              )}
              onPress={handleNotificationsPress}
              style={{ backgroundColor: colors.surfaceElevated }}
              variant="outlined"
            />
          ),
          showCartButton: false,
        }}
        onSearchPress={handleSearchPress}
        refreshControl={(
          <RefreshControl
            onRefresh={() => {
              void handleRefresh();
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        )}
      >
        <HomeEntrance
          index={1}
          style={[styles.sectionGroup, { gap: spacing.section.compact }]}
        >
          <ShopTypeList />
          <MultiVendorSpecialOffers />
          <AllInOneQuickActions onActionPress={handleQuickActionPress} />
          <NearbyStoreList onClosedStorePress={handleClosedStorePress} />
        </HomeEntrance>
        <HomeEntrance index={2} style={[styles.sectionGroup, { gap: spacing.section.default }]}>
          <TopBrandsList onClosedStorePress={handleClosedStorePress} />
          <MultiVendorDealsSection onClosedStorePress={handleClosedStorePress} />
          <ShopTypeStoreSections onClosedStorePress={handleClosedStorePress} />
          <OrderAgain />
        </HomeEntrance>
      </DeliveryHomeScaffold>

      <AddressSelectionBottomSheet
        addresses={addresses}
        bottomOffset={addressSheetBottomOffset}
        isLoading={isAddressesLoading}
        isVisible={isAddressSheetVisible}
        onAddAddress={handleAddAddressPress}
        onClose={handleCloseAddressSheet}
        onSelectAddress={handleSelectAddress}
        onUseCurrentLocation={handleUseCurrentLocation}
        selectingAddressId={selectingAddressId}
        selectedAddressId={selectedAddress?.id}
      />
      <ClosedStoreMenuPopup
        onClose={handleCloseClosedStorePopup}
        onSeeMenu={handleSeeClosedStoreMenu}
        store={selectedClosedStore}
      />
    </>
  );
}
