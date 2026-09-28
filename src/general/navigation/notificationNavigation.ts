import { navigationRef } from './rootNavigation';

let pendingOrderId: string | null = null;

export function queueOrderNotificationNavigation(value: unknown) {
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/i.test(value)) return;
  pendingOrderId = value;
  flushPendingOrderNotification();
}

export function flushPendingOrderNotification() {
  if (!pendingOrderId || !navigationRef.isReady()) return;
  const mainReady = navigationRef.getRootState()?.routes.some((route) => route.name === 'Main');
  if (!mainReady) return;
  const orderId = pendingOrderId;
  pendingOrderId = null;
  navigationRef.navigate('Main', {
    screen: 'Deliveries',
    params: { screen: 'OrderTrackingScreen', params: { orderId } },
  });
}
