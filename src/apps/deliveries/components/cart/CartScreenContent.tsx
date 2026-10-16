import React from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { DeliveryOrderAgainItem, DeliveryStoreViewApiResponse } from '../../api/types';
import type { CartResponse } from '../../api/cartServiceTypes';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';
import CartClearPopup from './CartClearPopup';
import CartEmptyState from './CartEmptyState';
import CartFeeInfoModal from './CartFeeInfoModal';
import CartFooter from './CartFooter';
import CartHeader from './CartHeader';
import CartItemsSection from './CartItemsSection';
import CartMerchantSummary from './CartMerchantSummary';
import CartOrderSummary from './CartOrderSummary';
import CartRecommendationsSection from './CartRecommendationsSection';
import CartStatusBanner from './CartStatusBanner';
import { formatCartPrice } from './cartUtils';

type Props = {
  cart: CartResponse | null;
  isClearCartVisible: boolean;
  isClearingCart?: boolean;
  isFeeModalVisible: boolean;
  isMutatingCart?: boolean;
  isUpdatingItemId?: string | null;
  navigation: NavigationProp<Record<string, object | undefined>>;
  onCloseClearCart: () => void;
  onCloseFeeModal: () => void;
  onCheckoutPress: () => void;
  onConfirmClearCart: () => void;
  onItemPendingChange?: (itemId: string, isPending: boolean) => void;
  onOpenClearCart: () => void;
  onOpenFeeModal: () => void;
  onRemoveItem: (itemId: string) => void;
  onSetItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  onSetItemNote: (itemId: string, note: string) => Promise<void>;
  recommendations: DeliveryOrderAgainItem[];
  store?: DeliveryStoreViewApiResponse;
};

export default function CartScreenContent({
  cart,
  isClearCartVisible,
  isClearingCart = false,
  isFeeModalVisible,
  isMutatingCart = false,
  isUpdatingItemId,
  navigation,
  onCloseClearCart,
  onCloseFeeModal,
  onCheckoutPress,
  onConfirmClearCart,
  onItemPendingChange,
  onOpenClearCart,
  onOpenFeeModal,
  onRemoveItem,
  onSetItemQuantity,
  onSetItemNote,
  recommendations,
  store,
}: Props) {
  const { colors, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const [footerHeight, setFooterHeight] = React.useState(96);

  const handleBack = React.useCallback(() => navigation.goBack(), [navigation]);

  const handleStartShopping = React.useCallback(() => {
    const storeId = cart?.storeId;
    if (!storeId) {
      navigation.navigate('MultiVendor', {
        screen: 'MultiVendorTabs',
        params: { screen: 'MultiVendorTabHome' },
      });
      return;
    }

    navigation.navigate('MultiVendor', {
      screen: 'StoreDetails',
      params: {
        store: {
          storeId,
          vendorId: '',
          name: store?.name ?? '',
        },
      },
    });
  }, [cart?.storeId, navigation, store?.name]);

  const handleRecommendationPress = React.useCallback(
    (productId: string) => navigation.navigate('ProductInfo', { productId }),
    [navigation],
  );

  const handleFooterLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    setFooterHeight((height) => height === nextHeight ? height : nextHeight);
  }, []);

  if (!cart || cart.isEmpty) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <CartHeader onBackPress={handleBack} />
        <CartEmptyState onStartShoppingPress={handleStartShopping} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>

      <CartHeader
        clearDisabled={isMutatingCart}
        itemCount={cart.totalItems}
        onBackPress={handleBack}
        onClearPress={onOpenClearCart}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            gap: spacing.section.default,
            maxWidth: layout.contentMaxWidth.readable,
            paddingBottom: footerHeight + spacing.lg,
            paddingHorizontal: gutter,
            paddingTop: spacing.sm,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.cartContext,
            {
              borderBottomColor: colors.divider,
              paddingBottom: spacing.sm,
            },
          ]}
        >
          <CartMerchantSummary
            fallbackName={recommendations[0]?.storeName}
            onPress={handleStartShopping}
            store={store}
          />
          <CartStatusBanner
            minimumOrder={store?.minimumOrder}
            onInfoPress={onOpenFeeModal}
            totalPrice={cart.finalPrice}
          />
        </View>

        <CartItemsSection
          isUpdatingItemId={isUpdatingItemId}
          items={cart.items}
          onAddMorePress={handleStartShopping}
          onItemPendingChange={onItemPendingChange}
          onRemoveItem={onRemoveItem}
          onSetItemQuantity={onSetItemQuantity}
          onSetItemNote={onSetItemNote}
        />

        <CartOrderSummary
          discountAmount={cart.discountAmount}
          finalPrice={cart.finalPrice}
          onFeeInfoPress={onOpenFeeModal}
          subtotal={cart.totalPrice}
        />

        <CartRecommendationsSection
          items={recommendations}
          onItemPress={handleRecommendationPress}
        />
      </ScrollView>

      <CartFooter
        amountLabel={formatCartPrice(cart.finalPrice)}
        disabled={cart.isEmpty || isMutatingCart || !store || cart.finalPrice < Number(store.minimumOrder ?? 0)}
        onLayout={handleFooterLayout}
        onCheckoutPress={onCheckoutPress}
      />

      <CartFeeInfoModal
        currentSubtotal={cart.finalPrice}
        deliveryFee={store?.baseFee}
        minimumOrder={store?.minimumOrder}
        onClose={onCloseFeeModal}
        visible={isFeeModalVisible}
      />

      <CartClearPopup
        isSubmitting={isClearingCart}
        onCancel={onCloseClearCart}
        onConfirm={onConfirmClearCart}
        visible={isClearCartVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cartContext: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
  },
});
