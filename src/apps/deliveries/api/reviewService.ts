import apiClient from '../../../general/api/apiClient';

const REVIEWS_BASE = '/api/v1/apps/delivery-reviews';

export interface SubmitReviewPayload {
  orderId: string;
  rating: number;
  description: string;
}

export interface SubmitReviewResponse {
  message: string;
}

export interface OrderReviewDetail {
  id: string;
  rating: number;
  description: string | null;
  reviewer_id: string;
  reviewed_id: string;
  order_id: string;
  created_at: string;
}

export interface OrderReviewResponse {
  store_name: string;
  store_address: string;
  order_status: string;
  is_reviewed: boolean;
  review_detail: OrderReviewDetail | null;
}

export const reviewService = {
  submitReview: async (payload: SubmitReviewPayload): Promise<SubmitReviewResponse> => {
    return apiClient.post<SubmitReviewResponse>(REVIEWS_BASE, payload);
  },
  getOrderReview: async (orderId: string): Promise<OrderReviewResponse> => {
    return apiClient.get<OrderReviewResponse>(`${REVIEWS_BASE}/order/${orderId}`);
  },
};
