import apiClient from "../../../general/api/apiClient";
import type {
  ClearRecentSearchesResponse,
  DeleteRecentSearchResponse,
  RecentSearchesResponse,
  RecentSearchItem,
  SaveRecentSearchPayload,
  SearchProductsParams,
  SearchProductsResponse,
  SearchRecommendationsResponse,
  SearchStoresParams,
  SearchStoresResponse,
  SearchEventPayload,
} from "./searchServiceTypes";

const SEARCH_BASE = "/api/v1/apps/deliveries/search";

export const searchService = {
  getRecommendations: (limit = 100): Promise<SearchRecommendationsResponse> =>
    apiClient.get<SearchRecommendationsResponse>(
      `${SEARCH_BASE}/recommendations`,
      { limit },
    ),

  getRecentSearches: (
    offset = 0,
    limit = 10,
  ): Promise<RecentSearchesResponse> =>
    apiClient.get<RecentSearchesResponse>(`${SEARCH_BASE}/recent-searches`, {
      offset,
      limit,
    }),

  saveRecentSearch: (
    payload: SaveRecentSearchPayload,
  ): Promise<RecentSearchItem> =>
    apiClient.post<RecentSearchItem>(`${SEARCH_BASE}/recent-searches`, payload),

  deleteRecentSearch: (id: string): Promise<DeleteRecentSearchResponse> =>
    apiClient.delete<DeleteRecentSearchResponse>(
      `${SEARCH_BASE}/recent-searches/${id}`,
    ),

  clearRecentSearches: (): Promise<ClearRecentSearchesResponse> =>
    apiClient.delete<ClearRecentSearchesResponse>(
      `${SEARCH_BASE}/recent-searches`,
    ),

  searchProducts: (
    params: SearchProductsParams,
    signal?: AbortSignal,
  ): Promise<SearchProductsResponse> =>
    apiClient.get<SearchProductsResponse>(
      `${SEARCH_BASE}/products`,
      params as Record<string, unknown>,
      { signal },
    ),

  searchStores: (
    params: SearchStoresParams,
    signal?: AbortSignal,
  ): Promise<SearchStoresResponse> =>
    apiClient.get<SearchStoresResponse>(
      `${SEARCH_BASE}/stores`,
      params as Record<string, unknown>,
      { signal },
    ),

  trackEvent: (payload: SearchEventPayload): Promise<{ accepted: boolean }> =>
    apiClient.post<{ accepted: boolean }>(`${SEARCH_BASE}/events`, payload),
};
