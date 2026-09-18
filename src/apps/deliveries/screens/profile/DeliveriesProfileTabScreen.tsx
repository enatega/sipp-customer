import React, { useCallback } from 'react';
import {
  useFocusEffect,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import ProfileTabScreen from '../../../../general/screens/profile/ProfileTabScreen';
import useProfile from '../../../../general/hooks/useProfile';
import type { DeliveriesStackParamList } from '../../navigation/types';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import {
  requireDeliveriesAuthentication,
  returnToDeliveriesHomeTab,
} from '../../navigation/deliveriesAuthGate';

type Props = {
  favoritesEnabled?: boolean;
  onOpenFavourites?: () => void;
};

export default function DeliveriesProfileTabScreen({
  favoritesEnabled = false,
  onOpenFavourites,
}: Props) {
  const sessionQuery = useAuthSessionQuery();
  const tabNavigation = useNavigation<NavigationProp<ParamListBase>>();

  useFocusEffect(
    useCallback(() => {
      if (!sessionQuery.isPending && !sessionQuery.data?.token) {
        returnToDeliveriesHomeTab(tabNavigation);
        void requireDeliveriesAuthentication();
      }

      return undefined;
    }, [sessionQuery.data?.token, sessionQuery.isPending, tabNavigation]),
  );

  if (!sessionQuery.data?.token) {
    return null;
  }

  return (
    <AuthenticatedDeliveriesProfileTabScreen
      favoritesEnabled={favoritesEnabled}
      onOpenFavourites={onOpenFavourites}
    />
  );
}

function AuthenticatedDeliveriesProfileTabScreen({
  favoritesEnabled = false,
  onOpenFavourites,
}: Props) {
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const { user, wallet, isLoading } = useProfile('deliveries');

  const handleOpenOrders = () => {
    const orderRoute = navigation
      .getState()
      .routeNames.find((routeName) => routeName.endsWith('TabOrders'));

    if (orderRoute) {
      navigation.navigate(orderRoute as never);
    }
  };

  return (
    <ProfileTabScreen
      favoritesEnabled={favoritesEnabled}
      isLoading={isLoading}
      onOpenCoupons={() => navigation.navigate('Coupons')}
      onOpenFavourites={onOpenFavourites}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onOpenOrders={handleOpenOrders}
      user={user}
      wallet={wallet}
    />
  );
}
