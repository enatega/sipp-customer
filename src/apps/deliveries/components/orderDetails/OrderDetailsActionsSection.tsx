import React from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";


import Button from "../../../../general/components/Button";
import { useTheme } from "../../../../general/theme/theme";
import type { DeliveriesStackParamList } from "../../navigation/types";


type Props = {
  navigation: NativeStackNavigationProp<
    DeliveriesStackParamList,
    "OrderDetailsScreen"
  >;
  hasSubmittedRating: boolean;
  shouldShowRateOrder: boolean;
  shouldShowTrackProgress: boolean;
  shouldShowOrderAgain: boolean;
  onIncreaseTip?: () => void;
  orderId: string;
  storeName: string;
  isOrderAgainLoading?: boolean;
  isCancelOrderLoading?: boolean;
  onCancelOrder?: () => void;
  shouldShowCancelOrder: boolean;
  onOrderAgain: () => void;
};

export default function OrderDetailsActionsSection({
  navigation,
  hasSubmittedRating,
  shouldShowRateOrder,
  shouldShowTrackProgress,
  shouldShowOrderAgain,
  onIncreaseTip,
  isOrderAgainLoading = false,
  isCancelOrderLoading = false,
  onCancelOrder,
  shouldShowCancelOrder,
  onOrderAgain,
  orderId,
  storeName,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, typography } = useTheme();
  const secondaryButtonStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  } as const;
  const labelStyle = {
    fontSize: typography.size.md2,
    lineHeight: typography.lineHeight.md2,
  } as const;
  const shouldUseTwoColumnLayout = shouldShowTrackProgress && shouldShowOrderAgain;

  return (
    <View style={styles.container}>
      {shouldShowCancelOrder && onCancelOrder ? (
        <Button
          isLoading={isCancelOrderLoading}
          label={t('order_cancel_confirm')}
          onPress={onCancelOrder}
          style={secondaryButtonStyle}
          labelStyle={labelStyle}
          variant="secondary"
        />
      ) : null}
      {/* {onIncreaseTip ? (
        <Button
          label={t("order_details_increase_tip")}
          onPress={onIncreaseTip}
          style={secondaryButtonStyle}
        />
      ) : null} */}

      {shouldShowRateOrder ? (
        <Button
          label={
            hasSubmittedRating
              ? t("order_details_view_rating")
              : t("order_details_rate_order")
          }
          onPress={() => {
            navigation.navigate("RateOrder", {
              orderId,
              storeName,
            });
          }}
          style={secondaryButtonStyle}
          labelStyle={labelStyle}
          variant="secondary"
        />
      ) : null}
      <View style={shouldUseTwoColumnLayout ? styles.row : styles.stack}>
        {shouldShowOrderAgain ? (
          <Button
            isLoading={isOrderAgainLoading}
            label={t("order_details_order_again")}
            onPress={onOrderAgain}
            style={[
              shouldUseTwoColumnLayout ? styles.rowButton : styles.primaryButton,
              secondaryButtonStyle,
            ]}
            labelStyle={labelStyle}
            variant="secondary"
          />
        ) : null}
        {shouldShowTrackProgress ? (
          <Button
            label={t("order_details_track_progress")}
            onPress={() =>
              navigation.navigate("OrderTrackingScreen", { orderId })
            }
            style={shouldUseTwoColumnLayout ? styles.rowButton : undefined}
            labelStyle={labelStyle}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 24,
    paddingTop: 8,
  },
  primaryButton: {
    marginTop: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowButton: {
    flex: 1,
  },
  stack: {
    gap: 12,
  },
});
