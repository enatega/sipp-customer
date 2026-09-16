import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../../../general/components/Button";
import Icon from "../../../../general/components/Icon";
import PlatformGlassSurface from "../../../../general/components/PlatformGlassSurface";
import PressableScale from "../../../../general/components/PressableScale";
import { useWindowClass } from "../../../../general/hooks/useWindowClass";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";

type Props = {
  quantity: number;
  totalPriceLabel: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  isAvailable?: boolean;
  onAddToCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function Footer({
  quantity,
  totalPriceLabel,
  isSubmitting = false,
  isDisabled = false,
  isAvailable = true,
  onAddToCart,
  onIncrement,
  onDecrement,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();

  return (
    <View
      style={[
        styles.positioner,
        {
          bottom: insets.bottom + spacing.sm,
          paddingHorizontal: gutter,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.shadowShell,
          elevation.overlay,
          {
            borderRadius: shape.radius.sheet,
            maxWidth: layout.contentMaxWidth.readable,
          },
        ]}
      >
        <PlatformGlassSurface
          effectStyle="regular"
          style={[
            styles.container,
            {
              borderColor: colors.glassBorder,
              borderRadius: shape.radius.sheet,
              gap: spacing.sm,
              padding: spacing.sm,
            },
          ]}
        >
          <View
            style={[
              styles.stepper,
              {
                backgroundColor: colors.surfaceSunken,
                borderRadius: shape.radius.control,
              },
            ]}
          >
            <PressableScale
              accessibilityLabel={t("cart_decrement_item")}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting || quantity <= 1 }}
              disabled={isSubmitting || quantity <= 1}
              onPress={onDecrement}
              style={[
                styles.iconButton,
                {
                  borderRadius: shape.radius.control,
                  height: layout.touchTarget.minimum,
                  width: layout.touchTarget.minimum,
                },
              ]}
            >
              <Icon
                color={colors.iconColor}
                name="remove"
                size={14}
                type="Ionicons"
              />
            </PressableScale>

            <Text
              color={colors.text}
              weight="semiBold"
              style={styles.quantity}
              variant="numeric"
            >
              {quantity}
            </Text>

            <PressableScale
              accessibilityLabel={t("cart_increment_item")}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              onPress={onIncrement}
              style={[
                styles.iconButton,
                {
                  borderRadius: shape.radius.control,
                  height: layout.touchTarget.minimum,
                  width: layout.touchTarget.minimum,
                },
              ]}
            >
              <Icon
                color={colors.iconColor}
                name="add"
                size={14}
                type="Ionicons"
              />
            </PressableScale>
          </View>

          <View style={styles.cta}>
            <Button
              disabled={isDisabled}
              fullWidth
              isLoading={isSubmitting}
              label={
                isAvailable
                  ? `${t("add_to_cart")}  ·  ${totalPriceLabel}`
                  : t("product_info_unavailable")
              }
              onPress={onAddToCart}
              variant="primary"
            />
          </View>
        </PlatformGlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    overflow: "hidden",
    width: "100%",
  },
  cta: {
    flex: 1,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  positioner: {
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 30,
  },
  quantity: {
    fontVariant: ["tabular-nums"],
    minWidth: 24,
    textAlign: "center",
  },
  shadowShell: {
    alignSelf: "center",
    width: "100%",
  },
  stepper: {
    alignItems: "center",
    flexDirection: "row",
  },
});
