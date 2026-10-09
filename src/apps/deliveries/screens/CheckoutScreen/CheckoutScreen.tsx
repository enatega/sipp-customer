import React from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../../../../general/components/AppToast';
import FeedbackModal from '../../../../general/components/FeedbackModal';
import { useTheme } from '../../../../general/theme/theme';
import AddressSelectionBottomSheet from '../../../../general/components/address/AddressSelectionBottomSheet';
import useSavedAddresses from '../../../../general/hooks/useSavedAddresses';
import type {
  CheckoutOrderType,
  CheckoutPaymentMethod,
} from '../../api/orderServiceTypes';
import type { CartResponse } from '../../api/cartServiceTypes';
import CheckoutScreenContent from '../../components/checkout/CheckoutScreenContent';
import CartScreenErrorState from '../../components/cart/CartScreenErrorState';
import CartScreenSkeleton from '../../components/cart/CartScreenSkeleton';
import useAddress from '../../../../general/hooks/useAddress';
import useCurrentLocation from '../../../../general/hooks/useCurrentLocation';
import useSelectSavedAddress from '../../../../general/hooks/useSelectSavedAddress';
import { useCart } from '../../hooks/useCart';
import { useCheckoutPreview } from '../../hooks/useCheckoutPreview';
import { useUseCouponMutation } from '../../hooks/useUseCouponMutation';
import { claimedCouponsKeys } from '../../hooks/useClaimedCouponsQuery';
import { formatCartPrice } from '../../components/cart/cartUtils';
import {
  createSelectedDeliveryAddress,
  formatDeliveryAddressLabel,
  resolveSavedAddressId,
} from '../../../../general/utils/address';
import { usePlaceOrder } from '../../hooks/usePlaceOrder';
import { orderService } from '../../api/orderService';
import CheckoutMessageEditorScreen from '../../components/checkout/CheckoutMessageEditorScreen';
import CheckoutCustomTipScreen from '../../components/checkout/CheckoutCustomTipScreen';
import {
  buildCustomerNote,
  clampCheckoutMessageLength,
  type CheckoutMessages,
  type CheckoutMessageTarget,
} from '../../components/checkout/checkoutMessageUtils';
import CheckoutPaymentMethodBottomSheet from '../../components/checkout/CheckoutPaymentMethodBottomSheet';
import {
  getCheckoutPaymentMethodSubtitle,
  getCheckoutPaymentMethodTitle,
  getPreferredCheckoutPaymentMethod,
  isCheckoutPaymentMethodAvailable,
} from '../../components/checkout/checkoutPaymentUtils';
import StripePaymentWebView from '../../../../general/components/StripePaymentWebView';
import {
  CHECKOUT_STRIPE_CANCEL_URL,
  CHECKOUT_STRIPE_CANCEL_MATCHER,
  CHECKOUT_STRIPE_SUCCESS_URL,
  CHECKOUT_STRIPE_SUCCESS_MATCHER,
  waitForStripeCheckoutOrderId,
} from '../../components/checkout/checkoutStripeOrderUtils';
import { deliveryKeys } from '../../api/queryKeys';
import { useCheckoutCouponStore } from '../../stores/useCheckoutCouponStore';
import {
  useWalletSavedCardsQuery,
  useWalletSetDefaultCardMutation,
} from '../../../../general/api/walletSavedCardsService';
import { useCustomerWalletBalance } from '../../api/walletService';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { profileService } from '../../../../general/api/profileService';
import Text from '../../../../general/components/Text';
import Button from '../../../../general/components/Button';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import CheckoutPhoneVerification from '../../components/checkout/CheckoutPhoneVerification';

const DELIVERY_ROOT_ROUTES = ['SingleVendor', 'MultiVendor', 'Chain'] as const;

function isStoreClosedError(error?: { status?: number; message?: string } | null) {
  return (
    error?.status === 400 &&
    error.message?.trim().toLowerCase() === 'store is currently closed'
  );
}

function isAddressOutsideDeliveryAreaError(
  error?: { status?: number; message?: string } | null,
) {
  return (
    error?.status === 400 &&
    error.message?.trim().toLowerCase() === 'delivery address is outside the store delivery area'
  );
}

function isInsufficientWalletBalanceError(
  error?: { status?: number; message?: string } | null,
) {
  return (
    error?.status === 400 &&
    error.message?.trim().toLowerCase() === 'insufficient wallet balance'
  );
}

function getCheckoutRootRoute(
  navigation: NavigationProp<Record<string, object | undefined>>,
): (typeof DELIVERY_ROOT_ROUTES)[number] {
  const routes = navigation.getState().routes;

  for (let index = routes.length - 1; index >= 0; index -= 1) {
    const routeName = routes[index]?.name;

    if (DELIVERY_ROOT_ROUTES.includes(routeName as (typeof DELIVERY_ROOT_ROUTES)[number])) {
      return routeName as (typeof DELIVERY_ROOT_ROUTES)[number];
    }
  }

  return 'MultiVendor';
}

function getPreviewInput(
  cart: CartResponse | undefined,
  orderType: CheckoutOrderType,
  paymentMethod: CheckoutPaymentMethod,
  selectedAddressId?: string,
  couponCode?: string,
  riderTip?: number,
) {
  if (!cart?.bucketId || !cart.storeId) {
    return null;
  }

  if (orderType === 'delivery' && !selectedAddressId) {
    return null;
  }

  return {
    storeId: cart.storeId,
    bucketId: cart.bucketId,
    orderType,
    paymentMethod,
    addressId: orderType === 'delivery' ? selectedAddressId : undefined,
    couponCode: couponCode ?? undefined,
    riderTip: riderTip && riderTip > 0 ? riderTip : undefined,
  };
}

function applyPercentageCouponFallback(params: {
  subtotal: number;
  backendDiscount: number;
  discountType?: string;
  discountValue?: number;
  maxDiscountCap?: number;
  minOrderValue?: number;
}) {
  const {
    subtotal,
    backendDiscount,
    discountType,
    discountValue,
    maxDiscountCap,
    minOrderValue,
  } = params;

  // Keep current behavior for FIXED/FLAT and for already-applied backend discount.
  if (discountType !== 'PERCENTAGE' || backendDiscount > 0) {
    return backendDiscount;
  }

  if (typeof discountValue !== 'number' || discountValue <= 0) {
    return backendDiscount;
  }

  if (typeof minOrderValue === 'number' && subtotal < minOrderValue) {
    return backendDiscount;
  }

  const percentageAmount = (subtotal * discountValue) / 100;
  const cappedAmount = typeof maxDiscountCap === 'number' && maxDiscountCap > 0
    ? Math.min(percentageAmount, maxDiscountCap)
    : percentageAmount;

  return Number.isFinite(cappedAmount) && cappedAmount > 0 ? cappedAmount : backendDiscount;
}

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const { t } = useTranslation('deliveries');
  const queryClient = useQueryClient();
  const phoneProfile = useQuery({
    queryKey: ['deliveries', 'checkout-phone-profile'],
    queryFn: () => profileService.getProfile('deliveries'),
    staleTime: 30_000,
  });
  const { handleNextAction } = useStripe();
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [activeMessageTarget, setActiveMessageTarget] = React.useState<CheckoutMessageTarget | null>(null);
  const [isAddressSheetVisible, setIsAddressSheetVisible] = React.useState(false);
  const [isPaymentMethodScreenVisible, setIsPaymentMethodScreenVisible] = React.useState(false);
  const [isCustomTipScreenVisible, setIsCustomTipScreenVisible] = React.useState(false);
  const [stripeCheckout, setStripeCheckout] = React.useState<{
    checkoutUrl: string;
    draftId: string;
  } | null>(null);
  const [isInsufficientBalanceModalVisible, setIsInsufficientBalanceModalVisible] = React.useState(false);
  const { selectedAddress } = useAddress();
  const { refreshCurrentLocation } = useCurrentLocation();
  const {
    addresses,
    isLoading: isAddressesLoading,
    refetch: refetchAddresses,
  } = useSavedAddresses("deliveries");
  const fallbackSelectedAddress = React.useMemo(
    () => createSelectedDeliveryAddress(addresses),
    [addresses],
  );
  const effectiveSelectedAddress = React.useMemo(
    () => selectedAddress ?? fallbackSelectedAddress,
    [fallbackSelectedAddress, selectedAddress],
  );
  const resolvedAddressId = React.useMemo(
    () => resolveSavedAddressId(selectedAddress?.id, addresses),
    [addresses, selectedAddress?.id],
  );
  const { selectSavedAddress, selectingAddressId } = useSelectSavedAddress("deliveries");
  const [orderType, setOrderType] = React.useState<CheckoutOrderType>('delivery');
  const [leaveAtDoor, setLeaveAtDoor] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<CheckoutPaymentMethod>('wallet');
  const [messages, setMessages] = React.useState<CheckoutMessages>({
    restaurant: '',
    courier: '',
  });
  const [selectedTip, setSelectedTip] = React.useState(0);
  const [customTipValue, setCustomTipValue] = React.useState('');
  const selectedCoupon = useCheckoutCouponStore((state) => state.selectedCoupon);
  const clearCheckoutCoupon = useCheckoutCouponStore((state) => state.clearCoupon);
  const useCouponMutation = useUseCouponMutation();
  const savedCardsQuery = useWalletSavedCardsQuery('deliveries');
  const walletBalanceQuery = useCustomerWalletBalance();
  const wantsWalletAfterTopUpRef = React.useRef(false);
  const setDefaultCardMutation = useWalletSetDefaultCardMutation('deliveries');
  const [selectedStripeCardId, setSelectedStripeCardId] = React.useState<string | null>(null);
  const {
    data: cart,
    isPending: isCartPending,
    error: cartError,
    refetch: refetchCart,
  } = useCart();
  const previewInput = React.useMemo(
    () => phoneProfile.data?.data?.user && !phoneProfile.data.data.user.google_phone_verification_required ? getPreviewInput(
      cart,
      orderType,
      paymentMethod,
      resolvedAddressId,
      selectedCoupon?.code,
      selectedTip,
    ) : null,
    [
      cart,
      phoneProfile.data?.data?.user?.google_phone_verification_required,
      phoneProfile.data?.data?.user?.id,
      orderType,
      paymentMethod,
      resolvedAddressId,
      selectedCoupon?.code,
      selectedTip,
    ],
  );
  const {
    data: preview,
    error: previewError,
    isFetching: isPreviewPending,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useCheckoutPreview(
    previewInput,
    previewInput
      ? { placeholderData: (previousPreview) => previousPreview }
      : undefined,
  );

  const navigateToOrderConfirmation = React.useCallback((orderId: string) => {
    const rootRouteName = getCheckoutRootRoute(navigation);

    navigation.reset({
      index: 1,
      routes: [
        {
          name: rootRouteName,
        },
        {
          name: 'OrderConfirmation',
          params: {
            orderId,
            snapshot: {
              itemCount: preview?.bucket.itemCount,
              orderType,
              scheduledAt: null,
              storeImage: preview?.store.logo ?? preview?.store.image,
              storeName: preview?.store.name,
              totalAmount: preview?.pricing.totalAmount,
            },
          },
        },
      ],
    } as never);
  }, [navigation, orderType, preview]);

  const completePlacedOrder = React.useCallback((orderId: string) => {
    clearCheckoutCoupon();
    navigateToOrderConfirmation(orderId);
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: deliveryKeys.cart() }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.cartCount() }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.orders() }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.walletBalance() }),
    ]);
  }, [clearCheckoutCoupon, navigateToOrderConfirmation, queryClient]);

  const placeOrderMutation = usePlaceOrder({
    onError: (error) => {
      if (isStoreClosedError(error)) {
        showToast.error(
          t('checkout_store_closed_title'),
          t('checkout_store_closed_message'),
        );
        return;
      }

      if (isInsufficientWalletBalanceError(error)) {
        setIsInsufficientBalanceModalVisible(true);
        return;
      }

      showToast.error(t('checkout_place_order_error'));
    },
    onSuccess: async (response) => {
      if (response.mode === 'stripe') {
        if (response.orderId) {
          completePlacedOrder(response.orderId);
          return;
        }

        if (response.clientSecret) {
          const { error } = await handleNextAction(response.clientSecret);
          if (error) {
            showToast.error(t('checkout_payment_failed'), error.message);
            return;
          }

          try {
            const finalized = await orderService.finalizeSavedCardOrder(response.draftId);
            if (finalized.mode === 'stripe' && finalized.orderId) {
              completePlacedOrder(finalized.orderId);
              return;
            }
          } catch (error) {
            showToast.error(
              t('checkout_payment_failed'),
              error instanceof Error ? error.message : undefined,
            );
            return;
          }
        }

        if (!response.checkoutUrl) {
          showToast.error(t('checkout_payment_card_redirect_error'));
          return;
        }

        setStripeCheckout({
          checkoutUrl: response.checkoutUrl,
          draftId: response.draftId,
        });
        return;
      }

      completePlacedOrder(response.orderId);
    },
  });

  React.useEffect(() => {
    if (!preview?.store) {
      return;
    }

    if (orderType === 'pickup' && !preview.store.pickupAllowed) {
      setOrderType('delivery');
    }
  }, [orderType, preview?.store]);

  React.useEffect(() => {
    if (!preview?.store) {
      return;
    }

    if (isCheckoutPaymentMethodAvailable(paymentMethod, preview.store)) {
      return;
    }

    setPaymentMethod(getPreferredCheckoutPaymentMethod(preview.store));
  }, [paymentMethod, preview?.store]);

  React.useEffect(() => {
    if (preview?.store?.stripeAllowed === false && leaveAtDoor) {
      setLeaveAtDoor(false);
    }
  }, [leaveAtDoor, preview?.store?.stripeAllowed]);

  React.useEffect(() => {
    if (orderType !== 'delivery' || !leaveAtDoor || !preview?.store) {
      return;
    }

    if (paymentMethod === 'stripe') {
      return;
    }

    if (!preview.store.stripeAllowed) {
      return;
    }

    setPaymentMethod('stripe');
    showToast.info(
      t('checkout_payment_card_title'),
      t('checkout_leave_at_door_switched_to_card'),
    );
  }, [leaveAtDoor, orderType, paymentMethod, preview?.store, t]);

  React.useEffect(() => {
    if (orderType !== 'pickup') {
      return;
    }

    setLeaveAtDoor(false);
    setSelectedTip(0);
    setCustomTipValue('');
    setIsCustomTipScreenVisible(false);
    setMessages((currentMessages) => {
      if (!currentMessages.courier) {
        return currentMessages;
      }

      return {
        ...currentMessages,
        courier: '',
      };
    });
  }, [orderType]);

  const handleBackPress = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAddressPress = React.useCallback(() => {
    setIsAddressSheetVisible(true);
  }, []);

  const handleCloseAddressSheet = React.useCallback(() => {
    setIsAddressSheetVisible(false);
  }, []);

  const handleSelectAddress = React.useCallback(
    async (address: (typeof addresses)[number]) => {
      try {
        const isSelected = await selectSavedAddress(address.id);

        if (!isSelected) {
          return;
        }

        void refetchAddresses();
        setIsAddressSheetVisible(false);
      } catch {
        showToast.error(t('address_select_error'));
      }
    },
    [addresses, refetchAddresses, selectSavedAddress, t],
  );

  const handleAddAddressPress = React.useCallback(() => {
    setIsAddressSheetVisible(false);
    navigation.navigate('AddressSearch', {
      appPrefix: 'deliveries',
      origin: 'checkout',
    });
  }, [navigation]);

  const handleUseCurrentLocation = React.useCallback(async () => {
    setIsAddressSheetVisible(false);
    const currentLocation = await refreshCurrentLocation();
    navigation.navigate('AddressChooseOnMap', {
      appPrefix: 'deliveries',
      initialLatitude: currentLocation?.latitude,
      initialLongitude: currentLocation?.longitude,
      origin: 'checkout',
    });
  }, [navigation, refreshCurrentLocation]);

  const handlePlaceOrderPress = React.useCallback(() => {
    if (!cart?.bucketId || !cart.storeId) {
      return;
    }

    if (orderType === 'delivery' && !resolvedAddressId) {
      showToast.error(t('checkout_address_required'));
      return;
    }

    if (orderType === 'delivery' && leaveAtDoor && paymentMethod !== 'stripe') {
      if (preview?.store?.stripeAllowed) {
        showToast.error(t('checkout_leave_at_door_card_required'));
        setIsPaymentMethodScreenVisible(true);
        return;
      }

      showToast.error(t('checkout_payment_card_unavailable_error'));
      return;
    }

    const payload = {
      storeId: cart.storeId,
      bucketId: cart.bucketId,
      orderType,
      paymentMethod,
      paymentMethodId: paymentMethod === 'stripe'
        ? selectedStripeCardId ?? savedCardsQuery.data?.cards.find((card) => card.isDefault)?.id
        : undefined,
      addressId: orderType === 'delivery' ? resolvedAddressId : undefined,
      customerNote: buildCustomerNote({
        restaurant: messages.restaurant,
        courier: orderType === 'delivery' ? messages.courier : '',
      }),
      couponCode: selectedCoupon?.code,
      riderTip: orderType === 'delivery' && selectedTip > 0 ? selectedTip : undefined,
      successUrl: paymentMethod === 'stripe' && !selectedStripeCardId
        ? CHECKOUT_STRIPE_SUCCESS_URL
        : undefined,
      cancelUrl: paymentMethod === 'stripe' && !selectedStripeCardId
        ? CHECKOUT_STRIPE_CANCEL_URL
        : undefined,
    };

    void placeOrderMutation.mutateAsync(payload).catch(() => {
      // Toast feedback is handled by the mutation callbacks.
    });
  }, [
    cart?.bucketId,
    cart?.storeId,
    orderType,
    paymentMethod,
    placeOrderMutation,
    resolvedAddressId,
    selectedCoupon?.code,
    messages,
    leaveAtDoor,
    preview?.store?.stripeAllowed,
    selectedTip,
    savedCardsQuery.data?.cards,
    selectedStripeCardId,
    t,
  ]);

  const handlePromoPress = React.useCallback(() => {
    navigation.navigate('Coupons');
  }, [navigation]);

  const handlePromoRemove = React.useCallback(async () => {
    if (!selectedCoupon?.id) {
      clearCheckoutCoupon();
      return;
    }

    try {
      await useCouponMutation.mutateAsync({
        id: selectedCoupon.id,
        isActive: false,
      });
      clearCheckoutCoupon();
      void queryClient.invalidateQueries({ queryKey: claimedCouponsKeys.all });
      showToast.success(t('checkout_promo_removed'));
      void refetchPreview();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('coupon_deactivate_error_fallback');
      showToast.error(t('coupon_deactivate_error_title'), message);
    }
  }, [
    clearCheckoutCoupon,
    refetchPreview,
    selectedCoupon?.id,
    t,
    useCouponMutation,
  ]);

  const handleStripeCheckoutBackPress = React.useCallback(() => {
    setStripeCheckout(null);
  }, []);

  const handleStripeCheckoutCancel = React.useCallback(() => {
    setStripeCheckout(null);
    showToast.info(t('checkout_payment_cancelled'));
  }, [t]);

  const handleStripeCheckoutSuccess = React.useCallback(async () => {
    if (!stripeCheckout?.draftId) return;
    try {
      const orderId = await waitForStripeCheckoutOrderId(stripeCheckout.draftId);

      if (orderId) {
        completePlacedOrder(orderId);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'payment_failed') {
        setStripeCheckout(null);
        showToast.error(t('checkout_payment_failed'));
        return;
      }
    }

    setStripeCheckout(null);
    showToast.info(t('checkout_payment_confirmation_delayed'));
  }, [completePlacedOrder, stripeCheckout?.draftId, t]);

  const handlePaymentMethodPress = React.useCallback(() => {
    setIsPaymentMethodScreenVisible(true);
    if (previewInput) {
      void refetchPreview();
    }
  }, [previewInput, refetchPreview]);

  const handlePaymentMethodConfirm = React.useCallback((nextPaymentMethod: CheckoutPaymentMethod) => {
    wantsWalletAfterTopUpRef.current = false;
    setPaymentMethod(nextPaymentMethod);
    setIsPaymentMethodScreenVisible(false);
  }, []);

  const handleCloseInsufficientBalanceModal = React.useCallback(() => {
    setIsInsufficientBalanceModalVisible(false);
  }, []);

  const handleChoosePaymentFromInsufficientBalance = React.useCallback(() => {
    setIsInsufficientBalanceModalVisible(false);
    setIsPaymentMethodScreenVisible(true);
  }, []);

  const handleSelectStripeCard = React.useCallback(async (cardId: string) => {
    setSelectedStripeCardId(cardId);
    try {
      await setDefaultCardMutation.mutateAsync(cardId);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('wallet_add_card_error');
      showToast.error(t('wallet_add_card_error'), message);
    }
  }, [setDefaultCardMutation, t]);

  const handleLeaveAtDoorChange = React.useCallback((nextValue: boolean) => {
    if (!nextValue) {
      setLeaveAtDoor(false);
      return;
    }

    if (!preview?.store?.stripeAllowed) {
      showToast.error(t('checkout_payment_card_unavailable_error'));
      return;
    }

    setLeaveAtDoor(true);
  }, [preview?.store?.stripeAllowed, t]);

  const handleMessagePress = React.useCallback((target: CheckoutMessageTarget) => {
    setActiveMessageTarget(target);
  }, []);

  const handleCustomTipPress = React.useCallback(() => {
    setCustomTipValue(selectedTip > 0 ? selectedTip.toFixed(2) : '');
    setIsCustomTipScreenVisible(true);
  }, [selectedTip]);

  const handleCustomTipValueChange = React.useCallback((value: string) => {
    const normalizedValue = value.replace(',', '.');
    const numericValue = normalizedValue.replace(/[^0-9.]/g, '');
    const [integerPart = '', ...decimalParts] = numericValue.split('.');

    if (decimalParts.length === 0) {
      setCustomTipValue(integerPart);
      return;
    }

    const mergedDecimalPart = decimalParts.join('').slice(0, 2);
    setCustomTipValue(`${integerPart}.${mergedDecimalPart}`);
  }, []);

  const handleCustomTipSave = React.useCallback(() => {
    const parsedTip = Number.parseFloat(customTipValue);

    if (!Number.isFinite(parsedTip) || parsedTip <= 0) {
      return;
    }

    setSelectedTip(parsedTip);
    setIsCustomTipScreenVisible(false);
  }, [customTipValue]);

  const handleCloseCustomTipScreen = React.useCallback(() => {
    setIsCustomTipScreenVisible(false);
  }, []);

  const handleCloseMessageScreen = React.useCallback(() => {
    setActiveMessageTarget(null);
  }, []);

  const handleMessageChange = React.useCallback(
    (target: CheckoutMessageTarget, value: string) => {
      setMessages((currentMessages) => ({
        ...currentMessages,
        [target]: clampCheckoutMessageLength(value),
      }));
    },
    [],
  );

  const adjustedPricing = (() => {
    if (!preview?.pricing) {
      return null;
    }

    const nextDiscount = applyPercentageCouponFallback({
      subtotal: preview.pricing.subtotal,
      backendDiscount: preview.pricing.discount,
      discountType: selectedCoupon?.discountType,
      discountValue: selectedCoupon?.discountValue,
      maxDiscountCap: selectedCoupon?.maxDiscountCap,
      minOrderValue: selectedCoupon?.minOrderValue,
    });

    if (nextDiscount === preview.pricing.discount) {
      return preview.pricing;
    }

    const nextTotalAmount = Math.max(
      0,
      preview.pricing.subtotal
      - nextDiscount
      + preview.pricing.tax
      + preview.pricing.packingCharges
      + preview.pricing.deliveryFee
      + preview.pricing.riderTip,
    );

    return {
      ...preview.pricing,
      discount: nextDiscount,
      totalAmount: nextTotalAmount,
    };
  })();
  const adjustedPreview = preview && adjustedPricing
    ? { ...preview, pricing: adjustedPricing }
    : preview;
  const previewTotal = adjustedPreview?.pricing.totalAmount ?? cart?.finalPrice ?? 0;
  const handleAddFundsFromInsufficientBalance = React.useCallback(() => {
    setIsInsufficientBalanceModalVisible(false);
    wantsWalletAfterTopUpRef.current = true;
    navigation.navigate('Wallet', {
      suggestedTopUpAmount: Math.max(
        500,
        Math.ceil((previewTotal - (walletBalanceQuery.data ?? 0)) * 100) / 100,
      ),
    });
  }, [navigation, previewTotal, walletBalanceQuery.data]);
  useFocusEffect(React.useCallback(() => {
    void walletBalanceQuery.refetch().then(({ data }) => {
      if (wantsWalletAfterTopUpRef.current && data !== undefined && data >= previewTotal) {
        wantsWalletAfterTopUpRef.current = false;
        setPaymentMethod('wallet');
      }
    });
  }, [previewTotal, walletBalanceQuery.refetch]));
  const selectedAddressLabel = formatDeliveryAddressLabel(effectiveSelectedAddress);
  const walletBalance = walletBalanceQuery.data ?? 0;
  const isWalletEnabled = walletBalanceQuery.data !== undefined && walletBalance >= Number(previewTotal || 0);
  React.useEffect(() => {
    if (paymentMethod === 'wallet' && walletBalanceQuery.data !== undefined && !isWalletEnabled) {
      setPaymentMethod(getPreferredCheckoutPaymentMethod(preview?.store));
    }
  }, [isWalletEnabled, paymentMethod, preview?.store, walletBalanceQuery.data]);
  const paymentIconName = paymentMethod === 'stripe' ? 'card-outline' : paymentMethod === 'wallet' ? 'wallet-outline' : 'cash-outline';
  const paymentTitle = getCheckoutPaymentMethodTitle(paymentMethod, t);
  const defaultSavedCard = savedCardsQuery.data?.cards.find((card) => card.isDefault) ?? null;
  const selectedSavedCard = (() => {
    if (!savedCardsQuery.data?.cards?.length) {
      return null;
    }

    if (selectedStripeCardId) {
      const selectedCard = savedCardsQuery.data.cards.find((card) => card.id === selectedStripeCardId);
      if (selectedCard) {
        return selectedCard;
      }
    }

    return defaultSavedCard;
  })();
  const paymentSubtitle = paymentMethod === 'stripe'
    ? selectedSavedCard
      ? t('checkout_payment_card_saved_subtitle', {
        brand: selectedSavedCard.brand.toUpperCase(),
        last4: selectedSavedCard.last4,
      })
      : getCheckoutPaymentMethodSubtitle(paymentMethod, t)
    : getCheckoutPaymentMethodSubtitle(paymentMethod, t);
  const isPromoApplied = Boolean(selectedCoupon?.code);
  const promoTitle = selectedCoupon?.title ?? t('checkout_promo_title');
  const promoCode = selectedCoupon?.code ?? null;
  const promoSubtitle = selectedCoupon
    ? t('checkout_promo_tap_to_change')
    : t('checkout_promo_subtitle');
  const isPaymentAvailable = isCheckoutPaymentMethodAvailable(
    paymentMethod,
    preview?.store,
  );
  const isLeaveAtDoorCardRequired =
    orderType === 'delivery' && leaveAtDoor && paymentMethod !== 'stripe';
  const leaveAtDoorPaymentErrorMessage = isLeaveAtDoorCardRequired
    ? (preview?.store?.stripeAllowed
      ? t('checkout_leave_at_door_card_required')
      : t('checkout_payment_card_unavailable_error'))
    : null;
  const paymentErrorMessage = !isPaymentAvailable
    ? paymentMethod === 'stripe'
      ? t('checkout_payment_card_unavailable_error')
      : t('checkout_payment_cod_unavailable_error')
    : leaveAtDoorPaymentErrorMessage;

  if (isCartPending && !cart) {
    return (
      <View style={{ backgroundColor: colors.canvas, flex: 1 }}>
        <CartScreenSkeleton />
      </View>
    );
  }

  if (!cart || cartError || cart.isEmpty) {
    return (
      <View style={{ backgroundColor: colors.canvas, flex: 1 }}>
        <CartScreenErrorState
          onRetry={() => {
            void refetchCart();
          }}
        />
      </View>
    );
  }

  if (phoneProfile.isPending) return <View style={{ backgroundColor: colors.canvas, flex: 1 }}><CartScreenSkeleton /></View>;
  if (phoneProfile.isError || !phoneProfile.data?.data?.user) return <View style={{ backgroundColor: colors.canvas, flex: 1 }}><ScreenHeader onBack={handleBackPress} /><View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 18 }}><Text variant="sectionTitle">{t('checkout_phone_profile_error')}</Text><Button variant="primary" label={t('generic_list_retry')} onPress={() => void phoneProfile.refetch()} /></View></View>;
  if (phoneProfile.data.data.user.google_phone_verification_required) return <CheckoutPhoneVerification onBack={handleBackPress} onVerified={async () => { await phoneProfile.refetch(); }} />;

  if (stripeCheckout) {
    return (
      <StripePaymentWebView
        cancelUrlMatcher={CHECKOUT_STRIPE_CANCEL_MATCHER}
        checkoutUrl={stripeCheckout.checkoutUrl}
        onBackPress={handleStripeCheckoutBackPress}
        onPaymentCancel={handleStripeCheckoutCancel}
        onPaymentFailure={() => {
          showToast.error(t('checkout_payment_failed'));
        }}
        onPaymentSuccess={handleStripeCheckoutSuccess}
        successUrlMatcher={CHECKOUT_STRIPE_SUCCESS_MATCHER}
        title={t('checkout_payment_webview_title')}
      />
    );
  }

  if (isCustomTipScreenVisible) {
    return (
      <CheckoutCustomTipScreen
        onBackPress={handleCloseCustomTipScreen}
        onChangeTipValue={handleCustomTipValueChange}
        onSavePress={handleCustomTipSave}
        tipValue={customTipValue}
      />
    );
  }

  if (activeMessageTarget) {
    const isRestaurantMessage = activeMessageTarget === 'restaurant';

    return (
      <CheckoutMessageEditorScreen
        ctaLabel={t('checkout_message_done')}
        description={isRestaurantMessage
          ? t('checkout_message_restaurant_editor_description')
          : t('checkout_message_courier_editor_description')}
        onBackPress={handleCloseMessageScreen}
        onChangeText={(value) => {
          handleMessageChange(activeMessageTarget, value);
        }}
        onSavePress={handleCloseMessageScreen}
        placeholder={isRestaurantMessage
          ? t('checkout_message_restaurant_placeholder')
          : t('checkout_message_courier_placeholder')}
        title={isRestaurantMessage
          ? t('checkout_message_restaurant_editor_title')
          : t('checkout_message_courier_editor_title')}
        value={messages[activeMessageTarget]}
      />
    );
  }

  return (
    <View style={{ backgroundColor: colors.canvas, flex: 1 }}>
      <CheckoutScreenContent
        courierMessage={messages.courier}
        hasAddressRequirement={orderType === 'delivery' && !resolvedAddressId}
        isPickupEnabled={adjustedPreview?.store.pickupAllowed ?? true}
        isPromoApplied={isPromoApplied}
        isPlacingOrder={placeOrderMutation.isPending}
        isPaymentBlocked={!isPaymentAvailable || isLeaveAtDoorCardRequired}
        isPreviewEnabled={Boolean(previewInput)}
        isPreviewError={isPreviewError}
        isStoreClosedError={isStoreClosedError(previewError)}
        isAddressOutsideDeliveryAreaError={isAddressOutsideDeliveryAreaError(previewError)}
        isPreviewPending={isPreviewPending}
        canShowLeaveAtDoor={adjustedPreview?.store?.stripeAllowed ?? false}
        leaveAtDoor={leaveAtDoor}
        onAddressPress={handleAddressPress}
        onBackPress={handleBackPress}
        onCourierMessagePress={() => {
          handleMessagePress('courier');
        }}
        onLeaveAtDoorChange={handleLeaveAtDoorChange}
        onOrderTypeChange={setOrderType}
        onPlaceOrderPress={handlePlaceOrderPress}
        onPaymentPress={handlePaymentMethodPress}
        onPromoPress={handlePromoPress}
        onPromoRemove={handlePromoRemove}
        onRestaurantMessagePress={() => {
          handleMessagePress('restaurant');
        }}
        onRetryPreview={() => {
          void refetchPreview();
        }}
        onCustomTipPress={handleCustomTipPress}
        onTipChange={setSelectedTip}
        orderType={orderType}
        paymentErrorMessage={paymentErrorMessage}
        paymentIconName={paymentIconName}
        paymentSubtitle={paymentSubtitle}
        paymentTitle={paymentTitle}
        promoCode={promoCode}
        promoTitle={promoTitle}
        promoSubtitle={promoSubtitle}
        preview={adjustedPreview ?? null}
        restaurantMessage={messages.restaurant}
        selectedAddressLabel={selectedAddressLabel}
        selectedTip={selectedTip}
        totalLabel={formatCartPrice(previewTotal)}
      />

      <AddressSelectionBottomSheet
        addresses={addresses}
        isLoading={isAddressesLoading}
        isVisible={isAddressSheetVisible}
        onAddAddress={handleAddAddressPress}
        onClose={handleCloseAddressSheet}
        onSelectAddress={handleSelectAddress}
        onUseCurrentLocation={handleUseCurrentLocation}
        selectingAddressId={selectingAddressId}
        selectedAddressId={resolvedAddressId ?? selectedAddress?.id}
      />

      <CheckoutPaymentMethodBottomSheet
        isCardEnabled={Boolean(adjustedPreview?.store.stripeAllowed)
          && !isPreviewPending
          && !isPreviewError}
        isCardAvailabilityKnown={Boolean(adjustedPreview?.store)
          && !isPreviewPending
          && !isPreviewError}
        isWalletEnabled={isWalletEnabled}
        walletBalance={walletBalance}
        currencyLabel={currencyLabel}
        isSavingCardSelection={setDefaultCardMutation.isPending}
        isVisible={isPaymentMethodScreenVisible}
        onClose={() => {
          setIsPaymentMethodScreenVisible(false);
        }}
        onConfirm={handlePaymentMethodConfirm}
        onManageCards={() => {
          setIsPaymentMethodScreenVisible(false);
          navigation.navigate('Wallet');
        }}
        onSelectCard={(cardId) => {
          void handleSelectStripeCard(cardId);
        }}
        savedCards={savedCardsQuery.data?.cards ?? []}
        selectedCardId={selectedSavedCard?.id ?? null}
        selectedMethod={paymentMethod}
      />

      <FeedbackModal
        icon="wallet-outline"
        message={t('checkout_insufficient_wallet_balance_message', {
          balance: formatCartPrice(walletBalance),
          total: formatCartPrice(previewTotal),
        })}
        onClose={handleCloseInsufficientBalanceModal}
        onPrimaryPress={handleAddFundsFromInsufficientBalance}
        onSecondaryPress={handleChoosePaymentFromInsufficientBalance}
        primaryLabel={t('checkout_insufficient_wallet_balance_add_funds')}
        secondaryLabel={t('checkout_insufficient_wallet_balance_choose_payment')}
        title={t('checkout_insufficient_wallet_balance_title')}
        variant="warning"
        visible={isInsufficientBalanceModalVisible}
      />
    </View>
  );
}
