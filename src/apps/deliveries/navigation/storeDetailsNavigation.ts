import { StackActions } from '@react-navigation/native';
import type { DeliveryNearbyStore } from '../api/types';

type NavigationDispatcher = {
  dispatch: (action: ReturnType<typeof StackActions.push>) => void;
};

/**
 * Opens store details as a new stack entry.
 *
 * `navigate` can target the StoreDetails route that is still being removed by
 * an iOS interactive-pop transition. When that transition finishes, the route
 * disappears and the user's next tap appears to have done nothing. A push has
 * a fresh route key, so it cannot be mistaken for the outgoing screen.
 */
export function pushStoreDetails(
  navigation: NavigationDispatcher,
  store: DeliveryNearbyStore,
) {
  navigation.dispatch(StackActions.push('StoreDetails', { store }));
}
