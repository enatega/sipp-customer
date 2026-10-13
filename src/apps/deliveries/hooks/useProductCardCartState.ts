import React from 'react';
import { useCartDomain } from './useCartDomain';
import type { DeliveryProductActionBinding } from '../cart/productActionTypes';

type Params = {
  productAction?: DeliveryProductActionBinding;
  isUnavailable?: boolean;
  isLoading?: boolean;
};

export function useProductCardCartState({ productAction, isUnavailable = false, isLoading = false }: Params) {
  const { getProductQuantity, getQuantity } = useCartDomain();
  const target = productAction?.target;
  const exactQuantity = target ? getQuantity(target) : 0;
  const totalQuantity = target ? getProductQuantity(target.productId) : 0;
  const canUseInlineQuantity = Boolean(productAction?.onRequestCartAction && exactQuantity > 0);
  const isDisabled = isUnavailable || isLoading || (!productAction?.onRequestCartAction && !productAction?.onQuickAdd && !productAction?.onOpenProduct);

  const handlePrimaryCartAction = React.useCallback(() => {
    if (!target || isUnavailable) {
      return;
    }

    if (productAction?.onQuickAdd) {
      productAction.onQuickAdd(target);
      return;
    }

    if (productAction?.onRequestCartAction) {
      productAction.onRequestCartAction(target);
      return;
    }

    productAction?.onOpenProduct?.(target);
  }, [isUnavailable, productAction, target]);

  return {
    canUseInlineQuantity,
    controlCount: exactQuantity,
    controlMode: canUseInlineQuantity ? 'quantity' as const : 'add' as const,
    exactQuantity,
    handleAdd: handlePrimaryCartAction,
    handleDecrement: canUseInlineQuantity ? handlePrimaryCartAction : undefined,
    handleIncrement: canUseInlineQuantity ? handlePrimaryCartAction : undefined,
    isDisabled,
    isLoading,
    shouldShowCountBadge: totalQuantity > 0 && !canUseInlineQuantity,
    totalQuantity,
  };
}
