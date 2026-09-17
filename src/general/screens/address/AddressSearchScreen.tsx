import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../../components/ScreenHeader';
import Text from '../../components/Text';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { useTheme } from '../../theme/theme';
import { addressService } from '../../api/addressService';
import AddressSearchInput from '../../components/address/AddressSearchInput';
import AddressSuggestionItem from '../../components/address/AddressSuggestionItem';
import AddressSuggestionSkeleton from '../../components/address/AddressSuggestionSkeleton';
import useAddressPredictions from '../../hooks/useAddressPredictions';
import type {
  AddressFlowHostParamList,
  AddressFlowParamList,
} from '../../navigation/addressFlowTypes';
import {
  getRecentAddressSearches,
  saveRecentAddressSearch,
} from '../../utils/recentAddressSearches';
import type { RecentAddressSearch } from '../../api/addressService';
import useCurrentLocation from '../../hooks/useCurrentLocation';
import useAddress from '../../hooks/useAddress';
import { authSession } from '../../auth/authSession';
import { useAuthSessionQuery } from '../../hooks/useAuthQueries';
import {
  createDeliveryAddress,
  GUEST_SELECTED_LOCATION_ADDRESS_ID,
} from '../../utils/address';
import { navigateAfterAddressSelection } from '../../navigation/addressFlowNavigation';

export default function AddressSearchScreen() {
  const nav = useNavigation<NativeStackNavigationProp<AddressFlowHostParamList>>();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation('general');
  const params = (route.params as AddressFlowParamList['AddressSearch']) ?? {};
  const { currentCoordinates, refreshCurrentLocation } = useCurrentLocation();
  const { setSelectedAddress } = useAddress();
  const sessionQuery = useAuthSessionQuery();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentAddressSearch[]>([]);

  const debouncedQuery = useDebouncedValue(query.trim(), 800);
  const isSearching = query.trim().length > 0;
  const predictionsQuery = useAddressPredictions(
    debouncedQuery,
    debouncedQuery.length > 0,
  );
  const isWaiting = isSearching && query.trim() !== debouncedQuery;
  const isShowingSkeleton =
    isSearching && (isWaiting || predictionsQuery.isFetching);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setRecentSearches(await getRecentAddressSearches());
      })();
    }, []),
  );

  const editParams = params.editAddressId
    ? {
        appPrefix: params.appPrefix,
        editAddressId: params.editAddressId,
        editType: params.editType,
        editLocationName: params.editLocationName,
        origin: params.origin,
      }
    : { appPrefix: params.appPrefix, origin: params.origin };

  const selectGuestLocation = useCallback(
    (address: string, latitude: number, longitude: number) => {
      setSelectedAddress(
        createDeliveryAddress({
          id: GUEST_SELECTED_LOCATION_ADDRESS_ID,
          address,
          latitude,
          longitude,
        }),
      );
      navigateAfterAddressSelection(nav, params.origin);
    },
    [nav, params.origin, setSelectedAddress],
  );

  const handleSelectPrediction = useCallback(
    async (placeId: string, description: string) => {
      try {
        const coords = await addressService.getPlaceDetails(placeId);
        const lat = Number(coords.lat);
        const lng = Number(coords.lng);
        const parts = description.split(',');
        const mainText = parts[0]?.trim() ?? description;
        const secondaryText = parts.slice(1).join(',').trim() || undefined;

        await saveRecentAddressSearch({
          placeId,
          description,
          mainText,
          secondaryText,
          latitude: lat,
          longitude: lng,
        });

        const accessToken = await authSession.getAccessToken();
        if (!accessToken) {
          selectGuestLocation(description, lat, lng);
          return;
        }

        nav.navigate('AddressDetail', {
          address: description,
          latitude: lat,
          longitude: lng,
          ...editParams,
        });
      } catch {
        // Keep the user on the screen so they can retry.
      }
    },
    [editParams, nav, selectGuestLocation],
  );

  const handleSelectRecent = useCallback(
    async (item: RecentAddressSearch) => {
      const accessToken = await authSession.getAccessToken();
      if (!accessToken) {
        selectGuestLocation(item.description, item.latitude, item.longitude);
        return;
      }

      nav.navigate('AddressDetail', {
        address: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        ...editParams,
      });
    },
    [editParams, nav, selectGuestLocation],
  );

  const handleChooseOnMap = useCallback(async () => {
    const freshCoordinates = await refreshCurrentLocation();
    const resolvedCoordinates = freshCoordinates ?? currentCoordinates;

    nav.navigate('AddressChooseOnMap', {
      ...editParams,
      initialLatitude: resolvedCoordinates?.latitude,
      initialLongitude: resolvedCoordinates?.longitude,
    });
  }, [currentCoordinates, editParams, nav, refreshCurrentLocation]);

  const suggestions = predictionsQuery.data ?? [];
  const showRecent = !isSearching && recentSearches.length > 0;
  const showNoResults =
    isSearching &&
    !isShowingSkeleton &&
    suggestions.length === 0 &&
    !predictionsQuery.isPending;
  const screenTitle = params.editAddressId
    ? t('address_edit_title')
    : !sessionQuery.isPending && !sessionQuery.data?.token
      ? t('address_choose_title')
      : t('address_add_title');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title={screenTitle} />
      <AddressSearchInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('address_search_placeholder')}
        chooseOnMapLabel={t('address_choose_on_map')}
        onChooseOnMap={handleChooseOnMap}
        isLoading={isShowingSkeleton}
      />

      {isShowingSkeleton ? (
        <View style={styles.listWrap}>
          <AddressSuggestionSkeleton />
        </View>
      ) : showNoResults ? (
        <View style={styles.emptyWrap}>
          <Text variant="caption" color={colors.mutedText}>
            {t('address_no_results')}
          </Text>
        </View>
      ) : showRecent ? (
        <View style={styles.listWrap}>
          <Text
            variant="caption"
            weight="semiBold"
            color={colors.mutedText}
            style={styles.sectionLabel}
          >
            {t('address_recent_searches')}
          </Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <AddressSuggestionItem
                description={item.description}
                onPress={() => {
                  void handleSelectRecent(item);
                }}
                isRecent
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AddressSuggestionItem
              description={item.description}
              onPress={() =>
                handleSelectPrediction(item.place_id, item.description)
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  listContent: { paddingTop: 8 },
  listWrap: { flex: 1, paddingTop: 16 },
  screen: { flex: 1 },
  sectionLabel: { paddingBottom: 4, paddingHorizontal: 16 },
});
