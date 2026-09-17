import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import { requireDeliveriesAuthentication } from '../../navigation/deliveriesAuthGate';

type Props = {
  component: React.ComponentType;
};

export default function AuthenticatedDeliveriesScreen({ component: Screen }: Props) {
  const sessionQuery = useAuthSessionQuery();

  useFocusEffect(
    useCallback(() => {
      if (!sessionQuery.isPending && !sessionQuery.data?.token) {
        void requireDeliveriesAuthentication();
      }

      return undefined;
    }, [sessionQuery.data?.token, sessionQuery.isPending]),
  );

  return sessionQuery.data?.token ? <Screen /> : null;
}
