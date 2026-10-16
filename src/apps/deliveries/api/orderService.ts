import apiClient, { ApiError } from '../../../general/api/apiClient';
import type {
  CheckoutScheduleSlotsInput,
  CheckoutScheduleSlotsResponse,
  CheckoutPreviewInput,
  CheckoutPreviewResponse,
  PlaceOrderInput,
  PlaceOrderResponse,
} from './orderServiceTypes';

const ORDERS_BASE = '/api/v1/apps/deliveries/orders';
const CHECKOUT_PREVIEW_PATH = `${ORDERS_BASE}/place-order/preview`;
const CHECKOUT_PLACE_ORDER_PATH = ORDERS_BASE;
const ENABLE_DELIVERIES_ORDER_DEBUG = __DEV__;
const PLACE_ORDER_TIMEOUT_MS = 45_000;

type PlacedOrderLookup = { orderId: string | null; draftId: string | null };

async function recoverAmbiguousPlacement(input: PlaceOrderInput): Promise<PlaceOrderResponse> {
  // A disconnected client cannot infer whether the payment/order committed.
  // Resolve the original cart before allowing any new payment attempt.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    try {
      const lookup = await apiClient.get<PlacedOrderLookup>(
        `${ORDERS_BASE}/by-bucket/${encodeURIComponent(input.bucketId)}`,
        { storeId: input.storeId },
      );
      if (lookup.orderId) {
        if (input.paymentMethod === 'stripe') {
          return {
            mode: 'stripe',
            draftId: lookup.draftId ?? '',
            orderId: lookup.orderId,
            paymentStatus: 'paid',
          };
        }
        return {
          mode: input.paymentMethod,
          orderId: lookup.orderId,
          status: 'placed',
          paymentStatus: input.paymentMethod === 'wallet' ? 'paid' : 'pending',
          paymentMethod: input.paymentMethod === 'wallet' ? 'wallet' : 'cash',
          orderType: input.orderType,
          totalAmount: 0,
          scheduledAt: input.scheduledAt ?? null,
          createdAt: '',
        };
      }
      if (lookup.draftId) {
        const draft = await apiClient.get<{
          status: string;
          orderId: string | null;
        }>(`${ORDERS_BASE}/stripe/drafts/${encodeURIComponent(lookup.draftId)}/status`);
        if (draft.orderId) {
          return {
            mode: 'stripe',
            draftId: lookup.draftId,
            orderId: draft.orderId,
            paymentStatus: 'paid',
          };
        }
        if (draft.status === 'payment_failed' || draft.status === 'cancelled') {
          throw new ApiError('Card payment failed.', 402, 'PAYMENT_FAILED');
        }
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === 'PAYMENT_FAILED') {
        throw error;
      }
      // A failed status lookup is inconclusive. Keep checking the same cart.
    }
  }
  throw new ApiError(
    'We are still confirming your order. Please check your orders before trying again.',
    0,
    'ORDER_STATUS_UNKNOWN',
  );
}

export const orderService = {
  getPlacedOrderByBucket: (bucketId: string, storeId: string) =>
    apiClient.get<PlacedOrderLookup>(
      `${ORDERS_BASE}/by-bucket/${encodeURIComponent(bucketId)}`,
      { storeId },
    ),
  getCheckoutScheduleSlots: (
    storeId: string,
    input: CheckoutScheduleSlotsInput = {},
  ) =>
    apiClient.get<CheckoutScheduleSlotsResponse>(
      `${ORDERS_BASE}/schedule-slots/${storeId}`,
      input,
    ),

  getCheckoutPreview: async (input: CheckoutPreviewInput) => {
    if (ENABLE_DELIVERIES_ORDER_DEBUG) {
      console.log('[Deliveries][OrderService][Request]', {
        api: CHECKOUT_PREVIEW_PATH,
        input,
        method: 'GET',
      });
    }

    const response = await apiClient.get<CheckoutPreviewResponse>(
      CHECKOUT_PREVIEW_PATH,
      input,
    ).catch((error) => {
      if (ENABLE_DELIVERIES_ORDER_DEBUG) {
        console.log('[Deliveries][OrderService][Error]', {
          api: CHECKOUT_PREVIEW_PATH,
          error,
        });
      }
      throw error;
    });

    if (ENABLE_DELIVERIES_ORDER_DEBUG) {
      console.log('[Deliveries][OrderService][Response]', {
        api: CHECKOUT_PREVIEW_PATH,
        response,
      });
    }

    return response;
  },

  placeOrder: async (input: PlaceOrderInput) => {
    if (ENABLE_DELIVERIES_ORDER_DEBUG) {
      console.log('[Deliveries][OrderService][PlaceOrder][Request]', {
        api: CHECKOUT_PLACE_ORDER_PATH,
        input,
        method: 'POST',
      });
    }

    let response: PlaceOrderResponse;
    try {
      response = await apiClient.post<PlaceOrderResponse>(ORDERS_BASE, input, {
        timeout: PLACE_ORDER_TIMEOUT_MS,
        suppressNetworkFailureLog: true,
      });
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        (error.status !== 0 && error.code !== 'TRANSIENT_RESPONSE_STREAM_LOST')
      ) {
        throw error;
      }
      response = await recoverAmbiguousPlacement(input);
    }

    if (ENABLE_DELIVERIES_ORDER_DEBUG) {
      console.log('[Deliveries][OrderService][PlaceOrder][Response]', {
        api: CHECKOUT_PLACE_ORDER_PATH,
        response,
      });
    }

    return response;
  },

  finalizeSavedCardOrder: (draftId: string) =>
    apiClient.post<PlaceOrderResponse>(
      `${ORDERS_BASE}/stripe/drafts/${draftId}/finalize`,
      {},
      { timeout: PLACE_ORDER_TIMEOUT_MS, suppressNetworkFailureLog: true },
    ),
};
