import { navigationRef } from './rootNavigation';
import { isStoreId, storePathFromLink } from '../../apps/deliveries/navigation/storeShareLinks';
import { storeMenuService } from '../../apps/deliveries/api/storeMenuService';

let pendingStorePath: string | null = null;
let isFlushing = false;

export function queueStoreLink(url: string) {
  const path = storePathFromLink(url);
  if (!path) return;
  pendingStorePath = path;
  void flushPendingStoreLink();
}

export async function flushPendingStoreLink() {
  if (!pendingStorePath || !navigationRef.isReady() || isFlushing) return;
  if (!navigationRef.getRootState()?.routes.some((route) => route.name === 'Main')) return;
  const path = pendingStorePath;
  isFlushing = true;
  try {
    const storeId = isStoreId(path)
      ? path
      : await storeMenuService.resolveSlug(path).then((store) => store.storeId).catch(() => path);
    if (pendingStorePath !== path) return;
    navigationRef.navigate('Main', {
      screen: 'Deliveries',
      params: { screen: 'StoreDetails', params: { storeId } },
    });
    pendingStorePath = null;
  } catch {
    // Keep the destination if navigation is still mounting.
  } finally {
    isFlushing = false;
    if (pendingStorePath && pendingStorePath !== path) void flushPendingStoreLink();
  }
}
