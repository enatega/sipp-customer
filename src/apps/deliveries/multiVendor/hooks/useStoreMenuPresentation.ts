import { useTranslation } from 'react-i18next';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import type { DeliveryNearbyStore, DeliveryStoreViewApiResponse } from '../../api/types';
import { getTodayStoreHours, isStoreOrderAvailable } from '../utils/storeMenuPresentation';

export function useStoreMenuPresentation(store: DeliveryStoreViewApiResponse | undefined, selectedStore: DeliveryNearbyStore | undefined, optimisticFav: boolean | null) {
  const { t } = useTranslation('deliveries');
  const currencyLabel = useDeliveriesCurrencyLabel();
  const storeName = store?.name ?? selectedStore?.name ?? t('store_details_store_name');
  const rawRating = store?.averageRating ?? selectedStore?.averageRating ?? null;
  const rating =
    typeof rawRating === 'number' && Number.isFinite(rawRating) && rawRating > 0
      ? rawRating
      : null;
  const rawReviewCount = store?.reviewCount ?? selectedStore?.reviewCount ?? null;
  const reviewCount =
    typeof rawReviewCount === 'number' && Number.isFinite(rawReviewCount) && rawReviewCount > 0
      ? rawReviewCount
      : null;
  const deliveryFee =
    typeof store?.baseFee === 'number' && store.baseFee > 0
      ? `${currencyLabel} ${store.baseFee}`
      : typeof selectedStore?.baseFee === 'number' && selectedStore.baseFee > 0
        ? `${currencyLabel} ${selectedStore.baseFee}`
        : null;
  const rawDistanceKm = store?.distanceKm ?? selectedStore?.distanceKm ?? null;
  const distance =
    typeof rawDistanceKm === 'number' && Number.isFinite(rawDistanceKm) && rawDistanceKm > 0
      ? `${rawDistanceKm.toFixed(1)} km`
      : null;
  const rawMinimumOrder = store?.minimumOrder ?? selectedStore?.minimumOrder ?? null;
  const minimumOrder =
    typeof rawMinimumOrder === 'number' && Number.isFinite(rawMinimumOrder) && rawMinimumOrder > 0
      ? t('store_details_minimum_order', {
          amount: `${currencyLabel} ${rawMinimumOrder.toFixed(2)}`,
        })
      : null;
  const rawDeliveryTime = store?.deliveryTime ?? selectedStore?.deliveryTime ?? null;
  const deliveryTime =
    typeof rawDeliveryTime === 'number' && Number.isFinite(rawDeliveryTime) && rawDeliveryTime > 0
      ? t('store_details_delivery_minutes', { minutes: rawDeliveryTime })
      : typeof rawDeliveryTime === 'string' && rawDeliveryTime.trim()
        ? rawDeliveryTime.trim()
        : null;
  const coverImageUrl =
    store?.coverImage ?? selectedStore?.coverImage ?? 'https://placehold.co/1400x800.png';
  const logoImageUrl = store?.logo ?? selectedStore?.logo ?? 'https://placehold.co/176x176.png';
  const isStoreAvailable = isStoreOrderAvailable(store ?? selectedStore);
  const hours = getTodayStoreHours(store?.storeTimings) ?? (
    t('store_details_hours_unavailable')
  );
  const isFavourite = optimisticFav ?? store?.isFavorited ?? selectedStore?.isFavorite ?? false;
  const storeType = store?.shopTypeName ?? selectedStore?.shopTypeName ?? null;
  const phone = store?.contact?.phone ?? null;
  const email = store?.contact?.email ?? null;
  const address = store?.address ?? selectedStore?.address ?? null;
  const tagLine = store?.tagLine ?? null;
  const infoDescription = [
    store?.description?.trim() || null,
    address?.trim() ? t('store_details_info_address', { address: address.trim() }) : null,
    phone?.trim() ? t('store_details_info_phone', { phone: phone.trim() }) : null,
    email?.trim() ? t('store_details_info_email', { email: email.trim() }) : null,
  ].filter((line): line is string => Boolean(line)).join('\n\n') || t('store_details_about_fallback');

  return { storeName, rating, reviewCount, deliveryFee, minimumOrder, distance, deliveryTime,
    coverImageUrl, logoImageUrl, isStoreAvailable, hours, isFavourite, storeType, tagLine, infoDescription };
}
