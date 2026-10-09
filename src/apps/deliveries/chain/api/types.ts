import type {
  DeliveryShopTypeProduct,
  PaginatedDeliveryResponse,
} from '../../api/types';

export type ChainMenuTemplate = {
  id: string;
  name: string;
};

export type ChainMenuCategory = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

export type ChainMenuTemplatesParams = {
  offset?: number;
  limit?: number;
};

export type ChainMenuCategoriesParams = {
  menuTemplateId: string;
  offset?: number;
  limit?: number;
};

export type ChainMenuCategoryProductsParams = {
  latitude?: number;
  longitude?: number;
  menuTemplateId: string;
  categoryId: string;
  offset?: number;
  limit?: number;
  search?: string;
  stock?: string;
  subcategory_id?: string;
  // Hooks send a single-item array (serialised as price_tiers[]=x).
  price_tiers?: string | string[];
  sort_by?: string;
};

export type ChainMenuDealsParams = {
  latitude?: number;
  longitude?: number;
  menuTemplateId: string;
  offset?: number;
  limit?: number;
  search?: string;
  tab?: string;
  sort_by?: string;
};

export type ChainMenuTemplatesApiResponse =
  PaginatedDeliveryResponse<ChainMenuTemplate>;

export type ChainMenuCategoriesApiResponse =
  PaginatedDeliveryResponse<ChainMenuCategory>;

export type ChainMenuCategoryProductsApiResponse =
  PaginatedDeliveryResponse<DeliveryShopTypeProduct>;

export type ChainMenuDealsApiResponse =
  PaginatedDeliveryResponse<DeliveryShopTypeProduct>;
