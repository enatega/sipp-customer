import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import BottomSheetHandle from '../BottomSheetHandle';
import SwipeableBottomSheet from '../SwipeableBottomSheet';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import type { ProfileAddress } from '../../api/profileService';
import {
  formatDeliveryAddressLabel,
  getSelectedSavedAddressId,
} from '../../utils/address';
import {
  getLocationPermissionState,
  openAppLocationSettings,
  requestLocationPermission,
} from '../../utils/locationPermission';
import {
  getSavedAddressIcon,
  getSavedAddressTypeLabel,
} from '../../utils/savedAddressPresentation';
import SavedAddressSelectionRow from './SavedAddressSelectionRow';
import HomeLocationPermissionPopup, {
  LocationPopupMode,
} from '../../../screens/home/HomeLocationPermissionPopup';
import IconButton from '../IconButton';
import { useWindowClass } from '../../hooks/useWindowClass';

type Props = {
  addresses: ProfileAddress[];
  bottomOffset?: number;
  isLoading?: boolean;
  isVisible: boolean;
  onAddAddress: () => void;
  onClose: () => void;
  onSelectAddress: (address: ProfileAddress) => void;
  onUseCurrentLocation: () => void;
  selectingAddressId?: string | null;
  selectedAddressId?: string;
};

const BASE_CONTENT_HEIGHT = 180;
const ADDRESS_ROW_ESTIMATE = 68;
const MAX_VISIBLE_ADDRESS_ROWS = 4;

export default function AddressSelectionBottomSheet({
  addresses,
  bottomOffset = 0,
  isLoading = false,
  isVisible,
  onAddAddress,
  onClose,
  onSelectAddress,
  onUseCurrentLocation,
  selectingAddressId,
  selectedAddressId,
}: Props) {
  const { colors, elevation, layout, motion, shape, spacing } = useTheme();
  const { t } = useTranslation('general');
  const { height, isCompact, width } = useWindowClass();
  const insets = useSafeAreaInsets();
  const isSelectionPending = Boolean(selectingAddressId);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isLocationPopupVisible, setIsLocationPopupVisible] = useState(false);
  const [locationPopupMode, setLocationPopupMode] =
    useState<LocationPopupMode>('request');
  const resolvedSelectedAddressId =
    selectedAddressId ?? getSelectedSavedAddressId(addresses);
  const sheetWidth = isCompact
    ? width
    : Math.min(width - layout.gutter.medium * 2, layout.contentMaxWidth.readable);
  const sheetHorizontalInset = isCompact
    ? bottomOffset > 0 ? spacing.sm : 0
    : Math.max(0, (width - sheetWidth) / 2);

  const expandedHeight = useMemo(() => {
    const estimatedContentHeight =
      BASE_CONTENT_HEIGHT +
      Math.min(addresses.length, MAX_VISIBLE_ADDRESS_ROWS) *
        ADDRESS_ROW_ESTIMATE +
      Math.max(insets.bottom, 16);

    const availableHeight = Math.max(320, height - bottomOffset);

    return Math.min(availableHeight * 0.75, Math.max(280, estimatedContentHeight));
  }, [addresses.length, bottomOffset, height, insets.bottom]);

  const handleUseCurrentLocationPress = useCallback(async () => {
    if (isSelectionPending || isRequestingLocation) {
      return;
    }

    setIsRequestingLocation(true);

    try {
      const currentPermission = await getLocationPermissionState();

      if (currentPermission.granted) {
        onUseCurrentLocation();
        return;
      }

      if (currentPermission.blocked) {
        setLocationPopupMode('blocked');
        setIsLocationPopupVisible(true);
        return;
      }

      const requestedPermission =
        currentPermission.canAskAgain
          ? await requestLocationPermission()
          : currentPermission;

      if (requestedPermission.granted) {
        onUseCurrentLocation();
        return;
      }

      setLocationPopupMode(requestedPermission.blocked ? 'blocked' : 'denied');
      setIsLocationPopupVisible(true);
    } catch {
      setLocationPopupMode('denied');
      setIsLocationPopupVisible(true);
    } finally {
      setIsRequestingLocation(false);
    }
  }, [isRequestingLocation, isSelectionPending, onUseCurrentLocation]);

  const handlePopupRequestLocation = useCallback(async () => {
    if (isRequestingLocation) {
      return;
    }

    setIsRequestingLocation(true);

    try {
      const permission = await requestLocationPermission();

      if (permission.granted) {
        setIsLocationPopupVisible(false);
        onUseCurrentLocation();
        return;
      }

      setLocationPopupMode(permission.blocked ? 'blocked' : 'denied');
      setIsLocationPopupVisible(true);
    } catch {
      setLocationPopupMode('denied');
      setIsLocationPopupVisible(true);
    } finally {
      setIsRequestingLocation(false);
    }
  }, [isRequestingLocation, onUseCurrentLocation]);

  const handlePopupOpenSettings = useCallback(async () => {
    try {
      await openAppLocationSettings();
    } catch {
      setLocationPopupMode('blocked');
      setIsLocationPopupVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <View
      accessibilityViewIsModal
      style={[
        styles.overlay,
        {
          elevation: layout.layer.modal,
          zIndex: layout.layer.modal,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={t('address_selector_close')}
        accessibilityRole="button"
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}
      />

      <SwipeableBottomSheet
        collapsedHeight={0}
        expandedHeight={expandedHeight}
        handle={<BottomSheetHandle variant={isCompact ? 'visible' : 'hidden'} />}
        horizontalInset={sheetHorizontalInset}
        initialState="expanded"
        modal
        onCollapsed={onClose}
        style={[
          styles.sheet,
          elevation.overlay,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: isCompact && bottomOffset === 0 ? 0 : shape.radius.sheet,
            borderTopLeftRadius: shape.radius.sheet,
            borderTopRightRadius: shape.radius.sheet,
            bottom: isCompact
              ? bottomOffset
              : bottomOffset + Math.max(insets.bottom, spacing.xxl),
            paddingTop: spacing.xs,
          },
        ]}
      >
        <View style={[styles.header, { paddingBottom: spacing.md, paddingHorizontal: spacing.lg }]}>
          <View
            style={[
              styles.headerSpacer,
              {
                height: layout.touchTarget.minimum,
                width: layout.touchTarget.minimum,
              },
            ]}
          />

          <Text
            accessibilityRole="header"
            variant="sectionTitle"
            weight="semiBold"
          >
            {t('address_selector_title')}
          </Text>

          <IconButton
            accessibilityLabel={t('address_selector_close')}
            onPress={onClose}
            variant="soft"
            icon={<Icon
              color={colors.text}
              name="close"
              size={18}
              type="Ionicons"
            />}
          />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              gap: spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md,
              paddingHorizontal: spacing.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityLabel={t('address_selector_use_current_location')}
            accessibilityRole="button"
            accessibilityState={{
              busy: isRequestingLocation,
              disabled: isSelectionPending || isRequestingLocation,
            }}
            disabled={isSelectionPending || isRequestingLocation}
            onPress={() => {
              void handleUseCurrentLocationPress();
            }}
            style={({ pressed }) => [
                styles.currentLocationRow,
                {
                backgroundColor: pressed ? colors.statePressed : 'transparent',
                borderRadius: shape.radius.control,
                gap: spacing.md,
                opacity: isSelectionPending || isRequestingLocation ? motion.opacity.disabled : 1,
              },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft, borderRadius: shape.radius.pill }]}>
              {isRequestingLocation ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Icon color={colors.primary} name="navigate-outline" size={19} type="Ionicons" />
              )}
            </View>
            <Text
              variant="body"
              weight="semiBold"
            >
              {t('address_selector_use_current_location')}
            </Text>
          </Pressable>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : null}

          <View style={[styles.addressList, { gap: spacing.xs }]}>
            {addresses.map((address) => {
              return (
                <SavedAddressSelectionRow
                  key={address.id}
                  address={formatDeliveryAddressLabel({
                    address: address.address,
                    locationName: address.location_name,
                  })}
                  iconName={getSavedAddressIcon(address.type)}
                  isDisabled={isSelectionPending}
                  isSelected={resolvedSelectedAddressId === address.id}
                  isSelecting={selectingAddressId === address.id}
                  onPress={() => onSelectAddress(address)}
                  typeLabel={getSavedAddressTypeLabel(address.type, t)}
                />
              );
            })}

            <Pressable
              accessibilityLabel={t('address_selector_add_new')}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSelectionPending }}
              disabled={isSelectionPending}
              onPress={onAddAddress}
              style={({ pressed }) => [
                styles.addAddressButton,
                {
                  backgroundColor: pressed ? colors.statePressed : 'transparent',
                  borderRadius: shape.radius.control,
                  gap: spacing.md,
                  opacity: isSelectionPending ? motion.opacity.disabled : 1,
                },
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.surfaceSunken, borderRadius: shape.radius.pill }]}>
                <Icon color={colors.primary} name="add" size={20} type="Ionicons" />
              </View>
              <Text
                color={colors.text}
                variant="body"
                weight="semiBold"
              >
                {t('address_selector_add_new')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SwipeableBottomSheet>

      <HomeLocationPermissionPopup
        visible={isLocationPopupVisible}
        mode={locationPopupMode}
        isLoading={isRequestingLocation}
        onRequestLocation={() => {
          void handlePopupRequestLocation();
        }}
        onOpenSettings={() => {
          void handlePopupOpenSettings();
        }}
        onDismiss={() => {
          setIsLocationPopupVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addAddressButton: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  addressList: {},
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {},
  currentLocationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 3,
  },
  headerSpacer: {},
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
  },
});
