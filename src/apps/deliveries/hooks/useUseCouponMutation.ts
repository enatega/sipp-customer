import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { ApiError } from '../../../general/api/apiClient';
import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';
import { authSession } from '../../../general/auth/authSession';
import { useCouponService } from '../api/useCouponService';
import { cartService } from '../api/cartService';
import { deliveryKeys } from '../api/queryKeys';
import { cartCouponIds } from '../utils/couponRules';
import { claimedCouponsKeys } from './useClaimedCouponsQuery';
import type { ClaimedCouponsResponse } from '../api/claimedCouponsService';
import { useCouponSyncStore } from '../stores/useCouponSyncStore';

export const couponMutationKey = ['deliveries-coupon-selection'] as const;

export function useUseCouponMutation() {
  const client = useQueryClient();
  const session = useAuthSessionQuery();
  const userId = session.data?.user?.id;
  return useMutation({
    mutationKey: couponMutationKey,
    scope: { id: 'deliveries-coupon-selection' },
    retry: false,
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!userId || (await authSession.getUser())?.id !== userId) throw new Error('Session changed');
      useCouponSyncStore.getState().setPending(userId, true);
      await client.cancelQueries({ queryKey: deliveryKeys.cart() });
      await client.cancelQueries({ queryKey: [...deliveryKeys.all, 'checkout-preview'] });
      try {
        return await useCouponService.useCoupon(id, { isActive });
      } catch (error) {
        if (error instanceof ApiError && (error.status === 0 || error.status >= 500 || error.status === 408)) {
          // A lost response may still have saved the selection. Reconcile before retry.
          const cart = await cartService.getCartForReconciliation();
          if (cartCouponIds(cart).includes(id) === isActive) return { message: '' };
        }
        throw error;
      }
    },
    onSettled: async (_data, _error) => {
      if ((await authSession.getUser())?.id !== userId) return;
      // Finish reconciliation before releasing the mutation's pending state.
      await client.invalidateQueries({ queryKey: deliveryKeys.cart(), refetchType: 'none' });
      await client.refetchQueries({ queryKey: deliveryKeys.cart(), type: 'all' }, { throwOnError: true });
      // Cart selection is authoritative. Updating this badge needs no offer-list request.
      const cart = client.getQueryData<import('../api/cartServiceTypes').CartResponse>(deliveryKeys.cart());
      if (cart) {
        const ids = cartCouponIds(cart);
        client.setQueriesData<InfiniteData<ClaimedCouponsResponse>>(
          { queryKey: [...claimedCouponsKeys.all, userId] },
          old => old ? { ...old, pages: old.pages.map(page => ({ ...page,
            data: page.data.map(coupon => ({ ...coupon, is_active: ids.includes(coupon.id) })),
          })) } : old,
        );
      }
      // Only changed selections need a new preview. A repeated/failed no-op
      // keeps its existing confirmed total.
      if (!_error) await client.invalidateQueries({ queryKey: [...deliveryKeys.all, 'checkout-preview'], refetchType: 'none' });
      if (userId) useCouponSyncStore.getState().setPending(userId, false);
    },
  });
}
