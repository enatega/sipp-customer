import { ordersService } from '../../api/ordersService';

export const CHECKOUT_STRIPE_SUCCESS_URL =
  'https://checkout.enatega.app/deliveries/stripe/success';
export const CHECKOUT_STRIPE_CANCEL_URL =
  'https://checkout.enatega.app/deliveries/stripe/cancel';
// Matched against the end of the URL path, not as a '/success' substring that
// unrelated pages during checkout (e.g. 3-D Secure) could also contain.
export const CHECKOUT_STRIPE_SUCCESS_MATCHER = '/deliveries/stripe/success';
export const CHECKOUT_STRIPE_CANCEL_MATCHER = '/deliveries/stripe/cancel';

export async function waitForStripeCheckoutOrderId(draftId: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let status: string | undefined;
    try {
      const result = await ordersService.getStripeDraftStatus(draftId);
      if (result.orderId) return result.orderId;
      status = result.status;
    } catch {
      // A short network interruption must not lose a completed card order.
    }
    if (status === 'payment_failed' || status === 'cancelled') {
      throw new Error('payment_failed');
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
  }
  return null;
}
