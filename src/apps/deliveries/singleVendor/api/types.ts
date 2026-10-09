import type {
  DeliveryShopTypeProduct,
  PaginatedDeliveryResponse,
} from '../../api/types';
import type { DeliveryDealsTabType } from '../../api/dealsServiceTypes';

export interface SingleVendorCategory {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface SingleVendorCategoriesParams {
  offset?: number;
  limit?: number;
}

export interface SingleVendorCategoryProductsParams {
  categoryId: string;
  offset?: number;
  limit?: number;
  search?: string;
  latitude?: number;
  longitude?: number;
  stock?: string;
  subcategory_id?: string;
  // Hooks send a single-item array (serialised as price_tiers[]=x).
  price_tiers?: string | string[];
  sort_by?: string;
}

export interface SingleVendorDealsParams {
  latitude?: number;
  longitude?: number;
  offset?: number;
  limit?: number;
  search?: string;
  tab?: DeliveryDealsTabType;
}

export type SingleVendorCategoriesApiResponse =
  PaginatedDeliveryResponse<SingleVendorCategory>;

export type SingleVendorCategoryProductsApiResponse =
  PaginatedDeliveryResponse<DeliveryShopTypeProduct>;

export type SingleVendorDealsApiResponse =
  PaginatedDeliveryResponse<DeliveryShopTypeProduct>;
