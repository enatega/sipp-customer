import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAddressStore } from '../../../general/stores/useAddressStore';
import { areDeliveryAddressesEqual } from '../../../general/utils/address';
import { useBrowseCityStore } from '../stores/useBrowseCityStore';

export default function useCompleteBrowseAddressFlow() {
  const pendingBaseline = useBrowseCityStore((state) => state.pendingAddedAddressBaseline);
  const openPicker = useBrowseCityStore((state) => state.openPicker);
  const selectBrowseAddress = useBrowseCityStore((state) => state.selectAddress);
  const clearPending = useBrowseCityStore((state) => state.clearAddAddressPending);
  const pendingBaselineRef = useRef(pendingBaseline);
  pendingBaselineRef.current = pendingBaseline;

  useFocusEffect(useCallback(() => {
    const pendingBaseline = pendingBaselineRef.current;
    if (pendingBaseline === undefined) return;
    const selectedAddress = useAddressStore.getState().selectedAddress;
    clearPending();
    if (selectedAddress?.id && !areDeliveryAddressesEqual(selectedAddress, pendingBaseline)) {
      void selectBrowseAddress(selectedAddress);
    } else {
      openPicker();
    }
  }, [clearPending, openPicker, selectBrowseAddress]));
}
