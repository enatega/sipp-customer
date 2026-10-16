import type { ClaimedCouponApiItem } from '../api/claimedCouponsService';
import type { CartResponse } from '../api/cartServiceTypes';
import type { CheckoutOrderType, CheckoutPaymentMethod, CheckoutPreviewResponse, CouponIssue } from '../api/orderServiceTypes';
import { ApiError } from '../../../general/api/apiClient';

export type CouponContext = {
  storeId: string | null;
  subtotal: number;
  orderType: CheckoutOrderType;
  paymentMethod: CheckoutPaymentMethod;
  productIds: string[];
};

export function cartCouponIds(cart?: CartResponse) {
  return [...new Set(cart?.appliedCouponIds ?? (cart?.appliedCouponId ? [cart.appliedCouponId] : []))];
}

export function previewCoupons(preview?: CheckoutPreviewResponse | null) {
  return preview?.coupons ?? (preview?.coupon ? [preview.coupon] : []);
}

export function couponIssueFromError(error: unknown): CouponIssue | null {
  if (!(error instanceof ApiError) || !error.code || (!error.code.startsWith('COUPON_') && error.code !== 'STORE_MINIMUM_AFTER_COUPON')) return null;
  const data = error.data as { details?: Record<string, unknown> } | undefined;
  return { code: error.code, details: data?.details, message: error.message };
}

/** Only preflight checks supported by the loaded data; checkout remains authoritative. */
export function couponDisabledIssue(coupon: ClaimedCouponApiItem, context?: CouponContext): CouponIssue | null {
  const now = Date.now();
  if (new Date(coupon.end_date).getTime() < now) return { code: 'COUPON_EXPIRED' };
  if (coupon.status.toLowerCase() !== 'active' || new Date(coupon.start_date).getTime() > now) return { code: 'COUPON_INACTIVE' };
  if (coupon.total_usage_limit && (coupon.total_usage_count ?? 0) >= coupon.total_usage_limit) return { code: 'COUPON_USAGE_LIMIT' };
  if (coupon.usage_per_user && (coupon.user_usage_count ?? 0) >= coupon.usage_per_user) return { code: 'COUPON_USER_LIMIT', details: { usagePerUser: coupon.usage_per_user } };
  if (!context) return null;
  if (coupon.min_order_value > context.subtotal) return { code: 'COUPON_MIN_ORDER', details: { minOrderValue: coupon.min_order_value } };
  if (coupon.offered_by?.length && !coupon.offered_by.some(store => store.store_id === context.storeId)) return { code: 'COUPON_STORE' };
  if (coupon.applies_to_products?.length && !coupon.applies_to_products.some(id => context.productIds.includes(id))) return { code: 'COUPON_PRODUCTS' };
  const delivery = context.orderType === 'pickup' ? 'PICKUP' : 'DELIVERY';
  if (coupon.delivery_type?.length && !coupon.delivery_type.includes('ALL') && !coupon.delivery_type.includes(delivery)) return { code: 'COUPON_ORDER_TYPE', details: { deliveryTypes: coupon.delivery_type } };
  const payment = context.paymentMethod === 'stripe' ? 'CARD' : context.paymentMethod === 'wallet' ? 'WALLET' : 'COD';
  if (coupon.payment_method?.length && !coupon.payment_method.includes(payment)) return { code: 'COUPON_PAYMENT_METHOD', details: { paymentMethods: coupon.payment_method } };
  return null;
}
