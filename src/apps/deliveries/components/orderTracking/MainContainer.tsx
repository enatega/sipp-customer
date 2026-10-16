import React from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import AppPopup from "../../../../general/components/AppPopup";
import { showToast } from "../../../../general/components/AppToast";
import type { DeliveriesStackParamList } from "../../navigation/types";
import OrderTrackingModernView from "./OrderTrackingModernView";
import { useOrderTrackingViewModel } from "./useOrderTrackingViewModel";
import { useCancelOrder } from "../../hooks/useOrders";
import { useOrderReviewQuery } from "../../hooks/useOrderReviewQuery";
import { usePostDeliveryReviewPrompt } from "../../hooks/usePostDeliveryReviewPrompt";

type Props = {
  navigation: NativeStackNavigationProp<
    DeliveriesStackParamList,
    "OrderTrackingScreen"
  >;
  orderId: string;
};

export default function MainContainer({ navigation, orderId }: Props) {
  const { t } = useTranslation("deliveries");
  const [isCancelVisible, setIsCancelVisible] = React.useState(false);
  const [isCancelSubmitting, setIsCancelSubmitting] = React.useState(false);
  const cancelOrder = useCancelOrder();

  const viewModel = useOrderTrackingViewModel({
    navigation,
    onMissingReceiver: () => showToast.error(t("rider_chat_missing_receiver_error")),
    onCancelOrderPress: () => setIsCancelVisible(true),
    orderId,
  });
  const reviewQuery = useOrderReviewQuery(orderId, { enabled: viewModel.order?.status === 'delivered' });
  const reviewPrompt = usePostDeliveryReviewPrompt({
    orderId,
    delivered: viewModel.order?.status === 'delivered',
    reviewLoaded: reviewQuery.isSuccess,
    storeReviewed: Boolean(reviewQuery.data?.is_reviewed),
    riderReviewed: Boolean(reviewQuery.data?.is_rider_reviewed),
  });
  return (
    <>
      <OrderTrackingModernView viewModel={viewModel} />
      <AppPopup
        description={viewModel.orderUnavailableDescription}
        primaryAction={{
          label: viewModel.orderUnavailableActionLabel,
          onPress: viewModel.onOrderUnavailableAcknowledge,
        }}
        title={viewModel.orderUnavailableTitle}
        visible={viewModel.isOrderUnavailable}
      />
      <AppPopup
        title={t('order_cancel_title')}
        description={viewModel.order?.paymentStatus === 'paid' && ['wallet', 'card'].includes(viewModel.order.paymentMethod)
          ? `${t('order_cancel_message')} ${t('order_tracking_refund_wallet')}`
          : t('order_cancel_message')}
        visible={isCancelVisible}
        primaryAction={{
          label: t('order_cancel_confirm'),
          variant: 'danger',
          isLoading: isCancelSubmitting,
          onPress: () => {
            if (isCancelSubmitting) return;
            setIsCancelSubmitting(true);
            void (async () => {
              const current = await viewModel.orderDetailsQuery.refetch();
              if (!current.data || !['pending', 'scheduled'].includes(current.data.status)) {
                setIsCancelVisible(false);
                showToast.info(t('order_tracking_cancel_no_longer_available'));
                return;
              }
              await cancelOrder.mutateAsync(orderId);
              setIsCancelVisible(false);
              await viewModel.orderDetailsQuery.refetch();
            })().catch((error) => {
              void viewModel.orderDetailsQuery.refetch();
              setIsCancelVisible(false);
              showToast.error(t('order_cancel_failed'), error instanceof Error ? error.message : undefined);
            }).finally(() => setIsCancelSubmitting(false));
          },
        }}
        secondaryAction={{
          label: t('order_cancel_keep'),
          variant: 'secondary',
          disabled: isCancelSubmitting,
          onPress: () => setIsCancelVisible(false),
        }}
      />
      <AppPopup
        visible={reviewPrompt.visible}
        title={t('review_prompt_title')}
        description={t('review_prompt_description')}
        dismissOnOverlayPress
        onRequestClose={reviewPrompt.dismiss}
        primaryAction={{
          label: t('review_prompt_rate'),
          onPress: () => {
            reviewPrompt.dismiss();
            navigation.navigate('RateOrder', { orderId, storeName: viewModel.order?.store?.name || '' });
          },
        }}
        secondaryAction={{ label: t('review_prompt_dismiss'), variant: 'secondary', onPress: reviewPrompt.dismiss }}
      />
    </>
  );
}
