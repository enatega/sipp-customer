import React from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import AppPopup from '../../../../general/components/AppPopup';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import { ordersService } from '../../api/ordersService';
import { reviewService } from '../../api/reviewService';

type PromptOrder = { orderId: string; storeName: string };

export default function HomeDeliveryReviewPrompt({ onRate }: { onRate: (order: PromptOrder) => void }) {
  const { t } = useTranslation('deliveries');
  const userId = useAuthSessionQuery().data?.user?.id;
  const focused = useIsFocused();
  const [order, setOrder] = React.useState<PromptOrder | null>(null);
  const checking = React.useRef(false);

  React.useEffect(() => {
    if (!focused || !userId) {
      setOrder(null);
      return;
    }
    let active = true;
    const check = async () => {
      if (checking.current) return;
      checking.current = true;
      try {
        const past = await ordersService.getPastOrders({ limit: 20 });
        for (const item of past.items) {
          if (item.orderStatus !== 'delivered') continue;
          const key = `review_prompt_dismissed_${userId}_${item.orderId}`;
          if (await SecureStore.getItemAsync(key).catch(() => null) === '1') continue;
          const review = await reviewService.getOrderReview(item.orderId).catch(() => null);
          if (!review) continue;
          if (!review.is_reviewed && !review.is_rider_reviewed) {
            if (active) setOrder({ orderId: item.orderId, storeName: item.storeName });
            break;
          }
        }
      } catch {
        // A review prompt must never block the home screen.
      } finally {
        checking.current = false;
      }
    };
    void check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    return () => { active = false; subscription.remove(); };
  }, [focused, userId]);

  const dismiss = () => {
    if (order && userId) {
      void SecureStore.setItemAsync(`review_prompt_dismissed_${userId}_${order.orderId}`, '1').catch(() => undefined);
    }
    setOrder(null);
  };

  return <AppPopup
    visible={Boolean(order)}
    title={t('review_prompt_title')}
    description={t('review_prompt_description')}
    dismissOnOverlayPress
    onRequestClose={dismiss}
    primaryAction={{
      label: t('review_prompt_rate'),
      onPress: () => {
        if (!order) return;
        const selected = order;
        setOrder(null);
        onRate(selected);
      },
    }}
    secondaryAction={{ label: t('review_prompt_dismiss'), variant: 'secondary', onPress: dismiss }}
  />;
}
