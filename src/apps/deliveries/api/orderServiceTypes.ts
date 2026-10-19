import type { AddressDetails } from '../../../general/api/addressService';
export type CheckoutOrderType = 'delivery' | 'pickup';

export type CheckoutPaymentMethod = 'cod' | 'stripe' | 'wallet';

export type CheckoutPreviewInput = {
  storeId: string;
  bucketId: string;
  orderType: CheckoutOrderType;
  paymentMethod: CheckoutPaymentMethod;
  addressId?: string;
  couponCode?: string;
  scheduledAt?: string;
  riderTip?: number;
};

export type CheckoutScheduleSlotsInput = {
  dateTime?: string;
  days?: number;
  slotMinutes?: number;
};

export type CheckoutScheduleApiSlot = {
  start: string;
  end: string;
  isAvailable?: boolean;
  maxOrders?: number;
};

export type CheckoutScheduleApiDay = {
  date: string;
  label: string;
  dayName: string;
  isActive: boolean;
  hasSlots: boolean;
  slots: CheckoutScheduleApiSlot[];
};

export type CheckoutScheduleSlotsResponse = {
  allowScheduleBooking: boolean;
  selectedDate: string;
  days: CheckoutScheduleApiDay[];
  slots: CheckoutScheduleApiSlot[];
};

export type CheckoutPreviewStore = {
  id: string;
  name: string;
  address: string | null;
  image: string | null;
  logo: string | null;
  pickupAllowed: boolean;
  deliveryAllowed: boolean;
  scheduleAllowed: boolean;
  codAllowed: boolean;
  stripeAllowed: boolean;
};

export type CheckoutPreviewPickup = {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type CheckoutPreviewDelivery = {
  deliveryAddressDetails?: AddressDetails | null;
  deliveryAddressIsHistoricalFallback?: boolean;
  deliveryAddressExtras?: string | null;
  addressId: string;
  label: string | null;
  address: string;
  latitude: number;
  longitude: number;
};

export type CheckoutPreviewPricing = {
  subtotal: number;
  discount: number;
  tax: number;
  packingCharges: number;
  deliveryFee: number;
  riderTip: number;
  totalAmount: number;
};

export type CheckoutPreviewBucketItem = Record<string, unknown>;

export type CheckoutPreviewResponse = {
  coupon?: CheckoutPreviewCoupon | null;
  coupons?: CheckoutPreviewCoupon[];
  store: CheckoutPreviewStore;
  fulfillment: {
    orderType: CheckoutOrderType;
    pickup: CheckoutPreviewPickup | null;
    delivery: CheckoutPreviewDelivery | null;
  };
  schedule: {
    isScheduled: boolean;
    scheduledAt: string | null;
    scheduleAllowed: boolean;
  };
  pricing: CheckoutPreviewPricing;
  bucket: {
    itemCount: number;
    items: CheckoutPreviewBucketItem[];
  };
};

export type CouponIssue = {
  code: string;
  message?: string;
  details?: Record<string, unknown>;
};

export type CheckoutPreviewCoupon = {
  id: string;
  code: string;
  name?: string;
  isApplied: boolean;
  appliedDiscount?: number;
  issue?: CouponIssue | null;
  requirements?: {
    paymentMethods: string[];
    deliveryTypes: string[];
    minOrderValue: number;
  };
};

export type PlaceOrderInput = {
  storeId: string;
  bucketId: string;
  orderType: CheckoutOrderType;
  paymentMethod: CheckoutPaymentMethod;
  paymentMethodId?: string;
  addressId?: string;
  couponCode?: string;
  customerNote?: string;
  riderTip?: number;
  scheduledAt?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type PlaceOrderCashResponse = {
  mode: 'cod' | 'wallet';
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: 'cash' | 'card' | 'wallet';
  orderType: CheckoutOrderType;
  totalAmount: number;
  scheduledAt: string | null;
  createdAt: string;
};

export type PlaceOrderStripeResponse = {
  mode: 'stripe';
  draftId: string;
  checkoutUrl?: string | null;
  sessionId?: string;
  clientSecret?: string | null;
  orderId?: string;
  paymentStatus: string;
};

export type PlaceOrderResponse =
  | PlaceOrderCashResponse
  | PlaceOrderStripeResponse;
