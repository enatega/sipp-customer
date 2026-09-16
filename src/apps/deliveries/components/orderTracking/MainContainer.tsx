import React from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import AppPopup from "../../../../general/components/AppPopup";
import { showToast } from "../../../../general/components/AppToast";
import type { DeliveriesStackParamList } from "../../navigation/types";
import OrderTrackingModernView from "./OrderTrackingModernView";
import { useOrderTrackingViewModel } from "./useOrderTrackingViewModel";

type Props = {
  navigation: NativeStackNavigationProp<
    DeliveriesStackParamList,
    "OrderTrackingScreen"
  >;
  orderId: string;
};

export default function MainContainer({ navigation, orderId }: Props) {
  const { t } = useTranslation("deliveries");

  const viewModel = useOrderTrackingViewModel({
    navigation,
    onMissingReceiver: () => showToast.error(t("rider_chat_missing_receiver_error")),
    orderId,
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
    </>
  );
}
