import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuthSessionQuery } from './useAuthQueries';
import { socketClient } from '../services/socket';
import { useQueryClient } from '@tanstack/react-query';

type Options = {
  enabled?: boolean;
  disconnectOnBackground?: boolean;
};

export function useSocketSession(options?: Options) {
  const { enabled = true, disconnectOnBackground = false } = options ?? {};
  const sessionQuery = useAuthSessionQuery();
  const queryClient = useQueryClient();
  const token = sessionQuery.data?.token ?? null;
  const userId = sessionQuery.data?.user?.id ?? null;
  const tokenRef = useRef<string | null>(token);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    socketClient.updateCurrentUserId(userId);
  }, [userId]);

  useEffect(() => {
    void socketClient.updateAuthToken(token);

    if (!enabled) {
      socketClient.disconnect();
      return;
    }

    if (!token) {
      socketClient.disconnect();
      return;
    }

    void socketClient.connect();
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled || !token) return undefined;
    return socketClient.subscribe('notification-created', () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'deliveries'] });
    });
  }, [enabled, queryClient, token]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        disconnectOnBackground
        && previousState === 'active'
        && nextState !== 'active'
      ) {
        socketClient.disconnect();
        return;
      }

      if (nextState === 'active' && tokenRef.current) {
        void socketClient.connect();
        void queryClient.invalidateQueries({ queryKey: ['notifications', 'deliveries'] });
      }
    });

    return () => subscription.remove();
  }, [disconnectOnBackground, enabled, queryClient]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return NetInfo.addEventListener((state) => {
      const isReachable = state.isConnected && state.isInternetReachable !== false;
      if (!isReachable || !tokenRef.current || appStateRef.current !== 'active') {
        return;
      }

      void socketClient.connect();
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'deliveries'] });
    });
  }, [enabled, queryClient]);

  return {
    connect: socketClient.connect.bind(socketClient),
    disconnect: socketClient.disconnect.bind(socketClient),
    getSocket: socketClient.getSocket.bind(socketClient),
    isConnected: socketClient.isConnected.bind(socketClient),
    updateAuthToken: socketClient.updateAuthToken.bind(socketClient),
    lifecycleState: socketClient.getLifecycleState.bind(socketClient),
  };
}
