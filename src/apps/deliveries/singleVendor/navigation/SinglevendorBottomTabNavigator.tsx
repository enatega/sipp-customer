import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import DeliveriesTabBar, {
  DELIVERIES_TAB_BAR_HEIGHT,
} from '../../components/navigation/DeliveriesTabBar';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import SearchScreen from '../screens/SearchScreen/SearchScreen';
import SingleVendorProfileTabScreen from '../../screens/ProfileTab/SingleVendorProfileTabScreen';
import OrdersScreen from '../../screens/OrdersScreen/OrdersScreen';
import type { SingleVendorBottomTabParamList } from './types';

const Tab = createBottomTabNavigator<SingleVendorBottomTabParamList>();

type TabIconProps = {
  color: string;
  size: number;
};

export default function SinglevendorBottomTabNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: colors.canvas,
      }}
      tabBar={(props) => <DeliveriesTabBar {...props} />}
      screenOptions={{
        freezeOnBlur: true,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.iconMuted,
        tabBarStyle: {
          height: DELIVERIES_TAB_BAR_HEIGHT,
        },
      }}
    >
      <Tab.Screen
        component={HomeScreen}
        name="SingleVendorTabHome"
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons
              color={color}
              name="home-outline"
              size={Math.max(size - 2, 20)}
            />
          ),
          tabBarLabel: t('single_vendor_tab_home'),
          title: t('single_vendor_tab_home'),
        }}
      />
      <Tab.Screen
        component={SearchScreen}
        name="SingleVendorTabSearch"
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons
              color={color}
              name="magnify"
              size={Math.max(size - 2, 20)}
            />
          ),
          tabBarLabel: t('single_vendor_tab_search'),
          title: t('single_vendor_tab_search'),
        }}
      />
      <Tab.Screen
        component={OrdersScreen}
        name="SingleVendorTabOrders"
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons
              color={color}
              name="receipt-text-outline"
              size={Math.max(size - 2, 20)}
            />
          ),
          tabBarLabel: t('single_vendor_tab_orders'),
          title: t('single_vendor_tab_orders'),
        }}
      />
      <Tab.Screen
        component={SingleVendorProfileTabScreen}
        name="SingleVendorTabProfile"
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons
              color={color}
              name="account-outline"
              size={Math.max(size - 2, 20)}
            />
          ),
          tabBarLabel: t('single_vendor_tab_profile'),
          title: t('single_vendor_tab_profile'),
        }}
      />
    </Tab.Navigator>
  );
}
