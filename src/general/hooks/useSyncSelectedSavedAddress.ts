import { useEffect, useMemo } from 'react';
import type { SavedAddress } from '../api/addressService';
import {
  areDeliveryAddressesEqual,
  createSelectedDeliveryAddress,
} from '../utils/address';
import { useAddressStore } from '../stores/useAddressStore';

export default function useSyncSelectedSavedAddress(
  addresses: SavedAddress[],
  isLoading: boolean,
) {
  const apiSelectedAddress = useMemo(
    () => createSelectedDeliveryAddress(addresses),
    [addresses],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const {
      clearSelectedAddress,
      selectedAddress,
      setSelectedAddress,
    } = useAddressStore.getState();

    // A saved/default address always wins over the ephemeral "current
    // location" marker the home screen hydrates while no default exists —
    // otherwise, once current-location is set, it would never be replaced
    // even after the user's real default address becomes known.
    if (selectedAddress?.id === 'current-location' && !apiSelectedAddress) {
      return;
    }

    if (!apiSelectedAddress) {
      const hasStoredSavedAddress = Boolean(
        selectedAddress?.id &&
          addresses.some((address) => address.id === selectedAddress.id),
      );

      if (hasStoredSavedAddress) {
        clearSelectedAddress();
      }

      return;
    }

    if (areDeliveryAddressesEqual(selectedAddress, apiSelectedAddress)) {
      return;
    }

    setSelectedAddress(apiSelectedAddress);
  }, [addresses, apiSelectedAddress, isLoading]);
}
