import { navigationRef } from './rootNavigation';
import { requireDeliveriesAuthentication } from '../../apps/deliveries/navigation/deliveriesAuthGate';

let pendingOrderId: string | null = null;
let isFlushing = false;

export function queueOrderNotificationNavigation(value: unknown) {
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/i.test(value)) return;
  pendingOrderId = value;
  flushPendingOrderNotification();
}

export async function flushPendingOrderNotification() {
  if (!pendingOrderId || !navigationRef.isReady() || isFlushing) return;
  const mainReady = navigationRef.getRootState()?.routes.some((route) => route.name === 'Main');
  if (!mainReady) return;
  const orderId = pendingOrderId;
  isFlushing = true;
  try {
    const destination = { screen: 'OrderTrackingScreen' as const, params: { orderId } };
    const authenticated = await requireDeliveriesAuthentication(destination);
    if (pendingOrderId === orderId) pendingOrderId = null;
    if (authenticated) {
      navigationRef.navigate('Main', {
        screen: 'Deliveries',
        params: destination,
      });
    }
  } catch {
    // Keep the destination until session storage/navigation is available again.
  } finally {
    isFlushing = false;
    if (pendingOrderId && pendingOrderId !== orderId) void flushPendingOrderNotification();
  }
}
