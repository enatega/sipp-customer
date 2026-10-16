import type { DeliveryStoreTimings } from '../../api/types';

export function getTodayStoreHours(
  storeTimings?: DeliveryStoreTimings | null,
  timezone?: string | null,
) {
  if (!storeTimings) {
    return null;
  }

  let dayKey: string;
  try {
    dayKey = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone || 'UTC' })
      .format(new Date()).toLowerCase();
  } catch {
    dayKey = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' })
      .format(new Date()).toLowerCase();
  }
  const daySchedule = storeTimings[dayKey];

  if (!daySchedule) {
    return null;
  }

  if (!daySchedule.is_active || daySchedule.slots.length === 0) {
    return null;
  }

  const hours = daySchedule.slots
    .filter((slot) => slot?.open && slot?.close)
    .map((slot) => `${slot.open} – ${slot.close}`);
  return hours.length ? hours.join(' · ') : null;
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
