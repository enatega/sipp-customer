import { useQueryClient } from '@tanstack/react-query';
import { deliveryKeys } from '../../../apps/deliveries/api/queryKeys';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../../components/AppToast';
import Text from '../../components/Text';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../theme/theme';
import { ApiError } from '../../api/apiClient';
import { addressService } from '../../api/addressService';
import AddressDetailForm from '../../components/address/AddressDetailForm';
import type {
  AddressDetailFormHandle,
  AddressDetailFormSubmitData,
} from '../../components/address/AddressDetailForm';
import type {
  AddressFlowHostParamList,
  AddressFlowParamList,
} from '../../navigation/addressFlowTypes';
import type { AddressDetails, SavedAddress, AddressType } from '../../api/addressService';
import {
  createDeliveryAddress,
  createDeliveryAddressFromSavedAddress,
  GUEST_SELECTED_LOCATION_ADDRESS_ID,
} from '../../utils/address';
import useAddress from '../../hooks/useAddress';
import { navigateAfterAddressSelection } from '../../navigation/addressFlowNavigation';
import { useAuthSessionQuery } from '../../hooks/useAuthQueries';
import useAndroidKeyboardVisible from '../../hooks/useAndroidKeyboardVisible';

export default function AddressDetailScreen() {
  const nav =
    useNavigation<NativeStackNavigationProp<AddressFlowHostParamList>>();
  const route = useRoute<RouteProp<AddressFlowParamList, 'AddressDetail'>>();
  const { colors, elevation } = useTheme();
  const { t } = useTranslation('general');
  const insets = useSafeAreaInsets();
  const isAndroidKeyboardVisible = useAndroidKeyboardVisible();
  const queryClient = useQueryClient();
  const formRef = useRef<AddressDetailFormHandle>(null);
  const hasCompletedGuestSelection = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const savedId = useRef<string | null>(null);
  const lastSaved = useRef<{ address: SavedAddress; payload: string } | null>(null);
  const [loadedAddress, setLoadedAddress] = useState<SavedAddress | null>(null);
  const [useReloadedLocation, setUseReloadedLocation] = useState(false);
  const [formRevision, setFormRevision] = useState(0);
  const [isLoadingAddress, setIsLoadingAddress] = useState(Boolean(route.params.editAddressId));
  const [saveError, setSaveError] = useState<string | null>(null);
  const params = route.params;
  const { selectedAddress, setSelectedAddress } = useAddress();
  const sessionQuery = useAuthSessionQuery();
  const isEditing = Boolean(params.editAddressId);
  const handleDraftChange = useCallback((details: AddressDetails, type: AddressType) => {
    const state = nav.getState();
    const params = { draftDetails: details, draftType: type };
    nav.setParams(params);
    for (const previous of state.routes.slice(0, state.index)) {
      if (['AddressSearch', 'AddressChooseOnMap'].includes(previous.name)) nav.dispatch({ ...CommonActions.setParams(params), source: previous.key });
    }
  }, [nav]);
  const reloadAddress = useCallback(async () => {
    if (!params.editAddressId) return;
    setIsLoadingAddress(true);
    try {
      const latest = await addressService.getAddress(params.appPrefix, params.editAddressId);
      setLoadedAddress(latest);
      lastSaved.current = null;
      setFormRevision(value => value + 1);
      setSaveError(null);
    } catch { setSaveError(t('address_details_saveRetry')); }
    finally { setIsLoadingAddress(false); }
  }, [params.appPrefix, params.editAddressId, t]);
  useEffect(() => { void reloadAddress(); }, [reloadAddress]);


  useEffect(() => {
    if (
      sessionQuery.isPending ||
      sessionQuery.data?.token ||
      hasCompletedGuestSelection.current
    ) {
      return;
    }

    hasCompletedGuestSelection.current = true;
    setSelectedAddress(
      createDeliveryAddress({
        id: GUEST_SELECTED_LOCATION_ADDRESS_ID,
        address: params.address,
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
      }),
    );
    navigateAfterAddressSelection(nav, params.origin);
  }, [
    nav,
    params.address,
    params.latitude,
    params.longitude,
    params.origin,
    sessionQuery.data?.token,
    sessionQuery.isPending,
    setSelectedAddress,
  ]);

  const handleSave = useCallback(
    async (data: AddressDetailFormSubmitData) => {
      const payload = {
        address: data.address,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        type: data.type,
        addressDetailsVersion: data.addressDetailsVersion,
        expectedUpdatedAt: data.expectedUpdatedAt,
        ...(data.location_name ? { location_name: data.location_name } : {}),
        ...(data.additional_fields
          ? { additional_fields: data.additional_fields }
          : {}),
      };

      try {
        setSaveError(null);
        const payloadKey = JSON.stringify({ ...payload, expectedUpdatedAt: undefined });
        const existingId = savedId.current ?? params.editAddressId;
        const savedAddress = lastSaved.current?.payload === payloadKey ? lastSaved.current.address
          : existingId ? (await addressService.updateAddress(params.appPrefix, existingId, { ...payload, expectedUpdatedAt: lastSaved.current?.address.updatedAt ?? payload.expectedUpdatedAt })).data
          : (await addressService.addAddress(params.appPrefix, payload)).data;
        void queryClient.invalidateQueries({ queryKey: [...deliveryKeys.all, 'checkout-preview'] });
        const refreshedSelection = createDeliveryAddressFromSavedAddress(savedAddress);
        if (selectedAddress?.id === savedAddress.id && refreshedSelection) setSelectedAddress(refreshedSelection);
        savedId.current = savedAddress.id;
        lastSaved.current = { address: savedAddress, payload: payloadKey };
        if (data.shouldSetDefault || (isEditing && selectedAddress?.id === params.editAddressId)) {
          try {
            const selected = await addressService.selectAddress(params.appPrefix, savedAddress.id);
            const nextAddress = createDeliveryAddressFromSavedAddress(selected.data);
            if (nextAddress) setSelectedAddress(nextAddress);
          } catch {
            setSaveError(t('address_details_defaultRetry'));
            return;
          }
        }
        showToast.success(t(isEditing ? 'address_update_success' : 'address_save_success'));

        navigateAfterAddressSelection(nav, params.origin);
      } catch (error) {
        setSaveError(t(error instanceof ApiError && error.code === 'ADDRESS_EDIT_CONFLICT' ? 'address_details_editConflict' : error instanceof ApiError && error.code === 'ADDRESS_APP_UPDATE_REQUIRED' ? 'address_details_updateRequired' : 'address_details_saveRetry'));
        showToast.error(t('address_save_error'));
      }
    },
    [queryClient, isEditing, nav, params.appPrefix, params.editAddressId, params.origin, selectedAddress?.id, setSelectedAddress, t],
  );

  const handleButtonPress = useCallback(async () => {
    if (!formRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      await formRef.current.submit();
    } finally {
      setIsSaving(false);
    }
  }, []);

  const screenTitle = isEditing ? t('address_edit_title') : t('address_add_title');
  const buttonLabel = isEditing ? t('address_update') : t('address_save');

  if (sessionQuery.isPending || !sessionQuery.data?.token) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : isAndroidKeyboardVisible ? 'height' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title={screenTitle} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
      >
        {saveError ? <Text accessibilityRole="alert" style={{ paddingHorizontal: 20 }}>{saveError}</Text> : null}
        {saveError && isEditing ? <Button label={t('address_details_reload')} onPress={() => { const cleared = { draftDetails: undefined, draftType: undefined }; nav.setParams(cleared); const state = nav.getState(); for (const previous of state.routes.slice(0, state.index)) { if (['AddressSearch', 'AddressChooseOnMap'].includes(previous.name)) nav.dispatch({ ...CommonActions.setParams(cleared), source: previous.key }); } setUseReloadedLocation(true); void reloadAddress(); }} /> : null}
        {!isLoadingAddress && (!isEditing || loadedAddress) ? <AddressDetailForm
          key={formRevision}
          ref={formRef}
          address={useReloadedLocation && loadedAddress ? loadedAddress.address : params.address}
          latitude={useReloadedLocation && loadedAddress ? loadedAddress.location.coordinates[1] : Number(params.latitude)}
          longitude={useReloadedLocation && loadedAddress ? loadedAddress.location.coordinates[0] : Number(params.longitude)}
          initialDetails={params.draftDetails ?? loadedAddress?.addressDetails ?? params.editAddressDetails}
          expectedUpdatedAt={loadedAddress?.updatedAt ?? params.expectedUpdatedAt}
          initialSetAsDefault={params.preselectAsDefault ?? loadedAddress?.is_selected}
          initialType={params.draftType ?? loadedAddress?.type ?? (params.editType as AddressType) ?? 'HOME'}
          onDraftChange={handleDraftChange}
          onSave={handleSave}
        /> : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          elevation.floating,
          {
            backgroundColor: colors.surface,
            borderColor: colors.divider,
            marginBottom: Math.max(insets.bottom, 8),
            paddingBottom: 12,
          },
        ]}
      >
        <Button
          label={buttonLabel}
          onPress={handleButtonPress}
          isLoading={isSaving}
          disabled={isSaving || isLoadingAddress || (isEditing && !loadedAddress)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  screen: { flex: 1 },
  scrollContent: { gap: 16, paddingBottom: 24, paddingTop: 16 },
  scrollView: { flex: 1 },
});
