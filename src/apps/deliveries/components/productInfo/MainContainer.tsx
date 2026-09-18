import React, { useCallback, useMemo, useState } from "react";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDeliveriesCurrencyLabel } from "../../../../general/stores/useAppConfigStore";
import { useWindowClass } from "../../../../general/hooks/useWindowClass";
import { useTheme } from "../../../../general/theme/theme";
import type { DeliveriesStackParamList } from "../../navigation/types";
import type {
  ProductInfoCustomizationsResponse,
  ProductInfoResponse,
} from "../../api/productInfoServiceTypes";
import CartStoreConflictModal from "../cart/CartStoreConflictModal";
import StoreClosedCartModal from "../cart/StoreClosedCartModal";
import Footer from "./Footer";
import ImageHeader, { getProductInfoHeaderMaxHeight } from "./ImageHeader";
import ItemFlavour from "./ItemFlavour";
import ItemInfo from "./ItemInfo";
import ItemNutritions from "./ItemNutritions";
import ItemSizes from "./ItemSizes";
import ProductInfoCustomizationsLoadingSkeleton from "./ProductInfoCustomizationsLoadingSkeleton";
import ProductAddedToCartModal from "./ProductAddedToCartModal";
import ProductMediaActionButton from "./ProductMediaActionButton";
import useProductSelectionState from "./useProductSelectionState";
import useProductInfoCartFlow from "./useProductInfoCartFlow";

function toValidNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

type Props = {
  data: ProductInfoResponse;
  customizations?: ProductInfoCustomizationsResponse;
  isCustomizationsLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
};

export default function MainContainer({
  data: productInfoData,
  customizations,
  isCustomizationsLoading = false,
  isRefreshing = false,
  onRefresh,
}: Props) {
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation("deliveries");
  const currencyLabel = useDeliveriesCurrencyLabel();
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { gutter } = useWindowClass();
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCartVisible, setIsAddedToCartVisible] = useState(false);
  const [showSelectionErrors, setShowSelectionErrors] = useState(false);
  const scrollY = useSharedValue(0);
  const variations = customizations?.variations ?? [];
  const addons = customizations?.addons ?? [];
  const maxHeaderHeight = getProductInfoHeaderMaxHeight(width);
  const headerTravel = Math.max(120, maxHeaderHeight * 0.55);
  const detailsSurfaceWidth = Math.min(
    width - gutter * 2,
    layout.contentMaxWidth.readable,
  );
  const handleViewCart = useCallback(() => {
    setIsAddedToCartVisible(false);
    navigation.navigate("Cart");
  }, [navigation]);
  const handleAddedToCart = useCallback(() => {
    setIsAddedToCartVisible(true);
  }, []);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, headerTravel],
          [0, -spacing.xxl],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [0, headerTravel],
          [1, 1.06],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const {
    addonSections,
    cartSelectionInputs,
    isSelectionComplete,
    selectedAddonsTotal,
    selectedVariation,
    selectedVariationKey,
    selectedVariationPrice,
    selectedAddonOptionIdsByGroup,
    selectVariationOption,
    toggleAddonOption,
    variationHelperText,
    variationOptions,
  } = useProductSelectionState({ addons, variations });
  const {
    closeStoreClosedModal,
    conflictResolution,
    handleAddToCart,
    isAddDisabled,
    isStoreClosedModalVisible,
    isSubmitting,
    storeName: cartFlowStoreName,
  } =
    useProductInfoCartFlow({
      customizations,
      hasCustomizationContext: !isCustomizationsLoading && customizations !== undefined,
      product: productInfoData,
      quantity,
      onAddedToCart: handleAddedToCart,
      selectedOptions: cartSelectionInputs,
    });

  const hasNutritionSection = Boolean(
    productInfoData.ingredients?.trim() ||
      productInfoData.usage?.trim() ||
      productInfoData.nutrition?.length,
  );
  const hasSizes = variations.length > 0;
  const hasFlavours = addonSections.length > 0;
  const hasCustomizationSection = hasSizes || hasFlavours;
  const hasDetailSections =
    hasNutritionSection || hasCustomizationSection || isCustomizationsLoading;
  const detailDealPricing = useMemo(() => {
    const rawDeal = productInfoData.deal;
    const fallbackDealAmount = toValidNumber(productInfoData.dealAmount);
    const fallbackDealType = productInfoData.dealType?.toLowerCase() ?? null;

    let discountedPrice: number | null = null;
    let dealAmount = fallbackDealAmount;
    let dealType = fallbackDealType;
    let dealLabel: string | null = null;

    if (rawDeal && typeof rawDeal === "object") {
      const objectDeal = rawDeal as {
        deal_name?: string;
        discounted_price?: number;
        discountedPrice?: number;
        discount_value?: number;
        discountValue?: number;
        discount_type?: string;
        discountType?: string;
      };
      if (typeof objectDeal.deal_name === "string") {
        dealLabel = objectDeal.deal_name.trim() || null;
      }

      const objectDiscountedPrice =
        toValidNumber(objectDeal.discounted_price) ??
        toValidNumber(objectDeal.discountedPrice);
      if (objectDiscountedPrice !== null) {
        discountedPrice = objectDiscountedPrice;
      }

      if (dealAmount === null) {
        dealAmount =
          toValidNumber(objectDeal.discount_value) ??
          toValidNumber(objectDeal.discountValue);
      }

      if (!dealType) {
        const resolvedDealType =
          typeof objectDeal.discount_type === "string"
            ? objectDeal.discount_type
            : typeof objectDeal.discountType === "string"
              ? objectDeal.discountType
              : null;
        if (resolvedDealType) {
          dealType = resolvedDealType.toLowerCase();
        }
      }
    }

    const normalizedDealType = typeof dealType === "string" ? dealType.toLowerCase() : null;
    const hasNumericDiscount =
      typeof dealAmount === "number" && Number.isFinite(dealAmount) && dealAmount > 0;
    const derivedFixedDiscountFromBase =
      typeof discountedPrice === "number" &&
      Number.isFinite(discountedPrice) &&
      discountedPrice < productInfoData.price
        ? Number((productInfoData.price - discountedPrice).toFixed(2))
        : null;
    const resolvedOfferLabel = hasNumericDiscount
      ? normalizedDealType === "percentage"
        ? `${dealAmount} % OFF`
        : `${dealAmount} OFF`
      : dealLabel;

    if (
      discountedPrice === null &&
      hasNumericDiscount
    ) {
      if (normalizedDealType === "percentage") {
        discountedPrice = Math.max(
          0,
          Number((productInfoData.price - (productInfoData.price * dealAmount) / 100).toFixed(2)),
        );
      } else {
        discountedPrice = Math.max(0, Number((productInfoData.price - dealAmount).toFixed(2)));
      }
    }

    if (
      typeof discountedPrice !== "number" ||
      !Number.isFinite(discountedPrice) ||
      discountedPrice >= productInfoData.price
    ) {
      return {
        basePrice: productInfoData.price,
        offerLabel: resolvedOfferLabel ?? null,
        showOriginal: false,
      };
    }

    return {
      basePrice: discountedPrice,
      dealAmount,
      dealType: normalizedDealType,
      derivedFixedDiscountFromBase,
      offerLabel: resolvedOfferLabel ?? null,
      showOriginal: true,
    };
  }, [productInfoData.deal, productInfoData.dealAmount, productInfoData.dealType, productInfoData.price]);

  const effectiveBasePrice = useMemo(() => {
    if (variationOptions.length === 0) {
      return detailDealPricing.basePrice;
    }

    const selectedBase = selectedVariationPrice;
    if (!detailDealPricing.showOriginal) {
      return selectedBase;
    }

    if (detailDealPricing.dealType === "percentage" && typeof detailDealPricing.dealAmount === "number") {
      return Math.max(
        0,
        Number((selectedBase - (selectedBase * detailDealPricing.dealAmount) / 100).toFixed(2)),
      );
    }

    const fixedDiscount =
      typeof detailDealPricing.dealAmount === "number"
        ? detailDealPricing.dealAmount
        : detailDealPricing.derivedFixedDiscountFromBase ?? 0;

    return Math.max(0, Number((selectedBase - fixedDiscount).toFixed(2)));
  }, [
    detailDealPricing.basePrice,
    detailDealPricing.dealAmount,
    detailDealPricing.dealType,
    detailDealPricing.derivedFixedDiscountFromBase,
    detailDealPricing.showOriginal,
    selectedVariationPrice,
    variationOptions.length,
  ]);
  const configuredUnitPrice = effectiveBasePrice + selectedAddonsTotal;
  const originalUnitPrice = (variationOptions.length > 0 ? selectedVariationPrice : productInfoData.price) + selectedAddonsTotal;
  const shouldShowOriginalPrice = originalUnitPrice > configuredUnitPrice;

  const totalPrice = useMemo(
    () => configuredUnitPrice * quantity,
    [configuredUnitPrice, quantity],
  );

  const formatPrice = useCallback(
    (value: number) => `${currencyLabel} ${value.toFixed(2)}`,
    [currencyLabel],
  );

  const ratingLabel = useMemo(() => {
    if (
      typeof productInfoData.averageRating !== "number" ||
      !Number.isFinite(productInfoData.averageRating) ||
      productInfoData.averageRating <= 0
    ) {
      return null;
    }

    return productInfoData.reviewCount > 0
      ? `${productInfoData.averageRating.toFixed(1)} (${productInfoData.reviewCount.toLocaleString()})`
      : productInfoData.averageRating.toFixed(1);
  }, [productInfoData.averageRating, productInfoData.reviewCount]);

  const categoryLabel =
    productInfoData.subcategory?.name ?? productInfoData.category?.name ?? null;

  const handleSharePress = useCallback(() => {
    const shareText = [
      productInfoData.name,
      formatPrice(configuredUnitPrice),
      productInfoData.description,
    ]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join("\n");

    if (!shareText) {
      return;
    }

    void Share.share({
      message: shareText,
      title: productInfoData.name,
    }).catch(() => {
      // The system share sheet can be cancelled without user-facing feedback.
    });
  }, [configuredUnitPrice, formatPrice, productInfoData.description, productInfoData.name]);

  const handlePrimaryAction = useCallback(() => {
    if (!isSelectionComplete) {
      setShowSelectionErrors(true);
    }

    void handleAddToCart();
  }, [handleAddToCart, isSelectionComplete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={[colors.primarySoft, colors.canvas, colors.canvas]}
        end={{ x: 0.82, y: 1 }}
        locations={[0, 0.42, 1]}
        pointerEvents="none"
        start={{ x: 0.18, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.ScrollView
        bounces
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 124 },
        ]}
        contentInsetAdjustmentBehavior="never"
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void onRefresh?.();
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerContainer, { height: maxHeaderHeight }]}>
          <ImageHeader
            accessibilityLabel={productInfoData.name}
            containerStyle={styles.headerFill}
            imageStyle={imageAnimatedStyle}
            imageUri={productInfoData.imageUrl}
          />
        </View>

        <View
          style={[
            styles.detailsSurface,
            elevation.raised,
            {
              backgroundColor: colors.surface,
              borderRadius: shape.radius.hero,
              gap: spacing.none,
              paddingHorizontal: spacing.lg,
              width: detailsSurfaceWidth,
            },
          ]}
        >
          <ItemInfo
            categoryLabel={categoryLabel}
            description={productInfoData.description}
            isAvailable={productInfoData.inStock}
            name={productInfoData.name}
            offerLabel={detailDealPricing.offerLabel}
            priceLabel={formatPrice(configuredUnitPrice)}
            originalPriceLabel={
              shouldShowOriginalPrice
                ? formatPrice(originalUnitPrice)
                : null
            }
            ratingLabel={ratingLabel}
            unavailableLabel={t("product_info_unavailable")}
          />

          {hasDetailSections ? (
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          ) : null}

          {isCustomizationsLoading && !customizations ? (
            <ProductInfoCustomizationsLoadingSkeleton />
          ) : null}

          {hasSizes ? (
            <ItemSizes
              formatPrice={formatPrice}
              onSelect={selectVariationOption}
              helperText={variationHelperText}
              selectedVariationKey={selectedVariationKey}
              variations={variationOptions}
            />
          ) : null}

          {hasSizes && hasFlavours ? (
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          ) : null}

          {hasFlavours ? (
            <ItemFlavour
              formatPrice={formatPrice}
              onToggle={toggleAddonOption}
              sections={addonSections}
              selectedOptionIdsByGroup={selectedAddonOptionIdsByGroup}
              showValidationErrors={showSelectionErrors}
            />
          ) : null}

          {hasNutritionSection && hasCustomizationSection ? (
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          ) : null}

          {hasNutritionSection ? (
            <ItemNutritions
              ingredients={productInfoData.ingredients ?? undefined}
              amountPer={productInfoData.amountPer ?? undefined}
              nutrition={productInfoData.nutrition ?? []}
              usage={productInfoData.usage ?? undefined}
            />
          ) : null}
        </View>
      </Animated.ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.mediaActions,
          {
            left: gutter,
            right: gutter,
            top: insets.top + spacing.sm,
          },
        ]}
      >
        <ProductMediaActionButton
          accessibilityLabel={t("product_info_back")}
          iconName="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <ProductMediaActionButton
          accessibilityLabel={t("product_info_share")}
          iconName="share-2"
          iconType="Feather"
          onPress={handleSharePress}
        />
      </View>

      <Footer
        isDisabled={isAddDisabled}
        isAvailable={productInfoData.inStock}
        isSubmitting={isSubmitting}
        onAddToCart={handlePrimaryAction}
        onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
        onIncrement={() => setQuantity((current) => current + 1)}
        quantity={quantity}
        totalPriceLabel={formatPrice(totalPrice)}
      />

      <ProductAddedToCartModal
        continueLabel={t("cart_add_success_continue_shopping")}
        goToCartLabel={t("cart_add_success_go_to_cart")}
        message={t("cart_add_success_message", {
          product: productInfoData.name,
          quantity,
        })}
        onContinueShopping={() => setIsAddedToCartVisible(false)}
        onGoToCart={handleViewCart}
        title={t("cart_add_success_title")}
        visible={isAddedToCartVisible}
      />

      <CartStoreConflictModal
        isSubmitting={conflictResolution.isResolving}
        onCancel={conflictResolution.cancelResolution}
        onConfirm={() => {
          void conflictResolution.confirmResolution();
        }}
        prompt={conflictResolution.prompt}
        visible={conflictResolution.isVisible}
      />

      <StoreClosedCartModal
        onClose={closeStoreClosedModal}
        storeName={cartFlowStoreName}
        visible={isStoreClosedModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  detailsSurface: {
    alignSelf: "center",
    marginTop: -28,
    overflow: "visible",
    paddingBottom: 8,
    paddingTop: 24,
    zIndex: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  headerContainer: {
    overflow: "hidden",
  },
  headerFill: {
    height: "100%",
  },
  mediaActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    zIndex: 20,
  },
});
