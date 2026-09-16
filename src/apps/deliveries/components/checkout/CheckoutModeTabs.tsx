import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import TabSwitcher from '../../../../general/components/TabSwitcher';
import type { CheckoutOrderType } from '../../api/orderServiceTypes';

type Props = {
  activeMode: CheckoutOrderType;
  isDeliveryEnabled: boolean;
  isPickupEnabled: boolean;
  onModeChange: (mode: CheckoutOrderType) => void;
};

export default function CheckoutModeTabs({
  activeMode,
  isDeliveryEnabled,
  isPickupEnabled,
  onModeChange,
}: Props) {
  const { t } = useTranslation('deliveries');

  return (
    <TabSwitcher
      activeKey={activeMode}
      onChange={(key) => onModeChange(key as CheckoutOrderType)}
      style={styles.container}
      tabs={[
        {
          disabled: !isDeliveryEnabled,
          key: 'delivery',
          label: t('checkout_fulfillment_delivery'),
        },
        {
          disabled: !isPickupEnabled,
          key: 'pickup',
          label: t('checkout_fulfillment_pickup'),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
