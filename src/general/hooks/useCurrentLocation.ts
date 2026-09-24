import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { getLocationPermissionState } from '../utils/locationPermission';

export type CurrentCoordinates = {
  latitude: number;
  longitude: number;
};

function toCoordinates(position: Location.LocationObject | Location.LocationLastKnownObject): CurrentCoordinates {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export default function useCurrentLocation() {
  const [currentCoordinates, setCurrentCoordinates] = useState<CurrentCoordinates | null>(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);

  useEffect(() => {
    void refreshCurrentLocation();

    // The actual permission prompt is owned by useLocationPermissionPrompt's
    // in-app popup — this hook only ever reads the current permission state
    // (never requests it) so the two flows can't trigger overlapping native
    // and in-app dialogs on first launch. Re-check on foreground so
    // coordinates are picked up as soon as the user grants access there.
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshCurrentLocation();
      }
    });

    return () => subscription.remove();
  }, []);

  async function refreshCurrentLocation() {
    setIsLoadingCurrentLocation(true);

    try {
      const permission = await getLocationPermissionState();

      if (!permission.granted) {
        return null;
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync();

      if (lastKnownPosition) {
        const lastKnownCoordinates = toCoordinates(lastKnownPosition);
        setCurrentCoordinates(lastKnownCoordinates);

        // Keep GPS refinement non-blocking so navigation can happen instantly.
        void Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
          .then((currentPosition) => {
            setCurrentCoordinates(toCoordinates(currentPosition));
          })
          .catch(() => {
            // Last known location is already applied.
          })
          .finally(() => {
            setIsLoadingCurrentLocation(false);
          });

        return lastKnownCoordinates;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => null);

      if (!currentPosition) {
        return null;
      }

      const nextCoordinates = toCoordinates(currentPosition);
      setCurrentCoordinates(nextCoordinates);
      return nextCoordinates;
    } catch (error) {
      console.warn('Unable to resolve current location', error);
      return null;
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }

  return {
    currentCoordinates,
    isLoadingCurrentLocation,
    refreshCurrentLocation,
  };
}
