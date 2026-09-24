import type {
  NavigationProp,
  NavigatorScreenParams,
  ParamListBase,
} from '@react-navigation/native';
import { authSession, type AuthSession } from '../../../general/auth/authSession';
import { authKeys } from '../../../general/api/queryKeys';
import { queryClient } from '../../../general/providers/QueryProvider';
import { setPendingAppRoute } from '../../../general/navigation/pendingAppRedirect';
import { pushToAuth } from '../../../general/navigation/rootNavigation';
import type { DeliveriesStackParamList } from './types';

export function returnToDeliveriesHomeTab(
  navigation: NavigationProp<ParamListBase>,
) {
  const homeRoute = navigation
    .getState()
    .routeNames.find((routeName) => routeName.endsWith('TabHome'));

  if (homeRoute) {
    navigation.navigate(homeRoute);
  }
}

export async function requireDeliveriesAuthentication(
  params?: NavigatorScreenParams<DeliveriesStackParamList>,
) {
  const token = await authSession.getAccessToken();

  if (token) {
    return true;
  }

  // setPendingAppRoute is kept as a fallback so the redirect still lands
  // correctly if the app gets killed while the user is away completing
  // login (e.g. verifying an OTP), when there's no in-memory stack left to
  // pop back to.
  await setPendingAppRoute('Deliveries', params);
  pushToAuth();
  return false;
}

/**
 * Guards a tab that requires auth (Orders, Profile) at the tabPress level,
 * instead of letting the tab focus/mount an unauthenticated screen first.
 * Without this, tapping the tab while logged out briefly renders the gated
 * screen's `null` state (a blink) before its useFocusEffect fires and bounces
 * back to Home + pushes Auth — feeling glitchy. Reading the cached session
 * synchronously from the query cache (populated at app start and kept in
 * sync by finalizeAuthSession) lets the common authenticated case switch
 * tabs instantly with no extra check, while the logged-out case never
 * focuses the tab at all.
 */
export function createAuthGatedTabPressListener({
  navigation,
  route,
}: {
  navigation: NavigationProp<ParamListBase>;
  route: { name: string };
}) {
  return {
    tabPress: (event: { preventDefault: () => void }) => {
      const cachedSession = queryClient.getQueryData<AuthSession>(
        authKeys.session(),
      );

      if (cachedSession?.token) {
        return;
      }

      if (cachedSession && !cachedSession.token) {
        event.preventDefault();
        void requireDeliveriesAuthentication();
        return;
      }

      // Session hasn't resolved yet (e.g. cold start) — hold off switching
      // tabs until we actually know, rather than flashing an empty screen.
      event.preventDefault();
      void (async () => {
        const authenticated = await requireDeliveriesAuthentication();

        if (authenticated) {
          navigation.navigate(route.name);
        }
      })();
    },
  };
}
