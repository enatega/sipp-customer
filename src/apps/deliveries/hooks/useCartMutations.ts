import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '../../../general/api/apiClient';
import { cartService } from '../api/cartService';
import { deliveryKeys } from '../api/queryKeys';
import type {
  AddCartItemInput,
  CartResponse,
  UpdateCartItemQuantityInput,
} from '../api/cartServiceTypes';
import { syncCartQueries } from '../cart/cartQuerySync';
import { getMatchingCartItemQuantity } from '../cart/cartLineMatching';

function isUncertainCartAddError(error: ApiError): boolean {
  return error.status === 0 || error.code === 'TRANSIENT_RESPONSE_STREAM_LOST';
}

type Options = {
  onError?: (error: ApiError) => void;
};

export function useIncrementCartItemMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, ApiError, string>({
    mutationFn: cartService.incrementItem,
    onSuccess: (data) => {
      syncCartQueries(queryClient, data);
    },
    onError: options?.onError,
  });
}

type UpdateQuantityVariables = {
  itemId: string;
  input: UpdateCartItemQuantityInput;
};

export function useAddCartItemMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, ApiError, AddCartItemInput>({
    mutationFn: async (input) => {
      const cartState = queryClient.getQueryState<CartResponse>(deliveryKeys.cart());
      const previousCart = cartState?.data;
      const previousQuantity = previousCart && cartState && Date.now() - cartState.dataUpdatedAt < 10_000
        ? getMatchingCartItemQuantity(previousCart.items, input)
        : null;

      try {
        return await cartService.addItem(input);
      } catch (error) {
        if (!isUncertainCartAddError(error as ApiError)) throw error;

        // A lost response does not tell us whether the cart write committed.
        // Read the cart before reporting failure; never repeat this POST blindly.
        for (let attempt = 0; attempt < 2; attempt += 1) {
          if (attempt > 0) {
            await new Promise<void>((resolve) => setTimeout(resolve, 800));
          }
          let latestCart: CartResponse;
          try {
            latestCart = await cartService.getCartForReconciliation();
          } catch {
            break;
          }
          syncCartQueries(queryClient, latestCart);
          if (
            previousQuantity !== null &&
            getMatchingCartItemQuantity(latestCart.items, input) >=
              previousQuantity + (input.quantity ?? 1)
          ) {
            return latestCart;
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      syncCartQueries(queryClient, data);
    },
    onError: options?.onError,
  });
}

export function useUpdateCartItemQuantityMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, ApiError, UpdateQuantityVariables>({
    mutationFn: ({ itemId, input }) => cartService.updateItemQuantity(itemId, input),
    onSuccess: (data) => {
      syncCartQueries(queryClient, data);
    },
    onError: options?.onError,
  });
}

export function useUpdateCartItemNoteMutation(options?: Options) {
  const queryClient = useQueryClient();
  return useMutation<CartResponse, ApiError, { itemId: string; itemNote: string | null }>({
    mutationFn: ({ itemId, itemNote }) => cartService.updateItemNote(itemId, itemNote),
    onSuccess: (data) => syncCartQueries(queryClient, data),
    onError: options?.onError,
  });
}

export function useDecrementCartItemMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, ApiError, string>({
    mutationFn: cartService.decrementItem,
    onSuccess: (data) => {
      syncCartQueries(queryClient, data);
    },
    onError: options?.onError,
  });
}

export function useRemoveCartItemMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, ApiError, string>({
    mutationFn: cartService.removeItem,
    onSuccess: (data) => {
      syncCartQueries(queryClient, data);
    },
    onError: options?.onError,
  });
}

export function useClearCartMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<CartResponse, ApiError, void>({
    mutationFn: cartService.clearCart,
    onSuccess: (data) => {
      syncCartQueries(queryClient, data);
    },
    onError: options?.onError,
  });
}
