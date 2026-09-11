import type { TFunction } from 'i18next';
import type {
  CheckoutPaymentMethod,
  CheckoutPreviewStore,
} from '../../api/orderServiceTypes';

export function getCheckoutPaymentMethodTitle(
  paymentMethod: CheckoutPaymentMethod,
  t: TFunction<'deliveries'>,
) {
  return paymentMethod === 'stripe'
    ? t('checkout_payment_card_title')
    : paymentMethod === 'wallet'
      ? t('checkout_payment_wallet_title')
      : t('checkout_payment_cash_title');
}

export function getCheckoutPaymentMethodSubtitle(
  paymentMethod: CheckoutPaymentMethod,
  t: TFunction<'deliveries'>,
) {
  return paymentMethod === 'stripe'
    ? t('checkout_payment_card_subtitle')
    : paymentMethod === 'wallet'
      ? t('checkout_payment_wallet_subtitle')
      : t('checkout_payment_cash_subtitle');
}

export function isCheckoutPaymentMethodAvailable(
  paymentMethod: CheckoutPaymentMethod,
  store?: CheckoutPreviewStore | null,
) {

  if (paymentMethod === 'wallet') {
    return true;
  }

  if (!store) {
    return true;
  }

  return paymentMethod === 'stripe' ? store.stripeAllowed : store.codAllowed;
}

export function getPreferredCheckoutPaymentMethod(
  store?: CheckoutPreviewStore | null,
): CheckoutPaymentMethod {
  if (!store) {
    return 'cod';
  }

  if (store.codAllowed) {
    return 'cod';
  }

  if (store.stripeAllowed) {
    return 'stripe';
  }

  return 'cod';
}
