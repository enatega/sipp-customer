import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import DeliveriesTabBar, {
  DELIVERIES_TAB_BAR_HEIGHT,
} from '../../components/navigation/DeliveriesTabBar';
import ChainProfileTabScreen from '../../screens/ProfileTab/ChainProfileTabScreen';
import OrdersScreen from '../../screens/OrdersScreen/OrdersScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import type { ChainBottomTabParamList } from './types';

const Tab = createBottomTabNavigator<ChainBottomTabParamList>();

type TabIconProps = {
  color: string;
  size: number;
};

export default function ChainBottomTabNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');

  const renderIcon =
    (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
    ({ color, size }: TabIconProps) => (
      <MaterialCommunityIcons
        color={color}
        name={name}
        size={Math.max(size - 2, 20)}
      />
    );

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
        name="ChainTabHome"
        options={{
          tabBarIcon: renderIcon('home-outline'),
          tabBarLabel: t('chain_tab_home'),
          title: t('chain_tab_home'),
        }}
      />
      <Tab.Screen
        component={SearchScreen}
        name="ChainTabSearch"
        options={{
          tabBarIcon: renderIcon('magnify'),
          tabBarLabel: t('chain_tab_search'),
          title: t('chain_tab_search'),
        }}
      />
      <Tab.Screen
        component={OrdersScreen}
        name="ChainTabOrders"
        options={{
          tabBarIcon: renderIcon('receipt-text-outline'),
          tabBarLabel: t('chain_tab_orders'),
          title: t('chain_tab_orders'),
        }}
      />
      <Tab.Screen
        component={ChainProfileTabScreen}
        name="ChainTabProfile"
        options={{
          tabBarIcon: renderIcon('account-outline'),
          tabBarLabel: t('chain_tab_profile'),
          title: t('chain_tab_profile'),
        }}
      />
    </Tab.Navigator>
  );
}
