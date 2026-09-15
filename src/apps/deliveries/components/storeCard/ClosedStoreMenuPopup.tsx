import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AppPopup from '../../../../general/components/AppPopup';
import type { DeliveryNearbyStore } from '../../api/types';

type Props = {
  onClose: () => void;
  onSeeMenu: (store: DeliveryNearbyStore) => void;
  store: DeliveryNearbyStore | null;
};

export default function ClosedStoreMenuPopup({ onClose, onSeeMenu, store }: Props) {
  const { t } = useTranslation('deliveries');
  const storeName =
    store?.name?.trim() || t('store_details_closed_store_fallback_name');
  const handleSeeMenu = useCallback(() => {
    if (store) {
      onSeeMenu(store);
    }
  }, [onSeeMenu, store]);

  return (
    <AppPopup
      description={t('store_details_closed_store_description', { storeName })}
      dismissOnOverlayPress
      onRequestClose={onClose}
      primaryAction={{
        label: t('store_details_close'),
        onPress: onClose,
      }}
      secondaryAction={{
        label: t('store_closed_see_menu'),
        onPress: handleSeeMenu,
        variant: 'secondary',
      }}
      title={t('store_closed_modal_title', { storeName })}
      visible={Boolean(store)}
    />
  );
}
