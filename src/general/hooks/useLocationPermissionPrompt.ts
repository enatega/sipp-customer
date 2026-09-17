import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  getLocationPermissionState,
  openAppLocationSettings,
  requestLocationPermission,
} from '../utils/locationPermission';
import type { LocationPopupMode } from '../screens/home/HomeLocationPermissionPopup';

export function useLocationPermissionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<LocationPopupMode>('request');
  const [isRequesting, setIsRequesting] = useState(false);

  const syncPermission = useCallback(async () => {
    try {
      const permission = await getLocationPermissionState();

      if (permission.granted) {
        setIsVisible(false);
        setMode('request');
        return;
      }

      setMode(
        permission.blocked
          ? 'blocked'
          : permission.undetermined
            ? 'request'
            : 'denied',
      );
      setIsVisible(true);
    } catch (error) {
      console.warn('Unable to read location permission state', error);
    }
  }, []);

  useEffect(() => {
    void syncPermission();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPermission();
      }
    });

    return () => subscription.remove();
  }, [syncPermission]);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);

    try {
      const permission = await requestLocationPermission();

      if (permission.granted) {
        setIsVisible(false);
        setMode('request');
        return;
      }

      setMode(permission.blocked ? 'blocked' : 'denied');
      setIsVisible(true);
    } catch (error) {
      console.warn('Unable to request location permission', error);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const openSettings = useCallback(async () => {
    try {
      await openAppLocationSettings();
    } catch (error) {
      console.warn('Unable to open app settings', error);
    }
  }, []);

  return {
    dismiss: () => setIsVisible(false),
    isRequesting,
    isVisible,
    mode,
    openSettings,
    requestPermission,
  };
}
