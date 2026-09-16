import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { LatLng, Region } from 'react-native-maps';
import Icon from '../../../components/Icon';
import Map, { MapMarker } from '../../../components/Map';
import PressableScale from '../../../components/PressableScale';
import { useTheme } from '../../../theme/theme';
import MapStoreBottomSheet from './MapStoreBottomSheet';
import { toSeeAllMapStore, type SeeAllMapStoreSource } from './mapStoreUtils';
import SeeAllMapLoadingState from './SeeAllMapLoadingState';

const STORE_MARKER = require('../../../assets/map-markers/store.png');
const SELECTED_STORE_MARKER = require('../../../assets/map-markers/store-selected.png');
const SELECTED_STORE_MARKER_ID = '__selected-store-highlight__';
const STORE_MARKER_ANCHOR = { x: 0.5, y: 0.92 } as const;
const STORE_MARKER_CENTER_OFFSET = { x: 0, y: -20 } as const;

const DEFAULT_REGION: Region = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FOCUSED_DELTA = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function getRegionFromCoordinates(coordinate: LatLng): Region {
  return {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    ...FOCUSED_DELTA,
  };
}

function getInitialRegion(coordinates: LatLng[]): Region {
  if (coordinates.length === 0) return DEFAULT_REGION;
  if (coordinates.length === 1) return getRegionFromCoordinates(coordinates[0]);

  const latitudes = coordinates.map(({ latitude }) => latitude);
  const longitudes = coordinates.map(({ longitude }) => longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.45, 0.035),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.45, 0.035),
  };
}

type Props<TItem> = {
  items: TItem[];
  title: string;
  onBack: () => void;
  onViewStore: (item: TItem) => void;
  mapStoreFromItem: (item: TItem, index: number) => SeeAllMapStoreSource;
  currencyLabel?: string;
};

function SeeAllMapViewComponent<TItem>({
  items,
  title,
  onBack,
  onViewStore,
  mapStoreFromItem,
  currencyLabel,
}: Props<TItem>) {
  const { t } = useTranslation('general');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const hasFitInitialStoresRef = useRef(false);
  const hasAutoSelectedStoreRef = useRef(false);
  const pendingSelectionRef = useRef<string | null>(null);
  const selectionFrameRef = useRef<number | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const storeItems = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        store: toSeeAllMapStore(mapStoreFromItem(item, index)),
      })),
    [items, mapStoreFromItem],
  );

  const isLoading = items.length === 0;
  const storesWithCoordinates = useMemo(
    () => storeItems.filter(({ store }) => Boolean(store.coordinate)),
    [storeItems],
  );

  const selectedStore =
    storeItems.find(({ store }) => store.id === selectedStoreId) ?? null;
  const storeCoordinates = useMemo(
    () => storesWithCoordinates.map(({ store }) => store.coordinate!) as LatLng[],
    [storesWithCoordinates],
  );
  const initialRegion = useMemo(
    () => getInitialRegion(storeCoordinates),
    [storeCoordinates],
  );

  const selectStore = useCallback((storeId: string) => {
    pendingSelectionRef.current = storeId;
    if (selectionFrameRef.current !== null) return;

    selectionFrameRef.current = requestAnimationFrame(() => {
      selectionFrameRef.current = null;
      const nextStoreId = pendingSelectionRef.current;
      pendingSelectionRef.current = null;
      if (!nextStoreId) return;

      setSelectedStoreId((currentStoreId) =>
        currentStoreId === nextStoreId ? currentStoreId : nextStoreId,
      );
    });
  }, []);

  const clearSelectedStore = useCallback(() => {
    pendingSelectionRef.current = null;
    if (selectionFrameRef.current !== null) {
      cancelAnimationFrame(selectionFrameRef.current);
      selectionFrameRef.current = null;
    }
    setSelectedStoreId(null);
  }, []);

  useEffect(
    () => () => {
      if (selectionFrameRef.current !== null) {
        cancelAnimationFrame(selectionFrameRef.current);
      }
    },
    [],
  );

  const baseMarkers = useMemo<MapMarker[]>(
    () =>
      storesWithCoordinates.map((store) => ({
        id: store.store.id,
        coordinate: store.store.coordinate!,
        active: true,
        anchor: STORE_MARKER_ANCHOR,
        centerOffset: STORE_MARKER_CENTER_OFFSET,
        image: STORE_MARKER,
        zIndex: 1,
        onPress: () => selectStore(store.store.id),
        tracksViewChanges: false,
      })),
    [selectStore, storesWithCoordinates],
  );

  // Keep the store marker list immutable on selection. Moving one permanently
  // mounted highlight avoids Fabric re-inserting Google map children on iOS.
  const selectedMarker = useMemo<MapMarker>(
    () => ({
      id: SELECTED_STORE_MARKER_ID,
      coordinate: selectedStore?.store.coordinate ?? {
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      },
      active: Boolean(selectedStore?.store.coordinate),
      anchor: STORE_MARKER_ANCHOR,
      centerOffset: STORE_MARKER_CENTER_OFFSET,
      image: SELECTED_STORE_MARKER,
      tappable: false,
      tracksViewChanges: false,
      zIndex: 2,
    }),
    [selectedStore?.store.coordinate],
  );

  const markers = useMemo<MapMarker[]>(
    () => [...baseMarkers, selectedMarker],
    [baseMarkers, selectedMarker],
  );

  useEffect(() => {
    if (!isMapReady || !mapRef.current || hasFitInitialStoresRef.current) return;
    if (storeCoordinates.length === 0) return;

    hasFitInitialStoresRef.current = true;
    if (storeCoordinates.length === 1) {
      mapRef.current.animateToRegion(getRegionFromCoordinates(storeCoordinates[0]), 240);
      return;
    }

    mapRef.current.fitToCoordinates(storeCoordinates, {
      animated: true,
      edgePadding: { top: 120, right: 44, bottom: 300, left: 44 },
    });
  }, [isMapReady, storeCoordinates]);

  useEffect(() => {
    if (!hasAutoSelectedStoreRef.current && storesWithCoordinates.length > 0) {
      hasAutoSelectedStoreRef.current = true;
      setSelectedStoreId(storesWithCoordinates[0]?.store.id ?? null);
      return;
    }

    if (
      selectedStoreId &&
      !storesWithCoordinates.some(({ store }) => store.id === selectedStoreId)
    ) {
      clearSelectedStore();
    }
  }, [clearSelectedStore, selectedStoreId, storesWithCoordinates]);

  return (
    <View style={styles.container}>
      <Map
        ref={mapRef}
        initialRegion={initialRegion}
        loadingEnabled
        moveOnMarkerPress={false}
        onMapReady={() => setIsMapReady(true)}
        pitchEnabled={false}
        rotateEnabled={false}
        showsBuildings={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoorLevelPicker={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        markers={markers}
        useGoogleProvider
      />

      <View style={[styles.header, { top: insets.top + 8 }]}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('see_all_back_label')}
          onPress={onBack}
          style={[
            styles.headerButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <Icon type="Ionicons" name="arrow-back" size={20} color={colors.text} />
        </PressableScale>
      </View>

      {isLoading ? (
        <SeeAllMapLoadingState
          title={t('see_all_map_loading_title', { title })}
          description={t('see_all_map_loading_description')}
        />
      ) : null}

      <MapStoreBottomSheet
        store={selectedStore?.store ?? null}
        onClose={clearSelectedStore}
        onViewStore={() => {
          if (!selectedStore) {
            return;
          }

          onViewStore(selectedStore.item);
        }}
        title={t('see_all_map_sheet_title')}
        ctaLabel={t('see_all_map_cta')}
        closeLabel={t('filter_close_label')}
        currencyLabel={currencyLabel}
      />
    </View>
  );
}

const SeeAllMapView = memo(SeeAllMapViewComponent) as typeof SeeAllMapViewComponent;

export default SeeAllMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 16,
    position: 'absolute',
    right: 16,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    height: 40,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    width: 40,
  },
});
