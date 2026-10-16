import { useCallback, useRef, useState } from 'react';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../general/api/apiClient';
import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';
import { authSession } from '../../../general/auth/authSession';
import { useCart } from './useCart';
import { useClaimedCouponsQuery, claimedCouponsKeys } from './useClaimedCouponsQuery';
import { useClaimCouponMutation } from './useClaimCouponMutation';
import { couponMutationKey, useUseCouponMutation } from './useUseCouponMutation';
import { useCouponText } from './useCouponText';
import { couponIssueFromError } from '../utils/couponRules';
import { deliveryKeys } from '../api/queryKeys';
import { useCouponSyncStore } from '../stores/useCouponSyncStore';

export function useOffers(onRefreshPreview?: () => Promise<unknown>) {
  const { t } = useTranslation('deliveries');
  const text = useCouponText();
  const session = useAuthSessionQuery();
  const userId = session.data?.user?.id;
  const client = useQueryClient();
  const cart = useCart();
  const coupons = useClaimedCouponsQuery();
  const claim = useClaimCouponMutation();
  const activation = useUseCouponMutation();
  const selecting = useIsMutating({ mutationKey: couponMutationKey }) > 0;
  const syncPending = useCouponSyncStore(state => state.userId === userId && state.pending);
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const lock = useRef(false);
  const previewRefresh = useRef(onRefreshPreview);
  previewRefresh.current = onRefreshPreview;

  const refresh = useCallback(async () => {
    if (!userId || client.isMutating({ mutationKey: couponMutationKey }) > 0) return;
    setRefreshing(true);
    try {
      await client.refetchQueries({ queryKey: deliveryKeys.cart(), type: 'active' }, { throwOnError: true });
      // Selection is reconciled even when pricing is refused (e.g. stock changed).
      if ((await authSession.getUser())?.id === userId) useCouponSyncStore.getState().setPending(userId, false);
      await Promise.all([
        client.refetchQueries({ queryKey: [...claimedCouponsKeys.all, userId], type: 'active' }, { throwOnError: true }),
        previewRefresh.current?.(),
      ]);
      setNotice(null);
    } catch {
      setNotice({ error: true, text: t('offers_sync_error') });
    } finally {
      setRefreshing(false);
    }
  }, [client, userId, t]);

  const claimCode = async () => {
    if (lock.current || claim.isPending) return;
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{2,64}$/.test(normalized)) {
      setNotice({ error: true, text: t('offers_invalid_code') });
      return;
    }
    lock.current = true;
    setNotice(null);
    try {
      await claim.mutateAsync({ code: normalized });
      setCode('');
      setNotice({ error: false, text: t('offers_claimed') });
    } catch (error) {
      const issue = couponIssueFromError(error);
      setNotice({ error: true, text: issue ? text.issue(issue) : error instanceof ApiError && error.status === 409 ? t('offers_already_claimed') : error instanceof ApiError && error.status === 400 ? t('offers_invalid_code') : t('offers_request_error') });
    } finally { lock.current = false; }
  };

  const toggle = async (id: string, selected: boolean) => {
    if (lock.current || selecting || syncPending || refreshing || cart.isError) return;
    lock.current = true;
    setNotice(null);
    try {
      await activation.mutateAsync({ id, isActive: !selected });
    } catch (error) {
      const issue = couponIssueFromError(error);
      setNotice({ error: true, text: issue ? text.issue(issue) : t('offers_request_error') });
    } finally { lock.current = false; }
  };
  return { cart, coupons, code, setCode, notice, claimCode, claiming: claim.isPending, toggle,
    busyId: activation.isPending ? activation.variables?.id : null,
    locked: selecting || syncPending || refreshing || cart.isError || claim.isPending,
    syncPending, refreshing, refresh };
}
