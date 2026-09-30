import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DeliveryProductActionTarget } from '../../cart/productActionTypes';
import { useProductCardCartState } from '../../hooks/useProductCardCartState';
import type { SearchProductItem } from '../../api/searchServiceTypes';
import type {
  DeliveryOrderAgainItem,
  DeliveryShopTypeProduct,
  DeliveryStoreDetailsProduct,
} from '../../api/types';
import type { DeliveriesStackParamList } from '../../navigation/types';

import MiniProductCard from './MiniProductCard';
import OrderAgainProductCard from './OrderAgainProductCard';
import RailProductCard from './RailProductCard';
import StoreMenuProductCard from './StoreMenuProductCard';
import type {
  ProductCardActionOverrides,
  ProductCardData,
  ProductCardVariant,
} from './types';
import { isStoreDetailsProduct } from './types';
import { getLocalizedProductName } from '../../utils/productTranslation';

type Props = {
  product: ProductCardData;
  variant?: ProductCardVariant;
  storeId?: string | null;
  isFullWidth?: boolean;
  onPress?: () => void;
  productAction?: ProductCardActionOverrides;
};

type NavigationProp = NativeStackNavigationProp<DeliveriesStackParamList>;

function buildTarget(
  product: ProductCardData,
  variant: ProductCardVariant,
  storeId?: string | null,
): DeliveryProductActionTarget {
  if (isStoreDetailsProduct(product)) {
    return {
      source: 'storeDetailsProduct',
      productId: product.id,
      storeId: storeId ?? null,
      name: product.name,
      description: product.description ?? product.shortDescription ?? null,
      imageUrl: product.imageUrl ?? null,
      basePrice: product.price ?? null,
      storeName: null,
    };
  }

  return {
    source:
      variant === 'orderAgain'
        ? 'orderAgain'
        : variant === 'mini'
          ? 'productMiniCard'
          : 'shopTypeProduct',
    productId: product.productId,
    storeId: product.storeId ?? null,
    name: product.productName,
    description: null,
    imageUrl:
      product.productImage ??
      ('storeImage' in product ? product.storeImage ?? null : null) ??
      ('storeLogo' in product ? product.storeLogo ?? null : null),
    basePrice: product.price ?? null,
    storeName: 'storeName' in product ? product.storeName ?? null : null,
  };
}

function ProductCard({
  product,
  variant = 'rail',
  storeId,
  isFullWidth = false,
  onPress,
  productAction,
}: Props) {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const localizedProduct = React.useMemo<ProductCardData>(() => {
    if (isStoreDetailsProduct(product)) {
      return {
        ...product,
        name: getLocalizedProductName(product, i18n.language),
      };
    }

    return {
      ...product,
      productName: getLocalizedProductName(
        {
          name: product.productName,
          nameTranslations: product.productNameTranslations,
        },
        i18n.language,
      ),
    };
  }, [i18n.language, product]);
  const target = React.useMemo(
    () => buildTarget(localizedProduct, variant, storeId),
    [localizedProduct, storeId, variant],
  );
  const resolvedProductAction = React.useMemo(
    () => ({
      target,
      onOpenProduct:
        productAction?.onOpenProduct ??
        ((nextTarget: DeliveryProductActionTarget) => {
          navigation.navigate('ProductInfo', { productId: nextTarget.productId });
        }),
      onRequestCartAction: productAction?.onRequestCartAction,
    }),
    [navigation, productAction?.onOpenProduct, productAction?.onRequestCartAction, target],
  );
  const state = useProductCardCartState({ productAction: resolvedProductAction });

  const handleCardPress = React.useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }

    resolvedProductAction.onOpenProduct?.(resolvedProductAction.target);
  }, [onPress, resolvedProductAction]);

  if (variant === 'mini') {
    return (
      <MiniProductCard
        onPress={handleCardPress}
        product={localizedProduct as SearchProductItem | DeliveryShopTypeProduct}
        state={state}
      />
    );
  }

  if (variant === 'orderAgain') {
    return (
      <OrderAgainProductCard
        onPress={handleCardPress}
        product={localizedProduct as DeliveryOrderAgainItem}
        state={state}
      />
    );
  }

  if (variant === 'storeMenu') {
    return (
      <StoreMenuProductCard
        onPress={handleCardPress}
        product={localizedProduct as DeliveryStoreDetailsProduct}
        state={state}
      />
    );
  }

  return (
    <RailProductCard
      isFullWidth={isFullWidth}
      onPress={handleCardPress}
      product={localizedProduct as DeliveryShopTypeProduct}
      state={state}
    />
  );
}

export default React.memo(ProductCard);
