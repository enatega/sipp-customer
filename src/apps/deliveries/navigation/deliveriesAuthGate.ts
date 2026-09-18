import type {
  NavigationProp,
  NavigatorScreenParams,
  ParamListBase,
} from '@react-navigation/native';
import { authSession } from '../../../general/auth/authSession';
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
