import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DeliveryOrderAgainItem, DeliveryStoreViewApiResponse } from '../../api/types';
import type { CartResponse } from '../../api/cartServiceTypes';
import { useCheckoutCouponStore } from '../../stores/useCheckoutCouponStore';
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
  cart: CartResponse;
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
  recommendations,
  store,
}: Props) {
  const { colors, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const insets = useSafeAreaInsets();
  const selectedCoupon = useCheckoutCouponStore((state) => state.selectedCoupon);

  const handleBack = React.useCallback(() => navigation.goBack(), [navigation]);

  const handleStartShopping = React.useCallback(() => {
    if (!cart.storeId) {
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
          storeId: cart.storeId,
          vendorId: '',
          name: store?.name ?? '',
        },
      },
    });
  }, [cart.storeId, navigation, store?.name]);

  const handleRecommendationPress = React.useCallback(
    (productId: string) => navigation.navigate('ProductInfo', { productId }),
    [navigation],
  );

  const handlePromoPress = React.useCallback(() => {
    navigation.navigate('Coupons');
  }, [navigation]);

  if (cart.isEmpty) {
    return (
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        <LinearGradient
          colors={[colors.primarySoft, colors.canvas, colors.canvas]}
          locations={[0, 0.38, 1]}
          pointerEvents="none"
          style={StyleSheet.absoluteFillObject}
        />
        <CartHeader onBackPress={handleBack} />
        <CartEmptyState onStartShoppingPress={handleStartShopping} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <LinearGradient
        colors={[colors.primarySoft, colors.canvas, colors.canvas]}
        locations={[0, 0.28, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

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
            paddingBottom: insets.bottom + 132,
            paddingHorizontal: gutter,
            paddingTop: spacing.sm,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CartMerchantSummary
          fallbackName={recommendations[0]?.storeName}
          onPress={handleStartShopping}
          store={store}
        />

        <CartStatusBanner
          minimumOrder={store?.minimumOrder}
          onInfoPress={onOpenFeeModal}
          totalPrice={cart.totalPrice}
        />

        <CartItemsSection
          isUpdatingItemId={isUpdatingItemId}
          items={cart.items}
          onAddMorePress={handleStartShopping}
          onItemPendingChange={onItemPendingChange}
          onRemoveItem={onRemoveItem}
          onSetItemQuantity={onSetItemQuantity}
        />

        <CartOrderSummary
          discountAmount={cart.discountAmount}
          finalPrice={cart.finalPrice}
          onFeeInfoPress={onOpenFeeModal}
          onPromoPress={handlePromoPress}
          promoCode={selectedCoupon?.code}
          subtotal={cart.totalPrice}
        />

        <CartRecommendationsSection
          items={recommendations}
          onItemPress={handleRecommendationPress}
        />
      </ScrollView>

      <CartFooter
        amountLabel={formatCartPrice(cart.finalPrice)}
        disabled={cart.isEmpty || isMutatingCart}
        itemCount={cart.totalItems}
        onCheckoutPress={onCheckoutPress}
      />

      <CartFeeInfoModal
        currentSubtotal={cart.totalPrice}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
  },
});
