import React from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  onIncreaseTip: _onIncreaseTip,
  isOrderAgainLoading = false,
  isCancelOrderLoading = false,
  onCancelOrder,
  shouldShowCancelOrder,
  onOrderAgain,
  orderId,
  storeName,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, shape, typography } = useTheme();
  const secondaryButtonStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: shape.radius.surface,
    minHeight: 56,
  } as const;
  const labelStyle = {
    fontSize: typography.size.md2,
    lineHeight: typography.lineHeight.md2,
  } as const;
  const primaryButtonStyle = {
    borderRadius: shape.radius.surface,
    minHeight: 56,
  } as const;

  return (
    <View style={styles.container}>
      {shouldShowCancelOrder && onCancelOrder ? (
        <Button
          isLoading={isCancelOrderLoading}
          label={t('order_cancel_confirm')}
          onPress={onCancelOrder}
          labelStyle={labelStyle}
          variant="danger"
        />
      ) : null}

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
      <View style={styles.stack}>
        {shouldShowTrackProgress ? (
          <Button
            icon={<Ionicons color={colors.onPrimary} name="navigate-circle-outline" size={21} />}
            label={t("order_details_track_progress")}
            onPress={() =>
              navigation.navigate("OrderTrackingScreen", { orderId })
            }
            style={primaryButtonStyle}
            labelStyle={labelStyle}
          />
        ) : null}
        {shouldShowOrderAgain ? (
          <Button
            icon={<Ionicons color={colors.primary} name="refresh-outline" size={21} />}
            isLoading={isOrderAgainLoading}
            label={t("order_details_order_again")}
            onPress={onOrderAgain}
            style={secondaryButtonStyle}
            labelStyle={labelStyle}
            variant="secondary"
          />
        ) : null}
      </View>
      <Button
        icon={<Ionicons color={colors.primary} name="headset-outline" size={19} />}
        label={t("order_details_get_help")}
        onPress={() => navigation.navigate("Support")}
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 24,
    paddingTop: 8,
  },
  stack: {
    gap: 12,
  },
});
