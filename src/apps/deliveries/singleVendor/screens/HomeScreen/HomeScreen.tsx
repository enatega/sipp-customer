import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AddressSelectionBottomSheet from '../../../../../general/components/address/AddressSelectionBottomSheet';
import { showToast } from '../../../../../general/components/AppToast';
import { useTheme } from '../../../../../general/theme/theme';
import { useCartCount } from '../../../hooks/useCart';
import useAddress from '../../../../../general/hooks/useAddress';
import useCurrentLocation from '../../../../../general/hooks/useCurrentLocation';
import useAddressSelectionSheet from '../../../../../general/hooks/useAddressSelectionSheet';
import useSavedAddresses from '../../../../../general/hooks/useSavedAddresses';
import useSelectSavedAddress from '../../../../../general/hooks/useSelectSavedAddress';
import type { DeliveriesStackParamList } from '../../../navigation/types';
import SingleVendorCategorySection from '../../components/HomeScreen/SingleVendorCategorySection';
import SingleVendorDealsSection from '../../components/HomeScreen/SingleVendorDealsSection';
import SingleVendorSpecialOffersBanner from '../../components/HomeScreen/SingleVendorSpecialOffersBanner';
import HomeEntrance from '../../../components/home/HomeEntrance';
import DeliveryHomeScaffold from '../../../components/home/DeliveryHomeScaffold';
import useDeliveriesTabSheetOffset from '../../../hooks/useDeliveriesTabSheetOffset';

export default function HomeScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation =
    useNavigation<NativeStackNavigationProp<DeliveriesStackParamList>>();
  const addressSheetBottomOffset = useDeliveriesTabSheetOffset();
  const {
    addresses,
    isLoading: isAddressesLoading,
    refetch,
  } = useSavedAddresses("deliveries");
  const { data: cartCount } = useCartCount();
  const { selectedAddress } = useAddress();
  const { refreshCurrentLocation } = useCurrentLocation();
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
    async (address: (typeof addresses)[number]) => {
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
      origin: 'single-vendor-home'
    });
  }, [handleCloseAddressSheet, navigation]);

  const handleUseCurrentLocation = useCallback(async () => {
    handleCloseAddressSheet();
    const currentLocation = await refreshCurrentLocation();
    navigation.navigate('AddressChooseOnMap', {
      appPrefix: "deliveries",
      initialLatitude: currentLocation?.latitude,
      initialLongitude: currentLocation?.longitude,
      origin: 'single-vendor-home'
    });
  }, [handleCloseAddressSheet, navigation, refreshCurrentLocation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('SingleVendorTabSearch' as never);
  }, [navigation]);

  return (
    <>
      <DeliveryHomeScaffold
        contentContainerStyle={styles.scrollContent}
        headerProps={{
          addresses,
          cartCount: cartCount?.totalItems,
          onAddAddressPress: handleOpenAddressSheet,
          onAddressPress: handleOpenAddressSheet,
          onCartPress: handleCartPress,
        }}
        onSearchPress={handleSearchPress}
      >
        <HomeEntrance index={1} style={[styles.sectionGroup, { gap: spacing.section.default }]}>
          <SingleVendorSpecialOffersBanner />
          <SingleVendorCategorySection />
        </HomeEntrance>
        <HomeEntrance index={2}>
          <SingleVendorDealsSection />
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
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 0,
  },
  sectionGroup: {},
});
