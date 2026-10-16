import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '../../../general/api/apiClient';
import {
  claimCouponService,
  type ClaimCouponResponse,
} from '../api/claimCouponService';

import { claimedCouponsKeys } from './useClaimedCouponsQuery';

type ClaimCouponVariables = {
  code: string;
};

export function useClaimCouponMutation() {
  const client = useQueryClient();
  return useMutation<ClaimCouponResponse, ApiError, ClaimCouponVariables>({
    onSuccess: () => { void client.invalidateQueries({ queryKey: claimedCouponsKeys.all }); },
    mutationFn: (variables) => claimCouponService.claimCoupon(variables),
  });
}
