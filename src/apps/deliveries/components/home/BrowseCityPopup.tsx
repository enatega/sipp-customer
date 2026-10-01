import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../../../../general/components/Text';
import { showToast } from '../../../../general/components/AppToast';
import { useTheme } from '../../../../general/theme/theme';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import useSavedAddresses from '../../../../general/hooks/useSavedAddresses';
import useSelectSavedAddress from '../../../../general/hooks/useSelectSavedAddress';
import { useAddressStore } from '../../../../general/stores/useAddressStore';
import { createDeliveryAddressFromSavedAddress, GUEST_SELECTED_LOCATION_ADDRESS_ID } from '../../../../general/utils/address';
import { getSavedAddressIcon, getSavedAddressTypeLabel } from '../../../../general/utils/savedAddressPresentation';
import { BROWSE_CITIES, useBrowseCityStore } from '../../stores/useBrowseCityStore';
import BrowseLocationOption from './BrowseLocationOption';

type Props = { visible: boolean; onAddAddress: () => void };

export default function BrowseCityPopup({ visible, onAddAddress }: Props) {
  const { t } = useTranslation('deliveries');
  const { t: tGeneral } = useTranslation('general');
  const { colors, elevation, shape, spacing } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const sessionQuery = useAuthSessionQuery();
  const cityName = useBrowseCityStore((state) => state.cityName);
  const browseAddress = useBrowseCityStore((state) => state.browseAddress);
  const dismissPicker = useBrowseCityStore((state) => state.dismissPicker);
  const selectCity = useBrowseCityStore((state) => state.selectCity);
  const selectBrowseAddress = useBrowseCityStore((state) => state.selectAddress);
  const resetUnavailableAddress = useBrowseCityStore((state) => state.resetUnavailableAddress);
  const { addresses, isLoading, error, refetch } = useSavedAddresses('deliveries');
  const { selectSavedAddress, selectingAddressId } = useSelectSavedAddress('deliveries');
  const [hasFreshAddressList, setHasFreshAddressList] = useState(false);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!visible) {
      setHasFreshAddressList(false);
      return;
    }
    let isActive = true;
    void refetchRef.current().then(() => {
      if (isActive) setHasFreshAddressList(true);
    });
    return () => { isActive = false; };
  }, [visible]);

  useEffect(() => {
    if (visible && hasFreshAddressList && !isLoading && !error && browseAddress?.id &&
      browseAddress.id !== GUEST_SELECTED_LOCATION_ADDRESS_ID &&
      !addresses.some((address) => address.id === browseAddress.id)) {
      void resetUnavailableAddress();
    }
  }, [addresses, browseAddress?.id, error, hasFreshAddressList, isLoading, resetUnavailableAddress, visible]);

  const handleSelectAddress = async (address: (typeof addresses)[number]) => {
    try {
      const selected = await selectSavedAddress(address.id);
      if (!selected) return;
      const location = createDeliveryAddressFromSavedAddress(address);
      if (!location) throw new Error('Address has no coordinates');
      await selectBrowseAddress(location);
      void refetch();
    } catch {
      showToast.error(t('address_select_error'));
    }
  };

  const guestAddress = browseAddress?.id === GUEST_SELECTED_LOCATION_ADDRESS_ID ? browseAddress : null;
  const canSaveAddress = sessionQuery.isPending || Boolean(sessionQuery.data?.token);
  const hasSelectedLocation = Boolean(cityName || browseAddress);

  return (
    <Modal visible={visible} transparent statusBarTranslucent
      animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={dismissPicker}>
      <View accessibilityViewIsModal onAccessibilityEscape={dismissPicker} style={[styles.overlay, {
        paddingHorizontal: spacing.md,
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.md,
      }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('browse_city_close')}
          onPress={dismissPicker} style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} />
        <View style={[styles.card, elevation.overlay, {
          backgroundColor: colors.surfaceElevated,
          borderRadius: shape.radius.sheet + 4,
          maxHeight: height - insets.top - insets.bottom - spacing.xl,
        }]}>
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />
          <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg }}
            showsVerticalScrollIndicator={false}>
            <Text variant="sectionTitle" weight="bold" accessibilityRole="header" style={styles.title}>
              {t('browse_city_title')}
            </Text>
            <View style={styles.options}>
              {BROWSE_CITIES.map((city) => <BrowseLocationOption key={city.name} label={city.name}
                kind="city" iconName="location"
                selected={!browseAddress && city.name === cityName}
                onPress={() => { void selectCity(city.name); }} />)}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.sectionHeading}>
              <Text variant="caption" weight="semiBold" color={colors.textSubtle} style={styles.sectionLabel}>
                {canSaveAddress ? t('browse_city_saved_addresses') : t('browse_city_address')}
              </Text>
              {isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </View>
            <View style={styles.savedList}>
              {guestAddress ? <BrowseLocationOption label={t('browse_city_selected_address')}
                subtitle={guestAddress.address} kind="address" iconName="location-outline" selected
                onPress={() => {
                  useAddressStore.getState().setSelectedAddress(guestAddress);
                  void selectBrowseAddress(guestAddress);
                }} /> : null}
              {addresses.map((address) => <BrowseLocationOption key={address.id}
                label={address.location_name?.trim() || getSavedAddressTypeLabel(address.type, tGeneral)}
                subtitle={address.address} kind="address" iconName={getSavedAddressIcon(address.type)}
                selected={browseAddress?.id === address.id}
                loading={selectingAddressId === address.id} disabled={Boolean(selectingAddressId)}
                onPress={() => { void handleSelectAddress(address); }} />)}
            </View>
            {error ? <Text variant="caption" color={colors.textSubtle} style={styles.error}>
              {t('browse_city_addresses_error')}
            </Text> : null}
          </ScrollView>
          <View style={[styles.footer, { borderTopColor: colors.divider, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>
            <Pressable accessibilityRole="button"
              accessibilityLabel={canSaveAddress ? t('browse_city_add_address') : t('browse_city_choose_address')}
              onPress={onAddAddress} style={({ pressed }) => [styles.addOption, {
                backgroundColor: pressed ? colors.statePressed : colors.surfaceElevated,
                borderColor: colors.primary,
                borderRadius: shape.radius.surface,
              }]}>
              <Ionicons name="add" size={22} color={colors.primary} />
              <Text variant="button" weight="semiBold" color={colors.primary}>
                {canSaveAddress ? t('browse_city_add_address') : t('browse_city_choose_address')}
              </Text>
            </Pressable>
            {hasSelectedLocation ? <Pressable accessibilityRole="button"
              accessibilityLabel={t('browse_city_continue')}
              accessibilityState={{ disabled: Boolean(selectingAddressId) }}
              disabled={Boolean(selectingAddressId)}
              onPress={dismissPicker} style={({ pressed }) => [styles.continueOption, {
                backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                borderRadius: shape.radius.surface,
                opacity: selectingAddressId ? 0.5 : 1,
              }]}>
              <Text variant="button" weight="semiBold" color={colors.onPrimary}>
                {t('browse_city_continue')}
              </Text>
            </Pressable> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 440, maxHeight: '100%', overflow: 'hidden' },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: 12 },
  title: { marginBottom: 18 },
  options: { gap: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0.6 },
  savedList: { gap: 8 },
  error: { marginBottom: 8 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, gap: 8 },
  addOption: { minHeight: 52, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  continueOption: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
});
