import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import apiClient from '../api/apiClient';
import { useAuthSessionQuery } from './useAuthQueries';

export function usePushTokenSync() {
  const session = useAuthSessionQuery();
  const lastRegistered = useRef<string | null>(null);

  useEffect(() => {
    lastRegistered.current = null;
    if (!session.data?.token || Platform.OS === 'web') return;
    let disposed = false;
    const sync = async () => {
      try {
        const permission = await Notifications.getPermissionsAsync();
        if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) return;
        const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        if (disposed || !token || token === lastRegistered.current) return;
        await apiClient.post('/api/v1/users/push-token/register', { token });
        lastRegistered.current = token;
      } catch {
        // Retry when the app returns to the foreground.
      }
    };
    void sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    return () => { disposed = true; subscription.remove(); };
  }, [session.data?.token]);
}
