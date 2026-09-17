import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiError } from '../../../general/api/apiClient';
import { deliveryKeys } from '../api/queryKeys';
import { cartService } from '../api/cartService';
import type { CartCountResponse, CartResponse } from '../api/cartServiceTypes';
import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';

type UseCartOptions = Omit<
  UseQueryOptions<CartResponse, ApiError>,
  'queryKey' | 'queryFn'
>;

type UseCartCountOptions = Omit<
  UseQueryOptions<CartCountResponse, ApiError>,
  'queryKey' | 'queryFn'
>;

export function useCart(options?: UseCartOptions) {
  const sessionQuery = useAuthSessionQuery();

  return useQuery<CartResponse, ApiError>({
    queryKey: deliveryKeys.cart(),
    queryFn: cartService.getCart,
    staleTime: 30 * 1000,
    ...options,
    enabled: Boolean(sessionQuery.data?.token) && (options?.enabled ?? true),
  });
}

export function useCartCount(options?: UseCartCountOptions) {
  const sessionQuery = useAuthSessionQuery();

  return useQuery<CartCountResponse, ApiError>({
    queryKey: deliveryKeys.cartCount(),
    queryFn: cartService.getCartCount,
    staleTime: 30 * 1000,
    ...options,
    enabled: Boolean(sessionQuery.data?.token) && (options?.enabled ?? true),
  });
}
