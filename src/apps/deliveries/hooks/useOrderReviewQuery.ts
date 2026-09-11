import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '../../../general/api/apiClient';
import { deliveryKeys } from '../api/queryKeys';
import { reviewService, type OrderReviewResponse } from '../api/reviewService';

type Options = {
  enabled?: boolean;
};

export function useOrderReviewQuery(orderId?: string, options?: Options) {
  return useQuery<
    OrderReviewResponse,
    ApiError,
    OrderReviewResponse,
    ReturnType<typeof deliveryKeys.orderReview>
  >({
    queryKey: deliveryKeys.orderReview(orderId ?? 'unknown'),
    queryFn: () => reviewService.getOrderReview(orderId ?? ''),
    enabled: Boolean(orderId) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}
