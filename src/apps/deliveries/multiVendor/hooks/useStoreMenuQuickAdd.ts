import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { showToast } from '../../../../general/components/AppToast';
import { deliveryKeys } from '../../api/queryKeys';
import { cartService } from '../../api/cartService';
import { productInfoService } from '../../api/productInfoService';
import { hasCartStoreConflict } from '../../cart/cartLineMatching';
import type { DeliveryProductActionTarget } from '../../cart/productActionTypes';
import { isStoreClosedError } from '../../cart/cartFeedback';
import { useAddCartItemMutation } from '../../hooks/useCartMutations';
import { useCartMutationFeedback } from '../../hooks/useCartMutationFeedback';
import { useCartStoreConflictResolution } from '../../hooks/useCartStoreConflictResolution';
import { requireDeliveriesAuthentication } from '../../navigation/deliveriesAuthGate';
import { getStoreMenuQuickAddSelection } from '../utils/storeMenuQuickAdd';

export function useStoreMenuQuickAdd(onOpenProduct: (target: DeliveryProductActionTarget) => void) {
  const { t } = useTranslation('deliveries');
  const queryClient = useQueryClient();
  const { mutateAsync: addCartItem } = useAddCartItemMutation();
  const { showMutationError } = useCartMutationFeedback();
  const conflictResolution = useCartStoreConflictResolution();
  const { requestResolution } = conflictResolution;
  const [closedStoreName, setClosedStoreName] = useState<string | null>(null);
  const isRequesting = useRef(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const request = useCallback(async (target: DeliveryProductActionTarget) => {
    if (isRequesting.current) return;
    isRequesting.current = true;
    setPendingProductId(target.productId);
    try {
      const customizations = await queryClient.fetchQuery({
        queryKey: deliveryKeys.productInfoCustomizations(target.productId),
        queryFn: () => productInfoService.getProductInfoCustomizations(target.productId),
        staleTime: 60_000,
      });
      const selectedOptions = getStoreMenuQuickAddSelection(customizations);
      if (!selectedOptions) {
        onOpenProduct(target);
        return;
      }

      if (!await requireDeliveriesAuthentication({
        screen: 'ProductInfo', params: { productId: target.productId },
      })) return;

      const cart = await queryClient.fetchQuery({
        queryKey: deliveryKeys.cart(),
        queryFn: cartService.getCart,
        staleTime: 30_000,
      });
      if (hasCartStoreConflict(cart.storeId, target.storeId)) {
        const shouldReplace = await requestResolution({
          incomingStoreName: target.storeName,
          productName: target.name,
        });
        if (!shouldReplace) return;
      }

      await addCartItem({
        productId: target.productId,
        quantity: 1,
        selectedOptions: selectedOptions.length ? selectedOptions : undefined,
      });
      showToast.success(
        t('cart_add_success_title'),
        t('cart_add_success_message', { product: target.name, quantity: 1 }),
      );
    } catch (error) {
      if (isStoreClosedError(error)) setClosedStoreName(target.storeName ?? target.name);
      else showMutationError('add', error);
    } finally {
      isRequesting.current = false;
      setPendingProductId(null);
    }
  }, [addCartItem, onOpenProduct, queryClient, requestResolution, showMutationError, t]);

  return {
    closeStoreClosedModal: () => setClosedStoreName(null),
    closedStoreName,
    conflictResolution,
    pendingProductId,
    request,
  };
}
