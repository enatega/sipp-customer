import apiClient from '../../../general/api/apiClient';
import type {
  AddCartItemInput,
  CartCountResponse,
  CartResponse,
  UpdateCartItemQuantityInput,
} from './cartServiceTypes';

const CART_BASE = '/api/v1/apps/deliveries/buckets/cart';
const CART_WRITE_TIMEOUT_MS = 45_000;

export const cartService = {
  getCart: () => apiClient.get<CartResponse>(CART_BASE),
  getCartForReconciliation: () => apiClient.get<CartResponse>(CART_BASE, undefined, {
    timeout: 30_000,
    suppressNetworkFailureLog: true,
    suppressTransientSuccessStreamWarning: true,
  }),
  getCartCount: () => apiClient.get<CartCountResponse>(`${CART_BASE}/count`),
  addItem: (input: AddCartItemInput) =>
    apiClient.post<CartResponse>(`${CART_BASE}/items`, input, {
      timeout: CART_WRITE_TIMEOUT_MS,
      suppressNetworkFailureLog: true,
      suppressTransientSuccessStreamWarning: true,
    }),
  updateItemQuantity: (itemId: string, input: UpdateCartItemQuantityInput) =>
    apiClient.patch<CartResponse>(`${CART_BASE}/items/${itemId}/quantity`, input),
  updateItemNote: (itemId: string, itemNote: string | null) =>
    apiClient.patch<CartResponse>(`${CART_BASE}/items/${itemId}/note`, { itemNote }),
  incrementItem: (itemId: string) =>
    apiClient.post<CartResponse>(`${CART_BASE}/items/${itemId}/increment`),
  decrementItem: (itemId: string) =>
    apiClient.post<CartResponse>(`${CART_BASE}/items/${itemId}/decrement`),
  removeItem: (itemId: string) =>
    apiClient.delete<CartResponse>(`${CART_BASE}/items/${itemId}`),
  clearCart: () => apiClient.delete<CartResponse>(CART_BASE),
};
