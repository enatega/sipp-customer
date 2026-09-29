import React, { useCallback } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../../../general/theme/theme";
import { useDeliveriesCurrencyLabel } from "../../../../general/stores/useAppConfigStore";
import type {
  DeliveryNearbyStore,
  DeliveryShopTypeProduct,
} from "../../api/types";
import type { SearchStoreItem } from "../../api/searchServiceTypes";
import type { DeliveriesStoreDetailsParamList } from "../../navigation/sharedTypes";
import { styles } from "./styles";
import StoreImage from "./subComponents/StoreImage";
import StoreInfo from "./subComponents/StoreInfo";
import StoreRating from "./subComponents/StoreRating";
import StoreDeliveryInfo from "./subComponents/StoreDeliveryInfo";
import { useTranslations } from "../../../../general/localization/LocalizationProvider";
import PressableScale from "../../../../general/components/PressableScale";
import { pushStoreDetails } from "../../navigation/storeDetailsNavigation";
import { translateShopTypeName } from "../../utils/shopTypeLocalization";
import { getLocalizedProductName } from "../../utils/productTranslation";

type StoreCardData =
  | DeliveryNearbyStore
  | SearchStoreItem
  | DeliveryShopTypeProduct;

export interface StoreCardProps {
  store: StoreCardData;
  actionSlot?: React.ReactNode;
  layout?: "compact" | "fullWidth" | "resultRow" | "home";
  onPress?: () => void;
  showClosedOverlay?: boolean;
  onClosedPress?: () => void;
}

type NavigationProp = NativeStackNavigationProp<DeliveriesStoreDetailsParamList>;

function isProductStoreCardData(
  store: StoreCardData,
): store is DeliveryShopTypeProduct {
  return "productId" in store && "productName" in store;
}

function isStoreClosed(
  store: Exclude<StoreCardData, DeliveryShopTypeProduct>,
) {
  return store.isAvailable === false || ("isClosed" in store && store.isClosed === true);
}

function resolveOfferLabel(
  dealAmount: number | null | undefined,
  dealType: string | null | undefined,
  deal: string | null | undefined,
  currencyLabel: string,
  offLabel: string,
) {
  const hasValidAmount =
    typeof dealAmount === "number" && Number.isFinite(dealAmount) && dealAmount > 0;
  const normalizedDealType = dealType?.trim().toLowerCase();

  if (hasValidAmount) {
    if (normalizedDealType === "percentage") {
      return `${dealAmount}% ${offLabel}`;
    }

    return `${currencyLabel} ${dealAmount} ${offLabel}`;
  }

  const trimmedDeal = typeof deal === "string" ? deal.trim() : "";
  return trimmedDeal.length > 0 ? trimmedDeal : undefined;
}

export default function StoreCard({
  store,
  actionSlot,
  layout = "compact",
  onPress,
  showClosedOverlay = false,
  onClosedPress,
}: StoreCardProps) {
  const { colors, elevation, shape, spacing } = useTheme();
  const { t, i18n } = useTranslations("deliveries");
  const currencyLabel = useDeliveriesCurrencyLabel();
  const navigation = useNavigation<NavigationProp>();
  const isProductItem = isProductStoreCardData(store);
  const isResultRow = layout === "resultRow";
  const isCompact = layout === "compact";
  const isHome = layout === "home";
  const isPressable = Boolean(onPress) || !isProductItem;
  const hasStoreCoverImage =
    !isProductItem && Boolean(store.coverImage?.trim());
  const resolvedImageUrl = isProductItem
    ? store.productImage ||
      store.storeImage ||
      store.storeLogo ||
      "https://placehold.co/400x400.png"
    : store.coverImage || store.logo || "https://placehold.co/400x400.png";
  const resolvedOffer = resolveOfferLabel(
    store.dealAmount,
    store.dealType,
    store.deal,
    currencyLabel,
    t("off"),
  );
  const resolvedName = isProductItem
    ? getLocalizedProductName(
        {
          name: store.productName,
          nameTranslations: store.productNameTranslations,
        },
        i18n.language,
      )
    : store.name;
  const resolvedRating = store.averageRating ?? undefined;
  const resolvedReviewCount = store.reviewCount ?? undefined;
  const resolvedCuisine = isProductItem
    ? store.storeName ?? undefined
    : store.shopTypeName
      ? translateShopTypeName(store.shopTypeName, t)
      : store.address ?? undefined;
  const resolvedPrice = isProductItem ? store.price : store.baseFee;
  const resolvedDeliveryTime = store.deliveryTime;
  const resolvedDistance = store.distanceKm;
  const isClosedStore =
    !isProductItem && showClosedOverlay && isStoreClosed(store);

  const handlePress = useCallback(() => {
    if (isClosedStore) {
      onClosedPress?.();
      return;
    }

    if (onPress) {
      onPress();
      return;
    }

    if (isProductStoreCardData(store)) {
      return;
    }

    pushStoreDetails(navigation, store);
  }, [isClosedStore, navigation, onClosedPress, onPress, store]);

  return (
    <PressableScale
      accessibilityLabel={resolvedName}
      accessibilityRole={isPressable ? "button" : undefined}
      disabled={!isPressable}
      style={[
        styles.container,
        isHome
          ? styles.homeContainer
          : layout === "fullWidth"
          ? styles.fullWidthContainer
          : isResultRow
            ? styles.resultRowContainer
            : styles.compactContainer,
        {
          backgroundColor: colors.surface,
          borderRadius: shape.radius.surface,
          ...(isHome ? elevation.subtle : elevation.raised),
        },
      ]}
      onPress={handlePress}
    >
      <StoreImage
        actionSlot={actionSlot}
        closedLabel={t("store_status_closed")}
        imageUrl={resolvedImageUrl}
        isClosed={isClosedStore}
        layout={layout}
        offer={resolvedOffer}
        openLabel={isHome && !isProductItem && store.isAvailable === true ? t("store_status_open") : undefined}
        resizeMode={isProductItem || hasStoreCoverImage ? "cover" : "contain"}
      />

      <View
        style={[
          styles.content,
          {
            flex: isResultRow ? 1 : undefined,
            gap: isHome ? spacing.xs : isCompact ? spacing.xs : spacing.sm,
            justifyContent: isResultRow ? 'center' : undefined,
            minHeight: isHome ? 0 : undefined,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.md,
            paddingTop: isHome ? spacing.sm : isCompact ? spacing.sm + 2 : spacing.md,
          },
        ]}
      >
        <StoreInfo name={resolvedName} dense={isHome} />
        <StoreRating
          rating={resolvedRating}
          reviewCount={isHome ? undefined : resolvedReviewCount}
          cuisine={resolvedCuisine}
          fallbackLabel={!isProductItem ? t("store_card_new") : undefined}
          stacked={isHome}
        />
        {!isHome ? (
          <View
            style={[
              styles.line,
              {
                backgroundColor: colors.divider,
                marginVertical: isCompact ? spacing.xxs : spacing.xs,
              },
            ]}
          />
        ) : null}
        <StoreDeliveryInfo
          price={resolvedPrice}
          deliveryTime={resolvedDeliveryTime}
          distance={resolvedDistance}
          showDistance={!isHome}
          dense={isHome}
          fallbackLabels={
            !isProductItem && !isHome
              ? {
                  price: t("store_card_delivery_fee_unavailable", {
                    currency: currencyLabel,
                  }),
                  deliveryTime: t("store_card_delivery_time_unavailable"),
                  distance: t("store_card_distance_unavailable"),
                }
              : undefined
          }
        />
      </View>
    </PressableScale>
  );
}
