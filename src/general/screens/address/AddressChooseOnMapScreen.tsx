import React, { useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AddressChooseOnMap from '../../components/address/AddressChooseOnMap';
import type { MapAddressResult } from '../../components/address/AddressChooseOnMap';
import type {
  AddressFlowHostParamList,
  AddressFlowParamList,
} from '../../navigation/addressFlowTypes';
import { authSession } from '../../auth/authSession';
import useAddress from '../../hooks/useAddress';
import {
  createDeliveryAddress,
  GUEST_SELECTED_LOCATION_ADDRESS_ID,
} from '../../utils/address';
import { navigateAfterAddressSelection } from '../../navigation/addressFlowNavigation';

export default function AddressChooseOnMapScreen() {
  const nav = useNavigation<NativeStackNavigationProp<AddressFlowHostParamList>>();
  const route = useRoute();
  const { t } = useTranslation('general');
  const params =
    (route.params as AddressFlowParamList['AddressChooseOnMap']) ?? {};
  const { setSelectedAddress } = useAddress();

  const handleConfirm = useCallback(
    async (result: MapAddressResult) => {
      const accessToken = await authSession.getAccessToken();
      if (!accessToken) {
        setSelectedAddress(
          createDeliveryAddress({
            id: GUEST_SELECTED_LOCATION_ADDRESS_ID,
            address: result.description,
            latitude: result.latitude,
            longitude: result.longitude,
          }),
        );
        navigateAfterAddressSelection(nav, params.origin);
        return;
      }

      nav.navigate('AddressDetail', {
        address: result.description,
        latitude: result.latitude,
        longitude: result.longitude,
        ...(params.editAddressId
          ? {
              appPrefix: params.appPrefix,
              editAddressId: params.editAddressId,
              editType: params.editType,
              editLocationName: params.editLocationName,
              origin: params.origin,
            }
          : { appPrefix: params.appPrefix, origin: params.origin }),
      });
    },
    [nav, params, setSelectedAddress],
  );

  return (
    <AddressChooseOnMap
      initialCoordinate={
        typeof params.initialLatitude === 'number' &&
        typeof params.initialLongitude === 'number'
          ? {
              latitude: params.initialLatitude,
              longitude: params.initialLongitude,
            }
          : null
      }
      onBackPress={() => nav.goBack()}
      onConfirm={handleConfirm}
      confirmLabel={t('address_confirm_location')}
      locatingLabel={t('address_locating')}
      fallbackLabel={t('address_selected_location')}
    />
  );
}
