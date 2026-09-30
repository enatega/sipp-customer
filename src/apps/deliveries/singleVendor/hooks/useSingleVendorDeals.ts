import { useInfiniteQuery } from '@tanstack/react-query';
import type { ApiError } from '../../../../general/api/apiClient';
import type { DeliveryDealsTabType } from '../../api/dealsServiceTypes';
import { deliveryKeys } from '../../api/queryKeys';
import type {
  DeliveryShopTypeProduct,
  PaginatedDeliveryResponse,
} from '../../api/types';
import { singleVendorDiscoveryService } from '../api/discoveryService';
import { useBrowseCity } from '../../stores/useBrowseCityStore';

type UseSingleVendorDealsMode = 'preview' | 'paginated';

type UseSingleVendorDealsOptions = {
  mode?: UseSingleVendorDealsMode;
  enabled?: boolean;
  search?: string;
  tab?: DeliveryDealsTabType;
};

const SINGLE_VENDOR_DEALS_LIMIT = 10;

export default function useSingleVendorDeals(
  options?: UseSingleVendorDealsOptions,
) {
  const mode = options?.mode ?? 'preview';
  const normalizedSearch = options?.search?.trim() ?? '';
  const tab = options?.tab ?? 'all';
  const city = useBrowseCity();
  const query = useInfiniteQuery<
    PaginatedDeliveryResponse<DeliveryShopTypeProduct>,
    ApiError
  >({
    queryKey: [
      ...deliveryKeys.singleVendorDeals({
        limit: SINGLE_VENDOR_DEALS_LIMIT,
        search: normalizedSearch,
        tab,
      }),
      { mode, cityName: city?.name },
    ],
    queryFn: ({ pageParam = 0 }) =>
      singleVendorDiscoveryService.getDealsPage({
        offset: pageParam as number,
        limit: SINGLE_VENDOR_DEALS_LIMIT,
        search: normalizedSearch || undefined,
        tab,
        latitude: city?.latitude,
        longitude: city?.longitude,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.isEnd ? undefined : (lastPage.nextOffset ?? undefined),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    ...query,
    data:
      mode === 'preview'
        ? items.slice(0, SINGLE_VENDOR_DEALS_LIMIT)
        : items,
    totalCount: query.data?.pages.length
      ? query.data.pages[query.data.pages.length - 1]?.total
      : undefined,
  };
}
