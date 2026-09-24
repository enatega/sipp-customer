import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { ApiError } from '../../../../general/api/apiClient';
import { deliveryKeys } from '../../api/queryKeys';
import { storeMenuService, type StoreMenuPage, type StoreMenuPageParam } from '../../api/storeMenuService';

export interface StoreMenuAnchor {
  sectionId: string;
  productId?: string;
  /** Product top relative to the bottom of the pinned toolbar. */
  offset?: number;
  showHero?: boolean;
}

export function useStoreMenuWindow(storeId: string, isFocused: boolean) {
  const client = useQueryClient();
  const instanceId = useId();
  const generation = useRef(0);
  const edgeRequest = useRef(false);
  const [isEdgeRequestPending, setEdgeRequestPending] = useState(false);
  const beforePageCommit = useRef<((preservePosition: boolean) => StoreMenuAnchor | undefined) | null>(null);
  const [target, setTarget] = useState<(StoreMenuAnchor & { generation: number }) | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bootstrap = useQuery({
    queryKey: deliveryKeys.storeMenu(storeId),
    queryFn: ({ signal }) => storeMenuService.bootstrap(storeId, signal),
    enabled: Boolean(storeId) && isFocused,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
  const sections = bootstrap.data?.sections;
  const sectionId = target?.sectionId ?? sections?.[0]?.id ?? '';
  const initialPageParam: StoreMenuPageParam = {
    sectionId, direction: 'forward', anchorProductId: target?.productId,
  };
  const queryKey = deliveryKeys.storeMenuWindow(storeId, sectionId, target?.generation ?? 0, instanceId);
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam, signal }) => {
      const page = await storeMenuService.page(storeId, pageParam, signal);
      if (!signal.aborted) {
        const cached = client.getQueryData<InfiniteData<StoreMenuPage, StoreMenuPageParam>>(queryKey);
        // Appending below the viewport must not issue a scroll command.
        // Only prepends and front-page eviction can move the visible rows.
        const preservePosition = Boolean(cached?.pages.length &&
          (pageParam.direction === 'backward' || cached.pages.length >= 12));
        const anchor = beforePageCommit.current?.(preservePosition);
        const evictedPage = pageParam.direction === 'backward' ? cached?.pages[cached.pages.length - 1] : cached?.pages[0];
        // A user can reverse direction while this request is in flight. Never
        // evict their visible product merely because an old edge request completed.
        if (cached && cached.pages.length >= 12 && anchor?.productId &&
            evictedPage?.items.some((item) => item.id === anchor.productId)) {
          await client.cancelQueries({ queryKey, exact: true });
        }
      }
      return page;
    },
    initialPageParam,
    initialData: () => {
      const page = bootstrap.data?.firstPage;
      return !target && page?.sectionId === sectionId
        ? { pages: [page], pageParams: [initialPageParam] }
        : undefined;
    },
    getNextPageParam: (page: StoreMenuPage): StoreMenuPageParam | undefined => {
      if (page.hasNext && page.nextCursor) return { sectionId: page.sectionId, direction: 'forward', cursor: page.nextCursor };
      const index = sections?.findIndex((section) => section.id === page.sectionId) ?? -1;
      const next = index >= 0 ? sections?.[index + 1] : undefined;
      return next ? { sectionId: next.id, direction: 'forward' } : undefined;
    },
    getPreviousPageParam: (page: StoreMenuPage): StoreMenuPageParam | undefined => {
      if (page.hasPrevious && page.previousCursor) return { sectionId: page.sectionId, direction: 'backward', cursor: page.previousCursor };
      const index = sections?.findIndex((section) => section.id === page.sectionId) ?? -1;
      const previous = index > 0 ? sections?.[index - 1] : undefined;
      return previous ? { sectionId: previous.id, direction: 'backward' } : undefined;
    },
    enabled: Boolean(storeId && sectionId && sections?.some((section) => section.id === sectionId)) && isFocused,
    maxPages: 12,
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
  const currentKey = useRef(queryKey);
  currentKey.current = queryKey;
  useEffect(() => {
    if (!isFocused) {
      generation.current += 1;
      void client.cancelQueries({ queryKey: currentKey.current, exact: true });
      void client.cancelQueries({ queryKey: deliveryKeys.storeMenu(storeId), exact: true });
    }
  }, [client, isFocused, storeId]);

  const jump = useCallback((anchor: StoreMenuAnchor) => {
    // Cancel synchronously before changing the observer. gcTime: 0 discards
    // the old window rather than caching twelve pages for every tapped pill.
    generation.current += 1;
    void client.cancelQueries({ queryKey: currentKey.current, exact: true });
    setTarget({ ...anchor, generation: generation.current });
  }, [client]);

  const refresh = useCallback(async (anchor?: StoreMenuAnchor) => {
    const requestedGeneration = ++generation.current;
    setIsRefreshing(true);
    await client.cancelQueries({ queryKey: currentKey.current, exact: true });
    try {
      const result = await bootstrap.refetch();
      if (!result.data || result.error || requestedGeneration !== generation.current) return;
      const available = result.data.sections;
      const section = available.find((item) => item.id === anchor?.sectionId)
        ?? available.find((item) => item.categoryId === anchor?.sectionId.split(':')[0])
        ?? available[0];
      if (section) setTarget({
        sectionId: section.id,
        productId: section.id === anchor?.sectionId ? anchor?.productId : undefined,
        offset: section.id === anchor?.sectionId ? anchor?.offset : undefined,
        generation: requestedGeneration,
        showHero: anchor?.showHero,
      });
      else setTarget(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [bootstrap.refetch, client]);

  const load = useCallback((direction: 'forward' | 'backward') => {
    if (!isFocused || isRefreshing || isEdgeRequestPending || query.isFetching || query.isError || edgeRequest.current) return false;
    if (direction === 'forward' ? !query.hasNextPage : !query.hasPreviousPage) return false;
    edgeRequest.current = true;
    setEdgeRequestPending(true);
    const request = direction === 'forward'
      ? query.fetchNextPage({ cancelRefetch: false })
      : query.fetchPreviousPage({ cancelRefetch: false });
    void request.finally(() => {
      edgeRequest.current = false;
      // Wake layout-based loading after the synchronous request lock clears.
      setEdgeRequestPending(false);
    });
    return true;
  }, [isFocused, isRefreshing, isEdgeRequestPending, query.isFetching, query.isError, query.hasNextPage, query.hasPreviousPage, query.fetchNextPage, query.fetchPreviousPage]);

  const retryPage = useCallback((anchor?: StoreMenuAnchor) => {
    if (query.error instanceof ApiError && query.error.status === 404) {
      void refresh(anchor ?? { sectionId });
      return;
    }
    if (query.isFetchPreviousPageError) void query.fetchPreviousPage();
    else if (query.isFetchNextPageError) void query.fetchNextPage();
    else void query.refetch();
  }, [query.error, refresh, sectionId, query.isFetchPreviousPageError, query.isFetchNextPageError, query.fetchPreviousPage, query.fetchNextPage, query.refetch]);

  return { bootstrap, query, target, sectionId, jump, refresh, isRefreshing, load, retryPage, beforePageCommit };
}
