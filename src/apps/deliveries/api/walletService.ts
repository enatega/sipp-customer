import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../general/api/apiClient';
import { walletSavedCardsKeys } from '../../../general/api/walletSavedCardsService';
import { deliveryKeys } from './queryKeys';
import { profileService } from '../../../general/api/profileService';

export function useCustomerWalletBalance() {
  return useQuery({
    queryKey: deliveryKeys.walletBalance(),
    queryFn: () => profileService.getWalletBalance('deliveries'),
    select: (response) => Number(response.data?.wallet_balance ?? 0),
  });
}

export type CustomerLoyaltyWalletSummary = {
  earned_points: number;
  total_earned_points: number;
  points_equals_one: number;
  loyalty_wallet_amount: number;
};

export type ConvertCustomerPointsResponse = {
  amount: number;
  remainingPoints: number;
  newWalletBalance: number;
};

export type WalletTopUpResponse = {
  clientSecret: string | null;
  paymentIntentId: string;
  status: string;
};

export function useCustomerLoyaltyWalletSummary() {
  return useQuery({
    queryKey: deliveryKeys.loyaltyWallet(),
    queryFn: () =>
      apiClient.get<CustomerLoyaltyWalletSummary>(
        '/api/v1/apps/deliveries/wallet/points/current/customer',
      ),
  });
}

export function useConvertCustomerPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (points: number) =>
      apiClient.post<ConvertCustomerPointsResponse>(
        '/api/v1/apps/deliveries/wallet/points/convert/customer',
        { points },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deliveryKeys.loyaltyWallet() });
      void queryClient.invalidateQueries({ queryKey: walletSavedCardsKeys.all });
    },
  });
}

export function useWalletTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { amount: number; currency: string; paymentMethodId: string }) =>
      // A 400 here is an expected business error shown to the user, not a fault.
      apiClient.post<WalletTopUpResponse>('/api/v1/apps/deliveries/wallet/topup', input, { silentStatuses: [400] }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletSavedCardsKeys.all });
    },
  });
}
