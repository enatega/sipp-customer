import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { LatLng, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/theme';
import Map from '../../components/Map';
import MapCurrentLocationButton from '../../components/MapCurrentLocationButton';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import useCurrentLocation from '../../hooks/useCurrentLocation';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import PressableScale from '../../components/PressableScale';

export type MapAddressResult = {
  description: string;
  mainText: string;
  secondaryText?: string;
  latitude: number;
  longitude: number;
};

type Props = {
  initialCoordinate?: LatLng | null;
  onBackPress: () => void;
  onConfirm: (result: MapAddressResult) => Promise<void> | void;
  confirmLabel: string;
  locatingLabel: string;
  fallbackLabel: string;
};

const DEFAULT_REGION: Region = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const FOCUSED_DELTA = { latitudeDelta: 0.012, longitudeDelta: 0.012 };

function toRegion(coord: LatLng): Region {
  return { latitude: coord.latitude, longitude: coord.longitude, ...FOCUSED_DELTA };
}

function toKey(coord: LatLng | null) {
  if (!coord) return '';
  return `${coord.latitude.toFixed(5)},${coord.longitude.toFixed(5)}`;
}

function compactPart(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function formatGeocode(result: Location.LocationGeocodedAddress | null) {
  if (!result) return { description: '', mainText: '' };

  const street = [compactPart(result.streetNumber), compactPart(result.street)]
    .filter(Boolean).join(' ').trim();

  const candidates = [
    compactPart(result.name), street, compactPart(result.district),
    result.city, result.subregion, result.region, result.postalCode, result.country,
  ].map(compactPart).filter(Boolean);

  const normalized = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const deduped = candidates.reduce<string[]>((parts, c) => {
    const nc = normalized(c);
    if (!nc) return parts;
    const isDup = parts.some((p) => {
      const np = normalized(p);
      return np === nc || np.includes(nc) || nc.includes(np);
    });
    if (!isDup) parts.push(c);
    return parts;
  }, []);

  const description = deduped.join(', ');
  const mainText = deduped[0] ?? description;
  const secondaryText = deduped.slice(1).join(', ') || undefined;
  return { description, mainText, secondaryText };
}

function AddressChooseOnMap({
  initialCoordinate = null,
  onBackPress,
  onConfirm,
  confirmLabel,
  locatingLabel,
  fallbackLabel,
}: Props) {
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const latestReqId = useRef(0);
  const lastGeoKey = useRef('');
  const lastInitKey = useRef('');
  const hasPendingGesture = useRef(false);
  const hasPendingMove = useRef(false);

  const [center, setCenter] = useState<LatLng | null>(initialCoordinate);
  const [resolved, setResolved] = useState<MapAddressResult | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { currentCoordinates, isLoadingCurrentLocation, refreshCurrentLocation } = useCurrentLocation();

  const debouncedCenter = useDebouncedValue(center, 400);

  const initialRegion = useMemo(
    () => (initialCoordinate ? toRegion(initialCoordinate) : DEFAULT_REGION),
    [initialCoordinate],
  );

  const moveMap = useCallback((coord: LatLng) => {
    hasPendingMove.current = true;
    setCenter(coord);
    setIsResolving(true);
    mapRef.current?.animateToRegion(toRegion(coord), 250);
  }, []);

  useEffect(() => {
    if (initialCoordinate) {
      const k = toKey(initialCoordinate);
      if (lastInitKey.current === k) return;
      lastInitKey.current = k;
      moveMap(initialCoordinate);
      return;
    }
    lastInitKey.current = '';
    if (!currentCoordinates || center) return;
    moveMap(currentCoordinates);
  }, [center, currentCoordinates, initialCoordinate, moveMap]);

  useEffect(() => {
    const target = debouncedCenter;
    const targetKey = toKey(target);
    if (!target || !targetKey) return;
    if (targetKey === lastGeoKey.current) { setIsResolving(false); return; }

    let mounted = true;
    const reqId = ++latestReqId.current;
    setIsResolving(true);

    void (async () => {
      try {
        const [result] = await Location.reverseGeocodeAsync(target);
        if (!mounted || latestReqId.current !== reqId) return;
        const fmt = formatGeocode(result ?? null);
        const desc = fmt.description || fallbackLabel;
        setResolved({
          description: desc,
          mainText: fmt.mainText || desc,
          secondaryText: fmt.secondaryText,
          latitude: target.latitude,
          longitude: target.longitude,
        });
        lastGeoKey.current = targetKey;
      } catch {
        if (!mounted || latestReqId.current !== reqId) return;
        setResolved({
          description: fallbackLabel,
          mainText: fallbackLabel,
          latitude: target.latitude,
          longitude: target.longitude,
        });
        lastGeoKey.current = targetKey;
      } finally {
        if (mounted && latestReqId.current === reqId) setIsResolving(false);
      }
    })();

    return () => { mounted = false; };
  }, [debouncedCenter, fallbackLabel]);

  const handleRegionComplete = useCallback((region: Region) => {
    const shouldHandle = hasPendingGesture.current || hasPendingMove.current;
    hasPendingGesture.current = false;
    hasPendingMove.current = false;
    if (!shouldHandle) return;
    const next = { latitude: region.latitude, longitude: region.longitude };
    if (toKey(next) === toKey(center)) return;
    setIsResolving(true);
    setCenter(next);
  }, [center]);

  const handleCurrentLocation = useCallback(async () => {
    const coords = await refreshCurrentLocation();
    if (coords) moveMap(coords);
  }, [moveMap, refreshCurrentLocation]);

  const handleConfirm = useCallback(async () => {
    if (!resolved || isConfirming) return;
    setIsConfirming(true);
    try { await onConfirm(resolved); } finally { setIsConfirming(false); }
  }, [isConfirming, onConfirm, resolved]);

  const chipTitle = isResolving ? locatingLabel : (resolved?.mainText || fallbackLabel);
  const chipSubtitle = !isResolving ? resolved?.secondaryText : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Map
        ref={mapRef}
        initialRegion={initialRegion}
        onPanDrag={() => { hasPendingGesture.current = true; }}
        onRegionChangeComplete={handleRegionComplete}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        useGoogleProvider
      />

      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={[styles.header, { top: insets.top + 8 }]}>
          <PressableScale
            onPress={onBackPress}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[
              styles.headerButton,
              elevation.floating,
              { backgroundColor: colors.surface, borderColor: colors.glassBorder },
            ]}
          >
            <Icon type="Ionicons" name="arrow-back" size={22} color={colors.text} />
          </PressableScale>
        </View>

        <View pointerEvents="none" style={styles.centerMarkerWrap}>
          <View style={[styles.addressChip, elevation.floating, { backgroundColor: colors.surface }]}> 
            <Text variant="caption" weight="semiBold" numberOfLines={1} style={styles.chipTitle}>
              {chipTitle}
            </Text>
            {chipSubtitle ? (
              <Text variant="caption" numberOfLines={2} style={styles.chipSubtitle} color={colors.mutedText}>
                {chipSubtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.markerStack}>
            <View style={[styles.markerHalo, { backgroundColor: colors.primarySoft }]} />
            <View style={[styles.markerDotOuter, { backgroundColor: colors.blue100 }]}> 
              <View style={[styles.markerDotInner, { backgroundColor: colors.primary, borderColor: colors.surface }]} />
            </View>
            <View style={[styles.markerStem, { backgroundColor: colors.blue100 }]} />
          </View>
        </View>

        <View
          style={[
            styles.footer,
            elevation.floating,
            {
              backgroundColor: colors.surface,
              borderColor: colors.divider,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <MapCurrentLocationButton
            onPress={handleCurrentLocation}
            isLoading={isLoadingCurrentLocation}
            style={styles.currentLocationBtn}
          />
          <Button
            label={confirmLabel}
            onPress={handleConfirm}
            isLoading={isConfirming}
            disabled={!resolved || isResolving}
            style={styles.confirmBtn}
          />
        </View>
      </View>
    </View>
  );
}

export default memo(AddressChooseOnMap);

const styles = StyleSheet.create({
  addressChip: {
    borderRadius: 16,
    maxWidth: 300,
    paddingHorizontal: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  centerMarkerWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  chipSubtitle: { marginTop: 2, textAlign: 'center' },
  chipTitle: { textAlign: 'center' },
  confirmBtn: {
    borderRadius: 14,
    borderWidth: 0,
    minHeight: 50,
  },
  container: { flex: 1 },
  currentLocationBtn: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 40,
  },
  footer: {
    borderRadius: 24,
    borderWidth: 1,
    bottom: 12,
    gap: 12,
    left: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    position: 'absolute',
    right: 12,
  },
  header: { left: 16, position: 'absolute', zIndex: 2 },
  headerButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  markerDotInner: {
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  markerDotOuter: {
    alignItems: 'center',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  markerHalo: {
    borderRadius: 27,
    bottom: -18,
    height: 54,
    position: 'absolute',
    width: 54,
  },
  markerStem: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    height: 20,
    marginTop: -2,
    width: 4,
  },
  markerStack: { alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
});
