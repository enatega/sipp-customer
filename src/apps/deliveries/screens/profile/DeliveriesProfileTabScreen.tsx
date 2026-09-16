import React from 'react';
import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import ProfileTabScreen from '../../../../general/screens/profile/ProfileTabScreen';
import useProfile from '../../../../general/hooks/useProfile';
import type { DeliveriesStackParamList } from '../../navigation/types';

type Props = {
  favoritesEnabled?: boolean;
  onOpenFavourites?: () => void;
};

export default function DeliveriesProfileTabScreen({
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
