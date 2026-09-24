import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import useDebouncedValue from '../../../../general/hooks/useDebouncedValue';
import { discoveryService } from '../../api/discoveryService';
import { deliveryKeys } from '../../api/queryKeys';
import type { DeliveryStoreProductsApiResponse } from '../../api/types';

type PageParam = { offset: number; continuation?: string };

export function useStoreMenuSearch(storeId: string, value: string, isFocused: boolean) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const debounced = useDebouncedValue(normalized, 300);
  const term = normalized.length >= 2 ? debounced : '';
  const client = useQueryClient();
  const [resetVersion, setResetVersion] = useState(0);
  const key = deliveryKeys.storeMenuSearch(storeId, term);
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam, signal }) => discoveryService.getStoreProducts(storeId, {
      search: term, limit: 24, offset: pageParam.offset, continuation: pageParam.continuation,
    }, signal),
    initialPageParam: { offset: 0 } as PageParam,
    getNextPageParam: (page): PageParam | undefined => page.isEnd ? undefined : {
      offset: page.nextOffset ?? page.offset + page.items.length,
      continuation: page.continuation ?? undefined,
    },
    getPreviousPageParam: (page): PageParam | undefined => page.previousContinuation
      ? { offset: Math.max(0, page.offset - 24), continuation: page.previousContinuation }
      : undefined,
    enabled: Boolean(storeId) && isFocused && term.length >= 2 && term === normalized,
    maxPages: 12,
    gcTime: 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
  useEffect(() => {
    if (!isFocused || normalized !== term) void client.cancelQueries({ queryKey: key, exact: true });
  }, [client, isFocused, normalized, storeId, term]);

  useEffect(() => {
    const data = query.data;
    const restartPage = data?.pages.find((page) => page.restart);
    if (!data || !restartPage) return;
    client.setQueryData<InfiniteData<DeliveryStoreProductsApiResponse, PageParam>>(key, {
      pages: [{ ...restartPage, restart: false }], pageParams: [{ offset: 0 }],
    });
    setResetVersion((version) => version + 1);
  }, [client, query.data, storeId, term]);
  const items = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const restart = pages.find((page) => page.restart);
    const seen = new Set<string>();
    return (restart ? [restart] : pages).flatMap((page) => page.items).filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });
  }, [query.data]);
  return { query, items, term, normalized, resetVersion, isDebouncing: normalized !== term };
}
