import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';
import { claimedCouponsService } from '../api/claimedCouponsService';

export const claimedCouponsKeys = { all: ['deliveries-claimed-coupons'] as const };

export function useClaimedCouponsQuery(enabled = true) {
  const session = useAuthSessionQuery();
  return useInfiniteQuery({
    queryKey: [...claimedCouponsKeys.all, session.data?.user?.id],
    queryFn: ({ pageParam }) => claimedCouponsService.getClaimedCoupons(pageParam, 12),
    initialPageParam: 0,
    getNextPageParam: last => last.data.length && last.offset + last.data.length < last.total
      ? last.offset + last.data.length : undefined,
    enabled: enabled && Boolean(session.data?.token && session.data?.user?.id),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
