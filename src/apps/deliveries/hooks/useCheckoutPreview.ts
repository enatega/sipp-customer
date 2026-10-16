import { useIsMutating, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiError } from '../../../general/api/apiClient';
import { deliveryKeys } from '../api/queryKeys';
import { orderService } from '../api/orderService';
import type {
  CheckoutPreviewInput,
  CheckoutPreviewResponse,
} from '../api/orderServiceTypes';

import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';
import { couponMutationKey } from './useUseCouponMutation';

type UseCheckoutPreviewOptions = Omit<
  UseQueryOptions<CheckoutPreviewResponse, ApiError>,
  'queryKey' | 'queryFn'
>;

export function useCheckoutPreview(
  input: CheckoutPreviewInput | null,
  options?: UseCheckoutPreviewOptions,
  cartRevision?: string,
) {
  const session = useAuthSessionQuery();
  const isSelectingCoupon = useIsMutating({ mutationKey: couponMutationKey }) > 0;
  return useQuery<CheckoutPreviewResponse, ApiError>({
    queryKey: input
      ? [...deliveryKeys.checkoutPreview(input), session.data?.user?.id, cartRevision]
      : [...deliveryKeys.all, 'checkout-preview', 'idle'],
    queryFn: () => {
      if (!input) {
        throw new Error('Checkout preview input is missing.');
      }

      return orderService.getCheckoutPreview(input);
    },
    enabled: Boolean(input && session.data?.token) && !isSelectingCoupon,
    retry: false,
    // Each pricing input/cart revision owns its confirmed result. Recalculate
    // on a changed key or explicit invalidation/retry, never just on focus/resume.
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options,
  });
}
