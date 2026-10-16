import React from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useIsMutating, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../../../../general/components/AppToast';
import { ApiError } from '../../../../general/api/apiClient';
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
import { couponMutationKey } from '../../hooks/useUseCouponMutation';
import { formatCartPrice } from '../../components/cart/cartUtils';
import {
  createSelectedDeliveryAddress,
  formatDeliveryAddressLabel,
  resolveSavedAddressId,
} from '../../../../general/utils/address';
import { usePlaceOrder } from '../../hooks/usePlaceOrder';
import { orderService } from '../../api/orderService';
import { ordersService } from '../../api/ordersService';
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
import CheckoutOffersSheet from '../../components/offers/CheckoutOffersSheet';
import { cartCouponIds, previewCoupons, couponIssueFromError } from '../../utils/couponRules';
import { useCouponSyncStore } from '../../stores/useCouponSyncStore';
import { useInventoryMessage, isInventoryError } from '../../hooks/useInventoryMessage';
import { useCouponText } from '../../hooks/useCouponText';
import { formatCurrency } from '../../utils/orderDetails/orderDetailsUtils';
import { useWalletSavedCardsQuery } from '../../../../general/api/walletSavedCardsService';
import { useCustomerWalletBalance } from '../../api/walletService';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { profileService } from '../../../../general/api/profileService';
import Text from '../../../../general/components/Text';
import Button from '../../../../general/components/Button';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import CheckoutPhoneVerification from '../../components/checkout/CheckoutPhoneVerification';
import { checkoutAttemptStorage, type CheckoutAttempt } from '../../storage/checkoutAttemptStorage';

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
    riderTip: orderType === 'delivery' && riderTip && riderTip > 0 ? riderTip : undefined,
  };
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
  const [uncertainOrder, setUncertainOrder] = React.useState<{
    bucketId: string;
    storeId: string;
  } | null>(null);
  const [checkoutAttempt, setCheckoutAttempt] = React.useState<CheckoutAttempt | null>(null);
  const checkoutAttemptRef = React.useRef<CheckoutAttempt | null>(null);
  const [isLoadingCheckoutAttempt, setIsLoadingCheckoutAttempt] = React.useState(true);
  const [recoveryClientSecret, setRecoveryClientSecret] = React.useState<string | null>(null);
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
    () => selectedAddress?.id && addresses.some((address) => address.id === selectedAddress.id)
      ? selectedAddress : fallbackSelectedAddress,
    [addresses, fallbackSelectedAddress, selectedAddress],
  );
  const resolvedAddressId = React.useMemo(
    () => resolveSavedAddressId(effectiveSelectedAddress?.id, addresses),
    [addresses, effectiveSelectedAddress?.id],
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
  const [isOffersVisible, setIsOffersVisible] = React.useState(false);
  const isSelectingCoupon = useIsMutating({ mutationKey: couponMutationKey }) > 0;
  const couponText = useCouponText();
  const inventoryMessage = useInventoryMessage();
  const [placementInventoryError, setPlacementInventoryError] = React.useState<ApiError | null>(null);
  const savedCardsQuery = useWalletSavedCardsQuery('deliveries');
  const walletBalanceQuery = useCustomerWalletBalance();
  const wantsWalletAfterTopUpRef = React.useRef(false);
  const hasManuallySelectedPaymentMethodRef = React.useRef(false);
  const [initialPaymentReady, setInitialPaymentReady] = React.useState(false);
  const [selectedStripeCardId, setSelectedStripeCardId] = React.useState<string | null>(null);
  const savedCards = savedCardsQuery.data?.cards ?? [];
  const selectedSavedCard = savedCards.find((card) => card.id === selectedStripeCardId)
    ?? savedCards.find((card) => card.isDefault)
    ?? savedCards[0]
    ?? null;
  const {
    data: cart,
    isPending: isCartPending,
    error: cartError,
    refetch: refetchCart,
  } = useCart();
  React.useEffect(() => {
    if (initialPaymentReady || savedCardsQuery.isPending) return;
    if (selectedSavedCard) setPaymentMethod('stripe');
    setInitialPaymentReady(true);
  }, [initialPaymentReady, savedCardsQuery.isPending, selectedSavedCard?.id]);
  const previewInput = React.useMemo(
    () => initialPaymentReady && !isAddressesLoading && phoneProfile.data?.data?.user && !(phoneProfile.data.data.user.phone_verification_required ?? (!phoneProfile.data.data.user.phone || !phoneProfile.data.data.user.phone_is_verified)) ? getPreviewInput(
      cart,
      orderType,
      paymentMethod,
      resolvedAddressId,
      selectedTip,
    ) : null,
    [
      initialPaymentReady,
      isAddressesLoading,
      cart,
      phoneProfile.data?.data?.user?.phone_verification_required,
      phoneProfile.data?.data?.user?.phone,
      phoneProfile.data?.data?.user?.phone_is_verified,
      phoneProfile.data?.data?.user?.id,
      orderType,
      paymentMethod,
      resolvedAddressId,
      selectedTip,
    ],
  );
  const {
    data: preview,
    error: previewError,
    isFetching: isPreviewPending,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useCheckoutPreview(previewInput, undefined, JSON.stringify([cartCouponIds(cart).sort(), cart?.items.map(item => [item.id, item.quantity, item.unitPrice]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))), cart?.totalPrice, cart?.discountAmount, effectiveSelectedAddress]));

  React.useEffect(() => {
    if (preview && !isPreviewError && !isPreviewPending) setPlacementInventoryError(null);
  }, [preview, isPreviewError, isPreviewPending]);
  const inventoryErrorMessage = inventoryMessage(previewError) ?? inventoryMessage(placementInventoryError);

  const checkoutUserId = phoneProfile.data?.data?.user?.id;
  const couponSyncPending = useCouponSyncStore(state => state.userId === checkoutUserId && state.pending);
  const couponPreviews = previewCoupons(preview);
  const selectedCouponIds = cart && (cart.appliedCouponIds !== undefined || cart.appliedCouponId !== undefined)
    ? cartCouponIds(cart) : couponPreviews.map(coupon => coupon.id);
  const hasCouponIssues = couponPreviews.some(coupon => selectedCouponIds.includes(coupon.id) && (coupon.issue || !coupon.isApplied));
  const missingCouponPreview = selectedCouponIds.some(id => !couponPreviews.some(coupon => coupon.id === id));
  const isCouponChecking = isSelectingCoupon || couponSyncPending || (selectedCouponIds.length > 0 && isPreviewPending);
  const isCouponBlocked = isCouponChecking || hasCouponIssues || missingCouponPreview;
  const confirmedSavings = isCouponChecking || isPreviewError ? 0 : couponPreviews.reduce((sum, coupon) =>
    sum + (selectedCouponIds.includes(coupon.id) && coupon.isApplied && !coupon.issue ? coupon.appliedDiscount ?? 0 : 0), 0);
  const refreshOfferPreview = React.useCallback(async () => {
    await refetchPreview({ throwOnError: true });
  }, [refetchPreview]);
  const hasLoadedCheckoutCart = React.useRef(false);
  useFocusEffect(React.useCallback(() => {
    if (!hasLoadedCheckoutCart.current) {
      hasLoadedCheckoutCart.current = true;
      return;
    }
    // A return from cart/address editing may change pricing inputs. The preview
    // key handles actual changes; unchanged cart data does not recalculate totals.
    void queryClient.invalidateQueries({ queryKey: deliveryKeys.cart() });
  }, [queryClient]));

  React.useEffect(() => {
    if (!checkoutUserId) {
      if (!phoneProfile.isPending) setIsLoadingCheckoutAttempt(false);
      return;
    }
    let active = true;
    setIsLoadingCheckoutAttempt(true);
    void checkoutAttemptStorage.read(checkoutUserId).catch(() => null).then((saved) => {
      if (active) {
        checkoutAttemptRef.current = saved;
        setCheckoutAttempt(saved);
      }
    }).finally(() => {
      if (active) setIsLoadingCheckoutAttempt(false);
    });
    return () => { active = false; };
  }, [checkoutUserId, phoneProfile.isPending]);

  const navigateToOrderTracking = React.useCallback((orderId: string) => {
    const rootRouteName = getCheckoutRootRoute(navigation);

    navigation.reset({
      index: 1,
      routes: [
        { name: rootRouteName },
        {
          name: 'OrderTrackingScreen',
          params: { orderId },
        },
      ],
    } as never);
  }, [navigation]);

  const completePlacedOrder = React.useCallback((orderId: string) => {
    if (checkoutUserId) void checkoutAttemptStorage.clear(checkoutUserId);
    checkoutAttemptRef.current = null;
    setCheckoutAttempt(null);
    setUncertainOrder(null);
    navigateToOrderTracking(orderId);
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: deliveryKeys.cart() }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.cartCount() }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.orders() }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.walletBalance() }),
    ]);
  }, [checkoutUserId, navigateToOrderTracking, queryClient]);

  const isPlacingOrderRef = React.useRef(false);
  const placeOrderMutation = usePlaceOrder({
    onError: (error) => {
      if (isInventoryError(error)) {
        if (checkoutUserId) void checkoutAttemptStorage.clear(checkoutUserId);
        checkoutAttemptRef.current = null;
        setCheckoutAttempt(null);
        setPlacementInventoryError(error);
        showToast.error(t('inventory_title'), inventoryMessage(error) ?? t('inventory_update_cart'));
        void refetchCart();
        void refetchPreview();
        return;
      }
      const issue = couponIssueFromError(error);
      if (issue) {
        // A definitive coupon refusal happens before payment/draft creation.
        if (checkoutUserId) void checkoutAttemptStorage.clear(checkoutUserId);
        checkoutAttemptRef.current = null;
        setCheckoutAttempt(null);
        setIsOffersVisible(true);
        showToast.error(t('offers_review'), couponText.issue(issue));
        void refetchPreview();
        return;
      }
      if (error.code === 'ORDER_STATUS_UNKNOWN') {
        if (cart?.bucketId && cart.storeId) {
          setUncertainOrder({ bucketId: cart.bucketId, storeId: cart.storeId });
        }
        showToast.info(t('checkout_order_confirmation_delayed'));
        return;
      }
      if (/PHONE_VERIFICATION_REQUIRED/.test(error.message)) {
        void phoneProfile.refetch();
        showToast.error(t('checkout_phone_verify_title'), t('checkout_phone_verify_description'));
        return;
      }
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
        if (checkoutAttemptRef.current && checkoutUserId) {
          const saved = {
            ...checkoutAttemptRef.current,
            draftId: response.draftId,
            checkoutUrl: response.checkoutUrl ?? undefined,
          };
          checkoutAttemptRef.current = saved;
          setCheckoutAttempt(saved);
          await checkoutAttemptStorage.save(saved).catch(() => undefined);
        }
        if (response.orderId) {
          completePlacedOrder(response.orderId);
          return;
        }

        if (response.clientSecret) {
          const { error } = await handleNextAction(response.clientSecret);
          if (error) {
            setUncertainOrder(cart?.bucketId && cart.storeId ? { bucketId: cart.bucketId, storeId: cart.storeId } : null);
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
            if (
              error instanceof ApiError &&
              (error.status === 0 || error.code === 'TRANSIENT_RESPONSE_STREAM_LOST') &&
              cart?.bucketId && cart.storeId
            ) {
              setUncertainOrder({ bucketId: cart.bucketId, storeId: cart.storeId });
              showToast.info(t('checkout_order_confirmation_delayed'));
              return;
            }
            setUncertainOrder(cart?.bucketId && cart.storeId ? { bucketId: cart.bucketId, storeId: cart.storeId } : null);
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

  const [reconcileNonce, setReconcileNonce] = React.useState(0);
  React.useEffect(() => {
    const pending = checkoutAttempt ?? uncertainOrder;
    if (!pending || placeOrderMutation.isPending || isPlacingOrderRef.current) return;
    let cancelled = false;
    let checking = false;
    const check = async () => {
      if (checking || cancelled) return;
      checking = true;
      try {
        const lookup = await orderService.getPlacedOrderByBucket(pending.bucketId, pending.storeId);
        if (cancelled) return;
        if (lookup.orderId) {
          setUncertainOrder(null);
          completePlacedOrder(lookup.orderId);
          return;
        }
        const draftId = checkoutAttempt?.draftId || lookup.draftId;
        if (draftId) {
          const draft = await ordersService.getStripeDraftStatus(draftId);
          if (cancelled) return;
          if (checkoutAttempt && checkoutUserId && (
            checkoutAttempt.draftId !== draftId ||
            (draft.checkoutUrl && checkoutAttempt.checkoutUrl !== draft.checkoutUrl)
          )) {
            const updated = { ...checkoutAttempt, draftId, checkoutUrl: draft.checkoutUrl || checkoutAttempt.checkoutUrl };
            checkoutAttemptRef.current = updated;
            setCheckoutAttempt(updated);
            void checkoutAttemptStorage.save(updated);
          }
          if (draft.orderId) {
            setUncertainOrder(null);
            completePlacedOrder(draft.orderId);
          } else if (draft.status === 'payment_failed' || draft.status === 'cancelled') {
            setUncertainOrder(null);
            if (checkoutUserId) void checkoutAttemptStorage.clear(checkoutUserId);
            checkoutAttemptRef.current = null;
            setCheckoutAttempt(null);
            showToast.error(t('checkout_payment_failed'));
          } else if (draft.clientSecret && draft.status === 'requires_action') {
            setRecoveryClientSecret(draft.clientSecret);
          }
        }
      } catch {
        // Network failure does not establish whether payment succeeded.
      } finally {
        checking = false;
      }
    };
    void check();
    const interval = setInterval(() => { void check(); }, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [checkoutAttempt, checkoutUserId, completePlacedOrder, placeOrderMutation.isPending, reconcileNonce, uncertainOrder, t]);

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
    if (!selectedSavedCard || preview?.store?.stripeAllowed !== true
      || hasManuallySelectedPaymentMethodRef.current) {
      return;
    }

    setPaymentMethod('stripe');
  }, [selectedSavedCard?.id, preview?.store?.stripeAllowed]);

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
    // Guard against double taps landing before the button re-renders as disabled.
    if (isPlacingOrderRef.current || placeOrderMutation.isPending || uncertainOrder || checkoutAttemptRef.current || isLoadingCheckoutAttempt) {
      return;
    }

    if (!cart?.bucketId || !cart.storeId || !preview || isPreviewError || isPreviewPending
      || inventoryErrorMessage || isCouponBlocked || queryClient.isMutating({ mutationKey: couponMutationKey }) > 0) {
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
      paymentMethodId: paymentMethod === 'stripe' ? selectedSavedCard?.id : undefined,
      addressId: orderType === 'delivery' ? resolvedAddressId : undefined,
      customerNote: buildCustomerNote({
        restaurant: messages.restaurant,
        courier: orderType === 'delivery' ? messages.courier : '',
      }),
      riderTip: orderType === 'delivery' && selectedTip > 0 ? selectedTip : undefined,
      successUrl: paymentMethod === 'stripe' && !selectedSavedCard
        ? CHECKOUT_STRIPE_SUCCESS_URL
        : undefined,
      cancelUrl: paymentMethod === 'stripe' && !selectedSavedCard
        ? CHECKOUT_STRIPE_CANCEL_URL
        : undefined,
    };

    isPlacingOrderRef.current = true;
    void (async () => {
      if (paymentMethod === 'stripe') {
        if (!checkoutUserId) throw new Error('Signed-in customer is unavailable');
        const attempt: CheckoutAttempt = {
          userId: checkoutUserId,
          bucketId: cart.bucketId,
          storeId: cart.storeId,
          createdAt: new Date().toISOString(),
        };
        await checkoutAttemptStorage.save(attempt);
        checkoutAttemptRef.current = attempt;
        setCheckoutAttempt(attempt);
      }
      await placeOrderMutation.mutateAsync(payload);
    })().catch((error) => {
      if (!(error instanceof ApiError)) showToast.error(t('checkout_place_order_error'));
    }).finally(() => {
      isPlacingOrderRef.current = false;
      setReconcileNonce((value) => value + 1);
    });
  }, [
    cart?.bucketId,
    cart?.storeId,
    orderType,
    paymentMethod,
    placeOrderMutation,
    preview,
    isPreviewError,
    isPreviewPending,
    isCouponBlocked,
    inventoryErrorMessage,
    queryClient,
    resolvedAddressId,
    messages,
    leaveAtDoor,
    preview?.store?.stripeAllowed,
    selectedTip,
    selectedSavedCard?.id,
    uncertainOrder,
    checkoutUserId,
    isLoadingCheckoutAttempt,
    t,
  ]);

  const handlePromoPress = React.useCallback(() => setIsOffersVisible(true), []);

  const handleStripeCheckoutBackPress = React.useCallback(() => {
    setStripeCheckout(null);
    setReconcileNonce((value) => value + 1);
  }, []);

  const handleStripeCheckoutCancel = React.useCallback(() => {
    setStripeCheckout(null);
    setReconcileNonce((value) => value + 1);
  }, []);

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
        setReconcileNonce((value) => value + 1);
        return;
      }
    }

    setStripeCheckout(null);
    setReconcileNonce((value) => value + 1);
    showToast.info(t('checkout_payment_confirmation_delayed'));
  }, [completePlacedOrder, stripeCheckout?.draftId, t]);

  const handleResumeSavedCard = React.useCallback(async () => {
    const draftId = checkoutAttempt?.draftId;
    if (!draftId || !recoveryClientSecret) return;
    const { error } = await handleNextAction(recoveryClientSecret);
    if (!error) {
      try {
        const finalized = await orderService.finalizeSavedCardOrder(draftId);
        if (finalized.mode === 'stripe' && finalized.orderId) {
          completePlacedOrder(finalized.orderId);
          return;
        }
      } catch {
        // The authoritative draft check below will reconcile a lost response.
      }
    }
    setReconcileNonce((value) => value + 1);
  }, [checkoutAttempt?.draftId, completePlacedOrder, handleNextAction, recoveryClientSecret]);

  const handlePaymentMethodPress = React.useCallback(() => {
    setIsPaymentMethodScreenVisible(true);
  }, []);

  const handlePaymentMethodConfirm = React.useCallback((nextPaymentMethod: CheckoutPaymentMethod) => {
    wantsWalletAfterTopUpRef.current = false;
    hasManuallySelectedPaymentMethodRef.current = true;
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

  const handleSelectStripeCard = React.useCallback((cardId: string) => {
    hasManuallySelectedPaymentMethodRef.current = true;
    setSelectedStripeCardId(cardId);
  }, []);

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

  const adjustedPreview = preview;
  const previewTotal = adjustedPreview?.pricing.totalAmount ?? cart?.finalPrice ?? 0;
  const handleAddFundsFromInsufficientBalance = React.useCallback(() => {
    setIsInsufficientBalanceModalVisible(false);
    setIsPaymentMethodScreenVisible(false);
    hasManuallySelectedPaymentMethodRef.current = true;
    wantsWalletAfterTopUpRef.current = true;
    navigation.navigate('Wallet', {
      suggestedTopUpAmount: Math.max(
        0.01,
        Math.ceil((previewTotal - (walletBalanceQuery.data ?? 0)) * 100) / 100,
      ),
    });
  }, [navigation, previewTotal, walletBalanceQuery.data]);
  const previewTotalRef = React.useRef(previewTotal);
  previewTotalRef.current = previewTotal;
  const hasFocusedCheckoutRef = React.useRef(false);
  useFocusEffect(React.useCallback(() => {
    if (!hasFocusedCheckoutRef.current) {
      hasFocusedCheckoutRef.current = true;
      return;
    }

    void savedCardsQuery.refetch();
    void walletBalanceQuery.refetch().then(({ data }) => {
      if (wantsWalletAfterTopUpRef.current && data !== undefined && data >= previewTotalRef.current) {
        wantsWalletAfterTopUpRef.current = false;
        setPaymentMethod('wallet');
      }
    });
  }, [savedCardsQuery.refetch, walletBalanceQuery.refetch]));
  const selectedAddressLabel = formatDeliveryAddressLabel(effectiveSelectedAddress);
  const walletBalance = walletBalanceQuery.data ?? 0;
  const isWalletEnabled = walletBalanceQuery.data !== undefined && walletBalance >= Number(previewTotal || 0);
  React.useEffect(() => {
    if (preview?.store && !isPreviewPending && paymentMethod === 'wallet' && walletBalanceQuery.data !== undefined && !isWalletEnabled) {
      setPaymentMethod(getPreferredCheckoutPaymentMethod(preview?.store));
    }
  }, [isWalletEnabled, isPreviewPending, paymentMethod, preview?.store, walletBalanceQuery.data]);
  const paymentIconName = paymentMethod === 'stripe' ? 'card-outline' : paymentMethod === 'wallet' ? 'wallet-outline' : 'cash-outline';
  const paymentTitle = getCheckoutPaymentMethodTitle(paymentMethod, t);
  const paymentSubtitle = paymentMethod === 'stripe'
    ? selectedSavedCard
      ? t('checkout_payment_card_saved_subtitle', {
        brand: selectedSavedCard.brand.toUpperCase(),
        last4: selectedSavedCard.last4,
      })
      : getCheckoutPaymentMethodSubtitle(paymentMethod, t)
    : getCheckoutPaymentMethodSubtitle(paymentMethod, t);
  const promoTitle = hasCouponIssues || missingCouponPreview || couponSyncPending ? t('offers_review') : t('offers_title');
  const promoSubtitle = couponSyncPending && !isSelectingCoupon ? t('offers_sync_error')
    : isPreviewError && selectedCouponIds.length ? t('offers_fix_before_order')
    : isCouponChecking ? t('offers_checking')
    : hasCouponIssues || missingCouponPreview ? t('offers_fix_before_order')
    : selectedCouponIds.length ? t('offers_summary', { count: selectedCouponIds.length, amount: formatCurrency(confirmedSavings) })
    : t('offers_description');
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

  if (isLoadingCheckoutAttempt || (isCartPending && !cart && !checkoutAttempt && !uncertainOrder)) {
    return (
      <View style={{ backgroundColor: colors.surface, flex: 1 }}>
        <CartScreenSkeleton />
      </View>
    );
  }

  if (phoneProfile.isPending) return <View style={{ backgroundColor: colors.surface, flex: 1 }}><CartScreenSkeleton /></View>;
  if (phoneProfile.isError || !phoneProfile.data?.data?.user) return <View style={{ backgroundColor: colors.surface, flex: 1 }}><ScreenHeader onBack={handleBackPress} /><View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 18 }}><Text variant="sectionTitle">{t('checkout_phone_profile_error')}</Text><Button variant="primary" label={t('generic_list_retry')} onPress={() => void phoneProfile.refetch()} /></View></View>;
  if (phoneProfile.data.data.user.phone_verification_required ?? (!phoneProfile.data.data.user.phone || !phoneProfile.data.data.user.phone_is_verified)) return <CheckoutPhoneVerification onBack={handleBackPress} onVerified={async () => { await phoneProfile.refetch(); }} />;

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
        onLoadError={() => {
          setStripeCheckout(null);
          setReconcileNonce((value) => value + 1);
        }}
        onPaymentSuccess={handleStripeCheckoutSuccess}
        successUrlMatcher={CHECKOUT_STRIPE_SUCCESS_MATCHER}
        title={t('checkout_payment_webview_title')}
      />
    );
  }

  if ((checkoutAttempt || uncertainOrder) && !placeOrderMutation.isPending) {
    return (
      <View style={{ backgroundColor: colors.surface, flex: 1 }}>
        <ScreenHeader onBack={handleBackPress} />
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 18 }}>
          <Text variant="sectionTitle">{t('checkout_payment_checking_title')}</Text>
          <Text variant="body">{t('checkout_payment_checking_description')}</Text>
          <Button variant="primary" label={t('generic_list_retry')} onPress={() => setReconcileNonce((value) => value + 1)} />
          {checkoutAttempt?.checkoutUrl && checkoutAttempt.draftId ? (
            <Button variant="secondary" label={t('checkout_payment_continue')} onPress={() => setStripeCheckout({ checkoutUrl: checkoutAttempt.checkoutUrl!, draftId: checkoutAttempt.draftId! })} />
          ) : null}
          {recoveryClientSecret && checkoutAttempt?.draftId ? (
            <Button variant="secondary" label={t('checkout_payment_continue')} onPress={() => { void handleResumeSavedCard(); }} />
          ) : null}
        </View>
      </View>
    );
  }

  if (!cart || cartError || cart.isEmpty) {
    return (
      <View style={{ backgroundColor: colors.surface, flex: 1 }}>
        <CartScreenErrorState onRetry={() => { void refetchCart(); }} />
      </View>
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
    <View style={{ backgroundColor: colors.surface, flex: 1 }}>
      <CheckoutScreenContent
        inventoryErrorMessage={inventoryErrorMessage}
        onReviewCart={() => navigation.navigate('Cart')}
        cartItems={cart?.items ?? []}
        courierMessage={messages.courier}
        hasAddressRequirement={orderType === 'delivery' && !resolvedAddressId}
        isPickupEnabled={adjustedPreview?.store.pickupAllowed ?? true}
        isPlacingOrder={placeOrderMutation.isPending}
        isCheckingOrder={Boolean(uncertainOrder)}
        isPaymentBlocked={!isPaymentAvailable || isLeaveAtDoorCardRequired || isCouponBlocked || Boolean(inventoryErrorMessage)}
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
        promoTitle={promoTitle}
        promoSubtitle={promoSubtitle}
        preview={adjustedPreview ?? null}
        restaurantMessage={messages.restaurant}
        selectedAddressLabel={selectedAddressLabel}
        selectedTip={selectedTip}
        totalLabel={formatCartPrice(previewTotal)}
      />

      {isOffersVisible ? <CheckoutOffersSheet
        key={checkoutUserId}
        onClose={() => setIsOffersVisible(false)}
        selectedIds={selectedCouponIds}
        previews={couponPreviews}
        checking={isCouponChecking || isPreviewError}
        previewFailed={isPreviewError}
        onRefreshPreview={isPreviewError ? refreshOfferPreview : undefined}
        context={{ storeId: cart.storeId, subtotal: preview?.pricing.subtotal ?? cart.totalPrice, orderType, paymentMethod, productIds: cart.items.map(item => item.productId) }}
      /> : null}

      <AddressSelectionBottomSheet
        addresses={addresses}
        isLoading={isAddressesLoading}
        isVisible={isAddressSheetVisible}
        onAddAddress={handleAddAddressPress}
        onClose={handleCloseAddressSheet}
        onSelectAddress={handleSelectAddress}
        onUseCurrentLocation={handleUseCurrentLocation}
        selectingAddressId={selectingAddressId}
        selectedAddressId={resolvedAddressId}
      />

      <CheckoutPaymentMethodBottomSheet
        isCardEnabled={Boolean(adjustedPreview?.store.stripeAllowed)
          && !isPreviewError}
        isCardAvailabilityKnown={Boolean(adjustedPreview?.store)
          && !isPreviewError}
        isWalletEnabled={isWalletEnabled}
        isWalletAvailabilityKnown={walletBalanceQuery.data !== undefined}
        walletBalance={walletBalance}
        currencyLabel={currencyLabel}
        isVisible={isPaymentMethodScreenVisible}
        onAddFunds={handleAddFundsFromInsufficientBalance}
        onClose={() => {
          setIsPaymentMethodScreenVisible(false);
        }}
        onConfirm={handlePaymentMethodConfirm}
        onManageCards={() => {
          setIsPaymentMethodScreenVisible(false);
          navigation.navigate('Wallet');
        }}
        onSelectCard={handleSelectStripeCard}
        savedCards={savedCards}
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
