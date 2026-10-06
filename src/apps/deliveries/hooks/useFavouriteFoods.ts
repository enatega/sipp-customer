import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ApiError } from '../../../general/api/apiClient';
import { deliveryKeys } from '../api/queryKeys';
import { favouriteFoodsService } from '../api/favouriteFoodsService';
import type { DeliveryFavouriteFood, DeliveryShopTypeProduct, PaginatedDeliveryResponse } from '../api/types';
import { useBrowseCity } from '../stores/useBrowseCityStore';

export function useFavouriteFoods() {
  return useQuery<DeliveryFavouriteFood[], ApiError>({
    queryKey: deliveryKeys.favouriteFoods(),
    queryFn: favouriteFoodsService.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFavouriteFoodProducts(foodId: string, shopTypeId?: string, search?: string) {
  const city = useBrowseCity();
  const latitude = city?.latitude;
  const longitude = city?.longitude;
  const query = useInfiniteQuery<PaginatedDeliveryResponse<DeliveryShopTypeProduct>, ApiError>({
    queryKey: deliveryKeys.favouriteFoodProducts(foodId, shopTypeId, latitude, longitude, search),
    queryFn: ({ pageParam }) => favouriteFoodsService.products(foodId, {
      offset: pageParam as number,
      limit: 12,
      latitude,
      longitude,
      shopTypeId,
      search,
    }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.isEnd ? undefined : (page.nextOffset ?? undefined),
    enabled: Boolean(foodId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    products: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total,
  };
}
