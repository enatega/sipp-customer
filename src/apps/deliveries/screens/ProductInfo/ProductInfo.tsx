import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import MainContainer from "../../components/productInfo/MainContainer";
import ProductInfoErrorState from "../../components/productInfo/ProductInfoErrorState";
import ProductInfoLoadingSkeleton from "../../components/productInfo/ProductInfoLoadingSkeleton";
import {
  useProductInfo,
  useProductInfoCustomizations,
} from "../../hooks/useProductInfo";
import { getLocalizedProductName } from "../../utils/productTranslation";

type ProductInfoProps = {
  route?: {
    params?: {
      productId?: string;
    };
  };
};

const ProductInfo = ({ route }: ProductInfoProps) => {
  const { i18n } = useTranslation();
  const productId = route?.params?.productId ?? "";
  const {
    data: productInfo,
    error: productInfoError,
    isLoading: isProductInfoLoading,
    isFetching: isProductInfoFetching,
    refetch: refetchProductInfo,
  } = useProductInfo(productId);
  const {
    data: customizations,
    isLoading: isCustomizationsLoading,
    isFetching: isCustomizationsFetching,
    refetch: refetchCustomizations,
  } = useProductInfoCustomizations(productId, {
    enabled: Boolean(productInfo?.productId),
  });
  const handleRefresh = useCallback(async () => {
    const productInfoResult = await refetchProductInfo();
    const latestProductId =
      productInfoResult.data?.productId ?? productInfo?.productId;

    if (latestProductId) {
      await refetchCustomizations();
    }
  }, [productInfo?.productId, refetchCustomizations, refetchProductInfo]);
  const isRefreshing = isProductInfoFetching || isCustomizationsFetching;
  const localizedProductInfo = useMemo(
    () =>
      productInfo
        ? {
            ...productInfo,
            name: getLocalizedProductName(productInfo, i18n.language),
          }
        : undefined,
    [i18n.language, productInfo],
  );

  if (isProductInfoLoading && !productInfo) {
    return <ProductInfoLoadingSkeleton />;
  }

  if (!localizedProductInfo) {
    return (
      <ProductInfoErrorState
        isRetrying={isRefreshing}
        onRetry={() => {
          void handleRefresh();
        }}
      />
    );
  }

  return (
    <MainContainer
      customizations={customizations}
      data={localizedProductInfo}
      isCustomizationsLoading={isCustomizationsLoading}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  );
};

export default ProductInfo;
