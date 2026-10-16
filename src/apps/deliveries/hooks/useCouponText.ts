import { useTranslation } from 'react-i18next';
import type { CouponIssue } from '../api/orderServiceTypes';
import { formatCurrency } from '../utils/orderDetails/orderDetailsUtils';

const codes = new Set(['COUPON_INACTIVE', 'COUPON_EXPIRED', 'COUPON_MIN_ORDER', 'COUPON_STORE', 'COUPON_PRODUCTS', 'COUPON_ORDER_TYPE', 'COUPON_PAYMENT_METHOD', 'COUPON_PREMIUM_ONLY', 'COUPON_NEW_USERS_ONLY', 'COUPON_USAGE_LIMIT', 'COUPON_USER_LIMIT', 'STORE_MINIMUM_AFTER_COUPON']);

export function useCouponText() {
  const { t } = useTranslation('deliveries');
  const payment = (values?: string[]) => values?.length
    ? values.map(value => t(`offers_payment_${value}`, { defaultValue: value })).join(' / ')
    : t('offers_any_payment');
  const fulfillment = (values?: string[]) => !values?.length || values.includes('ALL')
    ? t('offers_all_types')
    : values.map(value => t(`offers_type_${value}`, { defaultValue: value })).join(' / ');
  const issue = (value: CouponIssue) => {
    const details = value.details ?? {};
    const number = (key: string) => Number.isFinite(Number(details[key])) ? Number(details[key]) : 0;
    const list = (key: string) => Array.isArray(details[key]) ? (details[key] as unknown[]).filter((v): v is string => typeof v === 'string') : [];
    return t(codes.has(value.code) ? `offers_issue_${value.code}` : 'offers_not_applicable', {
      amount: formatCurrency(number('minOrderValue')),
      minimum: formatCurrency(number('storeMinimumOrder')),
      remaining: formatCurrency(Math.max(0, number('storeMinimumOrder') - number('discountedSubtotal'))),
      count: number('usagePerUser'),
      methods: payment(list('paymentMethods')),
      types: fulfillment(list('deliveryTypes')),
    });
  };
  return { payment, fulfillment, issue };
}
