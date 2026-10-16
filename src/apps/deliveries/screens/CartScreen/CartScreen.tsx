import React from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '../../../../general/components/AppToast';
import { formatCartPrice } from '../../components/cart/cartUtils';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTheme } from '../../../../general/theme/theme';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import CartScreenContent from '../../components/cart/CartScreenContent';
import CartScreenErrorState from '../../components/cart/CartScreenErrorState';
import CartScreenSkeleton from '../../components/cart/CartScreenSkeleton';
import { useClearCartAction } from '../../hooks/useClearCartAction';
import { useCartMutationFeedback } from '../../hooks/useCartMutationFeedback';
import { useCart } from '../../hooks/useCart';
import {
  useRemoveCartItemMutation,
  useUpdateCartItemQuantityMutation,
  useUpdateCartItemNoteMutation,
} from '../../hooks/useCartMutations';
import { useStoreRecommendedProducts, useStoreView } from '../../hooks';

export default function CartScreen() {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();
  const sessionQuery = useAuthSessionQuery();
  const { showMutationError, showMutationSuccess } = useCartMutationFeedback();
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [isClearCartVisible, setIsClearCartVisible] = React.useState(false);
  const [isFeeModalVisible, setIsFeeModalVisible] = React.useState(false);
  const [updatingItemId, setUpdatingItemId] = React.useState<string | null>(null);
  const [pendingItemIds, setPendingItemIds] = React.useState<string[]>([]);
  const {
    data: cart,
    isPending: isCartPending,
    error: cartError,
    refetch: refetchCart,
  } = useCart();
  const { data: store } = useStoreView(cart?.storeId ?? '');
  const { data: recommendations = [] } = useStoreRecommendedProducts(cart?.storeId);
  const { clearCart, isClearing } = useClearCartAction({
    onSuccess: () => {
      setIsClearCartVisible(false);
    },
    showSuccessToast: false,
  });

  const handleMutationSettled = React.useCallback(() => {
    setUpdatingItemId(null);
  }, []);
  const handleUpdateError = React.useCallback(
    (error: Error) => {
      handleMutationSettled();
      showMutationError('update', error);
    },
    [handleMutationSettled, showMutationError],
  );
  const handleRemoveError = React.useCallback(
    (error: Error) => {
      handleMutationSettled();
      showMutationError('remove', error);
    },
    [handleMutationSettled, showMutationError],
  );

  const updateQuantityMutation = useUpdateCartItemQuantityMutation({
    onError: handleUpdateError,
  });
  const updateNoteMutation = useUpdateCartItemNoteMutation({ onError: handleUpdateError });
  const removeMutation = useRemoveCartItemMutation({
    onError: handleRemoveError,
  });
  const isCartMutating = pendingItemIds.length > 0
    || isClearing
    || updateQuantityMutation.isPending
    || updateNoteMutation.isPending
    || removeMutation.isPending;

  const handleItemPendingChange = React.useCallback(
    (itemId: string, isPending: boolean) => {
      setPendingItemIds((currentIds) => {
        const hasItem = currentIds.includes(itemId);

        if (isPending) {
          return hasItem ? currentIds : [...currentIds, itemId];
        }

        if (!hasItem) {
          return currentIds;
        }

        return currentIds.filter((currentItemId) => currentItemId !== itemId);
      });
    },
    [],
  );

  const handleSetItemQuantity = React.useCallback(
    async (itemId: string, quantity: number) => {
      setUpdatingItemId(itemId);

      try {
        await updateQuantityMutation.mutateAsync({
          itemId,
          input: { quantity },
        });
      } catch (error) {
        // Feedback is shown by the mutation hook; the row still needs to roll back its draft.
        throw error;
      } finally {
        handleMutationSettled();
      }
    },
    [handleMutationSettled, updateQuantityMutation],
  );

  const handleRemoveItem = React.useCallback(
    (itemId: string) => {
      setUpdatingItemId(itemId);
      removeMutation.mutate(itemId, {
        onSuccess: () => {
          showMutationSuccess('remove');
        },
        onSettled: handleMutationSettled,
      });
    },
    [handleMutationSettled, removeMutation, showMutationSuccess],
  );
  const handleSetItemNote = React.useCallback(async (itemId: string, note: string) => {
    setUpdatingItemId(itemId);
    try {
      await updateNoteMutation.mutateAsync({ itemId, itemNote: note.trim() || null });
    } finally {
      handleMutationSettled();
    }
  }, [handleMutationSettled, updateNoteMutation]);
  const handleCheckoutPress = React.useCallback(() => {
    if (!cart || !store || isCartMutating) return;
    const remaining = Number(store.minimumOrder ?? 0) - cart.finalPrice;
    if (remaining > 0) {
      showToast.error(t('cart_minimum_remaining', { amount: formatCartPrice(remaining) }));
      return;
    }
    navigation.navigate('Checkout');
  }, [cart, isCartMutating, navigation, store, t]);

  const handleOpenClearCart = React.useCallback(() => {
    setIsClearCartVisible(true);
  }, []);

  const handleCloseClearCart = React.useCallback(() => {
    if (isClearing) {
      return;
    }

    setIsClearCartVisible(false);
  }, [isClearing]);

  const handleConfirmClearCart = React.useCallback(() => {
    void clearCart();
  }, [clearCart]);

  if (sessionQuery.isPending || (sessionQuery.data?.token && isCartPending && !cart)) {
    return (
      <View style={{ backgroundColor: colors.surface, flex: 1 }}>
        <CartScreenSkeleton />
      </View>
    );
  }

  if (sessionQuery.data?.token && (!cart || cartError)) {
    return (
      <View style={{ backgroundColor: colors.surface, flex: 1 }}>
        <CartScreenErrorState
          onRetry={() => {
            void refetchCart();
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.surface, flex: 1 }}>
      <CartScreenContent
        cart={sessionQuery.data?.token ? cart ?? null : null}
        isClearCartVisible={isClearCartVisible}
        isClearingCart={isClearing}
        isFeeModalVisible={isFeeModalVisible}
        isMutatingCart={isCartMutating}
        isUpdatingItemId={updatingItemId}
        navigation={navigation}
        onCloseClearCart={handleCloseClearCart}
        onCloseFeeModal={() => setIsFeeModalVisible(false)}
        onConfirmClearCart={handleConfirmClearCart}
        onCheckoutPress={handleCheckoutPress}
        onItemPendingChange={handleItemPendingChange}
        onOpenClearCart={handleOpenClearCart}
        onOpenFeeModal={() => setIsFeeModalVisible(true)}
        onRemoveItem={handleRemoveItem}
        onSetItemQuantity={handleSetItemQuantity}
        onSetItemNote={handleSetItemNote}
        recommendations={recommendations}
        store={store}
      />
    </View>
  );
}
