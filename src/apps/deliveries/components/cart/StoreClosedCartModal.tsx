import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppPopup from '../../../../general/components/AppPopup';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  onClose: () => void;
  storeName?: string | null;
  visible: boolean;
};

export default function StoreClosedCartModal({ onClose, storeName, visible }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();
  const resolvedStoreName = storeName?.trim() || t('store_details_closed_store_fallback_name');

  return (
    <AppPopup
      containerStyle={[styles.popup, { backgroundColor: colors.surface }]}
      description={t('cart_store_closed_description', { storeName: resolvedStoreName })}
      dismissOnOverlayPress
      illustration={
        <View style={[styles.illustration, { backgroundColor: colors.dangerSoft }]}>
          <Ionicons color={colors.danger} name="time-outline" size={28} />
        </View>
      }
      onRequestClose={onClose}
      primaryAction={{
        label: t('store_details_close'),
        onPress: onClose,
      }}
      title={t('cart_store_closed_title', { storeName: resolvedStoreName })}
      visible={visible}
    />
  );
}

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  popup: {
    gap: 0,
  },
});
