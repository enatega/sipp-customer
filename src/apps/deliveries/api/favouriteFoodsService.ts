import apiClient from '../../../general/api/apiClient';
import type {
  DeliveryFavouriteFood,
  DeliveryShopTypeProduct,
  PaginatedDeliveryResponse,
} from './types';

const endpoint = '/api/v1/apps/deliveries/discovery/favourite-foods';

export const favouriteFoodsService = {
  list: () => apiClient.get<DeliveryFavouriteFood[]>(endpoint),
  products: (
    foodId: string,
    params: {
      offset: number;
      limit: number;
      latitude?: number;
      longitude?: number;
      shopTypeId?: string;
      search?: string;
    },
  ) => apiClient.get<PaginatedDeliveryResponse<DeliveryShopTypeProduct>>(
    `${endpoint}/${encodeURIComponent(foodId)}/products`,
    {
      offset: params.offset,
      limit: params.limit,
      latitude: params.latitude,
      longitude: params.longitude,
      shop_type_id: params.shopTypeId,
      search: params.search,
    },
  ),
};
