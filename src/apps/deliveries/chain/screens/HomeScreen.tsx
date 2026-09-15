import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AddressSelectionBottomSheet from '../../../../general/components/address/AddressSelectionBottomSheet';
import type { ProfileAddress } from '../../../../general/api/profileService';
import { useAddress } from '../../hooks';
import useAddressSelectionSheet from '../../../../general/hooks/useAddressSelectionSheet';
import useCurrentLocation from '../../../../general/hooks/useCurrentLocation';
import useSavedAddresses from '../../../../general/hooks/useSavedAddresses';
import useSelectSavedAddress from '../../../../general/hooks/useSelectSavedAddress';
import type { DeliveriesStackParamList } from '../../navigation/types';
import { showToast } from '../../../../general/components/AppToast';
import { useTheme } from '../../../../general/theme/theme';
import ChainCategorySection from '../components/homeScreen/ChainCategorySection';
import ChainDealsSection from '../components/homeScreen/ChainDealsSection';
import ChainMenuTemplateDropdown from '../components/homeScreen/ChainMenuTemplateDropdown';
import ChainSpecialOffersBanner from '../components/homeScreen/ChainSpecialOffersBanner';
import type { ChainMenuTemplate } from '../api/types';
import useChainMenuTemplates from '../hooks/useChainMenuTemplates';
import { useChainMenuStore } from '../stores/useChainMenuStore';
import HomeEntrance from '../../components/home/HomeEntrance';
import DeliveryHomeScaffold from '../../components/home/DeliveryHomeScaffold';
import useDeliveriesTabSheetOffset from '../../hooks/useDeliveriesTabSheetOffset';

type Props = Record<string, never>;

export default function HomeScreen({}: Props) {
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
  const { selectedAddress } = useAddress();
  const { refreshCurrentLocation } = useCurrentLocation();
  const { selectSavedAddress, selectingAddressId } = useSelectSavedAddress("deliveries");
  const {
    data: menuTemplates,
    isError: hasMenuTemplatesError,
    isLoading: isMenuTemplatesLoading,
  } = useChainMenuTemplates();
  const selectedMenuTemplateId = useChainMenuStore(
    (state) => state.selectedMenuTemplateId,
  );
  const setSelectedMenuTemplateId = useChainMenuStore(
    (state) => state.setSelectedMenuTemplateId,
  );
  const clearSelectedMenuTemplateId = useChainMenuStore(
    (state) => state.clearSelectedMenuTemplateId,
  );
  const {
    isVisible: isAddressSheetVisible,
    open: handleOpenAddressSheet,
    close: handleCloseAddressSheet,
  } = useAddressSelectionSheet({
    addressesCount: addresses.length,
    isLoading: isAddressesLoading,
  });

  useEffect(() => {
    if (menuTemplates.length === 0) {
      clearSelectedMenuTemplateId();
      return;
    }

    if (
      selectedMenuTemplateId &&
      menuTemplates.some((template) => template.id === selectedMenuTemplateId)
    ) {
      return;
    }

    setSelectedMenuTemplateId(menuTemplates[0].id);
  }, [
    clearSelectedMenuTemplateId,
    menuTemplates,
    selectedMenuTemplateId,
    setSelectedMenuTemplateId,
  ]);

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
      origin: 'chain-home'
    });
  }, [handleCloseAddressSheet, navigation]);

  const handleUseCurrentLocation = useCallback(async () => {
    handleCloseAddressSheet();
    const currentLocation = await refreshCurrentLocation();
    navigation.navigate('AddressChooseOnMap', {
      appPrefix: "deliveries",
      initialLatitude: currentLocation?.latitude,
      initialLongitude: currentLocation?.longitude,
      origin: 'chain-home'
    });
  }, [handleCloseAddressSheet, navigation, refreshCurrentLocation]);

  const handleTemplateSelect = useCallback((template: ChainMenuTemplate) => {
    setSelectedMenuTemplateId(template.id);
  }, [setSelectedMenuTemplateId]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('ChainTabSearch' as never);
  }, [navigation]);

  return (
    <>
      <DeliveryHomeScaffold
        contentContainerStyle={styles.scrollContent}
        headerProps={{
          addressVariant: 'label',
          addresses,
          onAddAddressPress: handleOpenAddressSheet,
          onAddressPress: handleOpenAddressSheet,
          rightAccessory: (
            <ChainMenuTemplateDropdown
              hasError={hasMenuTemplatesError}
              isLoading={isMenuTemplatesLoading}
              items={menuTemplates}
              onSelectTemplate={handleTemplateSelect}
              selectedTemplateId={selectedMenuTemplateId}
            />
          ),
          showCartButton: false,
        }}
        onSearchPress={handleSearchPress}
      >
        <HomeEntrance index={1} style={[styles.sectionGroup, { gap: spacing.section.default }]}>
          <ChainSpecialOffersBanner />
          <ChainCategorySection isTemplatePending={isMenuTemplatesLoading} />
        </HomeEntrance>
        <HomeEntrance index={2}>
          <ChainDealsSection isTemplatePending={isMenuTemplatesLoading} />
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
