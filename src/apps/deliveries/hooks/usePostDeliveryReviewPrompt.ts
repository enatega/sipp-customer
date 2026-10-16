import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import { useAuthSessionQuery } from '../../../general/hooks/useAuthQueries';
import { deliveryKeys } from '../api/queryKeys';

export function usePostDeliveryReviewPrompt(params: {
  orderId: string;
  delivered: boolean;
  reviewLoaded: boolean;
  storeReviewed: boolean;
  riderReviewed: boolean;
}) {
  const { orderId, delivered, reviewLoaded, storeReviewed, riderReviewed } = params;
  const userId = useAuthSessionQuery().data?.user?.id;
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(true);
  const key = userId ? `review_prompt_dismissed_${userId}_${orderId}` : null;

  useEffect(() => {
    let active = true;
    setDismissed(true);
    if (!key) return;
    void SecureStore.getItemAsync(key).then((value) => {
      if (active) setDismissed(value === '1');
    }).catch(() => undefined);
    return () => { active = false; };
  }, [key]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && delivered) {
        void queryClient.invalidateQueries({ queryKey: deliveryKeys.orderReview(orderId) });
      }
    });
    return () => subscription.remove();
  }, [delivered, orderId, queryClient]);

  const dismiss = () => {
    setDismissed(true);
    if (key) void SecureStore.setItemAsync(key, '1');
  };

  return {
    visible: Boolean(delivered && isFocused && reviewLoaded && !dismissed && !storeReviewed && !riderReviewed),
    recipient: 'store' as const,
    dismiss,
  };
}
