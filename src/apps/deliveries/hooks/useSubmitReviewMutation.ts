import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../general/api/apiClient';
import { deliveryKeys } from '../api/queryKeys';
import {
  reviewService,
  type SubmitReviewPayload,
  type SubmitReviewResponse,
} from '../api/reviewService';

type Options = {
  onSuccess?: (data: SubmitReviewResponse) => void;
  onError?: (error: ApiError) => void;
};

export function useSubmitReviewMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<SubmitReviewResponse, ApiError, SubmitReviewPayload>({
    mutationFn: reviewService.submitReview,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: deliveryKeys.orderReview(variables.orderId),
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
