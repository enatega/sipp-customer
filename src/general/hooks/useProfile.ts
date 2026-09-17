import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import useSyncSelectedSavedAddress from './useSyncSelectedSavedAddress';
import {
  profileService,
  type ProfileAppPrefix,
  ProfileAddress,
  ProfileUser,
  WalletResponse,
} from '../api/profileService';
import { useAuthSessionQuery } from './useAuthQueries';

type ProfileState = {
  user: ProfileUser | null;
  addresses: ProfileAddress[];
  wallet: WalletResponse['data'] | null;
  isLoading: boolean;
  error: string | null;
};

export default function useProfile(appPrefix: ProfileAppPrefix) {
  const sessionQuery = useAuthSessionQuery();
  const isAuthenticated = Boolean(sessionQuery.data?.token);
  const [state, setState] = useState<ProfileState>({
    user: null,
    addresses: [],
    wallet: null,
    isLoading: true,
    error: null,
  });
  useSyncSelectedSavedAddress(state.addresses, state.isLoading);

  const hasFetchedOnce = useRef(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!isAuthenticated) {
      setState({
        user: null,
        addresses: [],
        wallet: null,
        isLoading: sessionQuery.isPending,
        error: null,
      });
      return;
    }

    if (showLoading) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    }
    try {
      const [profileRes, walletRes] = await Promise.all([
        profileService.getProfile(appPrefix),
        profileService.getWalletBalance(appPrefix),
      ]);
      setState({
        user: profileRes?.data?.user ?? null,
        addresses: profileRes?.data?.addresses ?? [],
        wallet: walletRes?.data ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [appPrefix, isAuthenticated, sessionQuery.isPending]);

  useFocusEffect(
    useCallback(() => {
      if (hasFetchedOnce.current) {
        fetchData(false);
      } else {
        hasFetchedOnce.current = true;
        fetchData(true);
      }
    }, [fetchData]),
  );

  return { ...state, refetch: () => fetchData(false) };
}
