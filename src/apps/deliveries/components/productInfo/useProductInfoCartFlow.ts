import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '../../../../general/components/AppToast';
import type { CartSelectionInput } from '../../api/cartServiceTypes';
import type {
  ProductInfoCustomizationsResponse,
  ProductInfoResponse,
} from '../../api/productInfoServiceTypes';
import {
  getCartActionBlockedFeedback,
  isStoreClosedError,
} from '../../cart/cartFeedback';
import { mapProductInfoToProductActionTarget } from '../../cart/productActionMappers';
import { useCartActionEligibility } from '../../hooks/useCartActionEligibility';
import { useCartMutationFeedback } from '../../hooks/useCartMutationFeedback';
import { useAddCartItemMutation } from '../../hooks/useCartMutations';
import { useCartStoreConflictResolution } from '../../hooks/useCartStoreConflictResolution';
import { requireDeliveriesAuthentication } from '../../navigation/deliveriesAuthGate';

type Props = {
  customizations?: ProductInfoCustomizationsResponse;
  hasCustomizationContext: boolean;
  product: ProductInfoResponse;
  quantity: number;
  onAddedToCart: () => void;
  selectedOptions: CartSelectionInput[];
};

export default function useProductInfoCartFlow({
  customizations,
  hasCustomizationContext,
  product,
  quantity,
  onAddedToCart,
  selectedOptions,
}: Props) {
  const { t } = useTranslation('deliveries');
  const { showMutationError } = useCartMutationFeedback();
  const addCartItemMutation = useAddCartItemMutation();
  const storeConflictResolution = useCartStoreConflictResolution();
  const [isStoreClosedModalVisible, setIsStoreClosedModalVisible] = useState(false);
  const productActionTarget = useMemo(
    () => mapProductInfoToProductActionTarget(product),
    [product],
  );
  const { decision } = useCartActionEligibility({
    customizations,
    hasCustomizationContext,
    product: productActionTarget,
    quantity,
    selectedOptions,
  });
  const isSubmitting =
    addCartItemMutation.isPending || storeConflictResolution.isResolving;
  const isAddDisabled =
    isSubmitting ||
    !product.inStock ||
    decision.kind === 'await_customization_context';

  const submitAddToCart = useCallback(async () => {
    await addCartItemMutation.mutateAsync({
      productId: product.productId,
      quantity,
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
    });

    onAddedToCart();
  }, [
    addCartItemMutation,
    product.productId,
    quantity,
    onAddedToCart,
    selectedOptions,
  ]);

  const handleAddToCart = useCallback(async () => {
    const isAuthenticated = await requireDeliveriesAuthentication({
      screen: 'ProductInfo',
      params: { productId: product.productId },
    });

    if (!isAuthenticated) {
      return;
    }

    const shouldShowBlockedFeedback =
      isAddDisabled || decision.kind === 'open_product_info';

    if (shouldShowBlockedFeedback) {
      const feedback = getCartActionBlockedFeedback(t, decision.kind);

      if (feedback) {
        showToast.info(feedback.title, feedback.message);
      }

      return;
    }

    if (decision.kind === 'blocked_by_store_conflict') {
      const shouldReplaceCart = await storeConflictResolution.requestResolution({
        incomingStoreName: productActionTarget.storeName,
        productName: product.name,
      });

      if (!shouldReplaceCart) {
        return;
      }
    }

    try {
      await submitAddToCart();
    } catch (error) {
      if (isStoreClosedError(error)) {
        setIsStoreClosedModalVisible(true);
        return;
      }

      showMutationError('add', error);
    }
  }, [
    decision.kind,
    isAddDisabled,
    product.name,
    product.productId,
    productActionTarget.storeName,
    showMutationError,
    storeConflictResolution,
    submitAddToCart,
    t,
  ]);

  const closeStoreClosedModal = useCallback(() => {
    setIsStoreClosedModalVisible(false);
  }, []);

  return {
    closeStoreClosedModal,
    conflictResolution: storeConflictResolution,
    handleAddToCart,
    isAddDisabled,
    isStoreClosedModalVisible,
    isSubmitting,
    storeName: productActionTarget.storeName,
  };
}
