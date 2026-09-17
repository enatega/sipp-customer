import type { NavigatorScreenParams } from '@react-navigation/native';
import { authSession } from '../../../general/auth/authSession';
import { setPendingAppRoute } from '../../../general/navigation/pendingAppRedirect';
import { resetToAuth } from '../../../general/navigation/rootNavigation';
import type { DeliveriesStackParamList } from './types';

export async function requireDeliveriesAuthentication(
  params?: NavigatorScreenParams<DeliveriesStackParamList>,
) {
  const token = await authSession.getAccessToken();

  if (token) {
    return true;
  }

  await setPendingAppRoute('Deliveries', params);
  resetToAuth();
  return false;
}
