import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList, SharedStackParamList } from './navigationTypes';
import type { SharedAppRouteName } from '../../apps/registry/generated/appRegistry';
import { clearPendingAppRoute, getPendingAppRoute, setActiveAppRoute } from './pendingAppRedirect';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export async function redirectToPendingAppIfNeeded() {
  if (!navigationRef.isReady()) {
    return false;
  }

  const pendingRoute = await getPendingAppRoute();

  // The auth gate pushes the Auth screen on top of whatever the user was
  // doing (see pushToAuth), so the original screen is usually still on the
  // stack underneath it. Popping back there preserves history (Home > Store
  // > Product…) instead of collapsing it into a single route, which is what
  // let the "GO_BACK" navigation error happen after login.
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();

    if (pendingRoute) {
      await setActiveAppRoute(pendingRoute.routeName);
      await clearPendingAppRoute();
    }

    return true;
  }

  if (!pendingRoute) {
    return false;
  }

  // Fallback for when there's nothing to pop back to (e.g. the app was
  // killed and relaunched straight into Auth) — jump directly to the
  // intended destination.
  navigationRef.resetRoot({
    index: 0,
    routes: [
      {
        name: 'Main',
        params: {
          screen: pendingRoute.routeName,
          params: pendingRoute.params,
        },
      },
    ],
  });

  await setActiveAppRoute(pendingRoute.routeName);
  await clearPendingAppRoute();
  return true;
}

export function resetToSharedRoute(
  routeName: SharedAppRouteName,
  params?: SharedStackParamList[SharedAppRouteName],
) {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.resetRoot({
    index: 0,
    routes: [
      {
        name: 'Main',
        params: {
          screen: routeName,
          params,
        },
      },
    ],
  });

  return true;
}

export function resetToSharedHome() {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.resetRoot({
    index: 0,
    routes: [
      {
        name: 'Main',
        params: {
          screen: 'Home',
        },
      },
    ],
  });

  return true;
}

/**
 * Pushes the Auth screen on top of the current stack instead of resetting
 * it, so the screen the user was on (e.g. a product detail page reached via
 * Home > Store > Product) stays underneath and is restored by a normal
 * back-navigation / redirectToPendingAppIfNeeded's goBack once login
 * succeeds. Use this for in-place "log in to continue" gates; use
 * resetToAuth for cases like session expiry where the prior screen's state
 * can no longer be trusted.
 */
export function pushToAuth() {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.navigate('Main', { screen: 'Auth' });

  return true;
}

export function resetToAuth() {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.resetRoot({
    index: 0,
    routes: [
      {
        name: 'Main',
        params: {
          screen: 'Auth',
        },
      },
    ],
  });

  return true;
}
