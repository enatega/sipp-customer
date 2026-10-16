import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../general/api/apiClient';
import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';
import { authSession } from '../../../general/auth/authSession';
import { useCouponService } from '../api/useCouponService';
import { cartService } from '../api/cartService';
import { deliveryKeys } from '../api/queryKeys';
import { cartCouponIds } from '../utils/couponRules';
import { claimedCouponsKeys } from './useClaimedCouponsQuery';
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
    onSettled: async () => {
      if ((await authSession.getUser())?.id !== userId) return;
      // Finish reconciliation before releasing the mutation's pending state.
      await client.invalidateQueries({ queryKey: deliveryKeys.cart(), refetchType: 'none' });
      await client.refetchQueries({ queryKey: deliveryKeys.cart(), type: 'all' }, { throwOnError: true });
      // Pricing resumes once this mutation settles. Offer metadata refreshes independently.
      await client.invalidateQueries({ queryKey: [...deliveryKeys.all, 'checkout-preview'], refetchType: 'none' });
      void client.invalidateQueries({ queryKey: claimedCouponsKeys.all });
      if (userId) useCouponSyncStore.getState().setPending(userId, false);
    },
  });
}
