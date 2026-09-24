import apiClient from '../../../general/api/apiClient';
import type { DeliveryStoreDetailsProduct, DeliveryStoreViewApiResponse } from './types';

export interface StoreMenuSection {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  name: string;
  productCount: number;
}

export interface StoreMenuPage {
  sectionId: string;
  items: DeliveryStoreDetailsProduct[];
  previousCursor: string | null;
  nextCursor: string | null;
  hasPrevious: boolean;
  hasNext: boolean;
  anchorFound?: boolean;
}

export interface StoreMenuBootstrap {
  store: DeliveryStoreViewApiResponse;
  sections: StoreMenuSection[];
  firstPage: StoreMenuPage | null;
}

export interface StoreMenuPageParam {
  sectionId: string;
  direction: 'forward' | 'backward';
  cursor?: string;
  anchorProductId?: string;
}

export const storeMenuService = {
  bootstrap: (storeId: string, signal?: AbortSignal) =>
    apiClient.get<StoreMenuBootstrap>(`/api/v1/apps/deliveries/stores/${storeId}/view/menu`, undefined, { signal }),
  page: (storeId: string, params: StoreMenuPageParam, signal?: AbortSignal) =>
    apiClient.get<StoreMenuPage>(
      `/api/v1/apps/deliveries/stores/${storeId}/view/menu/sections/${encodeURIComponent(params.sectionId)}/products`,
      { limit: 24, direction: params.direction, cursor: params.cursor, anchorProductId: params.anchorProductId },
      { signal },
    ),
};
