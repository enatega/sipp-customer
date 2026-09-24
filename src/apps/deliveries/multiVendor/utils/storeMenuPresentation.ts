import type { DeliveryStoreTimings } from '../../api/types';

export function getTodayStoreHours(
  storeTimings?: DeliveryStoreTimings | null,
) {
  if (!storeTimings) {
    return null;
  }

  const dayKey = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date())
    .toLowerCase();
  const daySchedule = storeTimings[dayKey];

  if (!daySchedule) {
    return null;
  }

  if (!daySchedule.is_active || daySchedule.slots.length === 0) {
    return null;
  }

  const firstSlot = daySchedule.slots[0];

  if (!firstSlot?.open || !firstSlot?.close) {
    return null;
  }

  return `${firstSlot.open} - ${firstSlot.close}`;
}

export function isStoreOrderAvailable(store?: {
  isAvailable?: boolean;
  isClosed?: boolean;
} | null) {
  if (!store) {
    return true;
  }

  // The backend is the single source of truth for whether a store is
  // currently open (it accounts for the store's own timezone and
  // operating-hours schedule) — the same `isClosed` flag used by the
  // home listing, search results, and cart validation.
  return !(store.isAvailable === false || store.isClosed === true);
}

