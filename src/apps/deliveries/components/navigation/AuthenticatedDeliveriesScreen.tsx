import React, { useCallback } from 'react';
import {
  useFocusEffect,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import {
  requireDeliveriesAuthentication,
  returnToDeliveriesHomeTab,
} from '../../navigation/deliveriesAuthGate';

type Props = {
  component: React.ComponentType;
};

export default function AuthenticatedDeliveriesScreen({ component: Screen }: Props) {
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

  return sessionQuery.data?.token ? <Screen /> : null;
}
