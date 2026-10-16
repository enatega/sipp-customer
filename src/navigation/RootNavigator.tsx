import React from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import SharedNavigator from '../general/navigation/SharedNavigator';
import type { RootStackParamList } from '../general/navigation/navigationTypes';
import { navigationRef } from '../general/navigation/rootNavigation';
import { flushPendingOrderNotification } from '../general/navigation/notificationNavigation';
import { flushPendingStoreLink, queueStoreLink } from '../general/navigation/storeLinkNavigation';
import { useAuthSessionQuery } from '../general/hooks/useAuthQueries';

const Stack = createNativeStackNavigator<RootStackParamList>();
const launchStartedAt = Date.now();

export default function RootNavigator() {
  const session = useAuthSessionQuery();
  const didRecordLaunch = React.useRef(false);
  React.useEffect(() => {
    let active = true;
    void Linking.getInitialURL().then((url) => {
      if (active && url) queueStoreLink(url);
    }).catch(() => undefined);
    const subscription = Linking.addEventListener('url', ({ url }) => queueStoreLink(url));
    return () => { active = false; subscription.remove(); };
  }, []);
  React.useEffect(() => {
    if (session.isPending || didRecordLaunch.current) return;
    const frame = requestAnimationFrame(() => {
      didRecordLaunch.current = true;
      if (__DEV__) console.info('[launch] session-ready navigation (ms)', Date.now() - launchStartedAt);
    });
    return () => cancelAnimationFrame(frame);
  }, [session.isPending]);

  return (
    <NavigationContainer ref={navigationRef} onReady={() => { flushPendingOrderNotification(); flushPendingStoreLink(); }} onStateChange={() => { flushPendingOrderNotification(); flushPendingStoreLink(); }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session.isPending ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <Stack.Screen name="Main" component={SharedNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
