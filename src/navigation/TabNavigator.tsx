import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import type { TabParamList, RootStackParamList } from './types';

import DashboardScreen from '../screens/DashboardScreen';
import GenerationScreen from '../screens/GenerationScreen';
import PricesScreen from '../screens/PricesScreen';
import StateDetailScreen from '../screens/StateDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function TabNavigatorInner() {
  const colors = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Generation"
        component={GenerationScreen}
        options={{
          title: 'Generation',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Prices"
        component={PricesScreen}
        options={{
          title: 'Prices',
          tabBarIcon: ({ color, size }) => <Ionicons name="pricetag" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function TabNavigator() {
  const colors = useTheme();
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <RootStack.Screen
        name="Tabs"
        component={TabNavigatorInner}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="StateDetail"
        component={StateDetailScreen}
        options={({ route }) => ({ title: route.params.stateDescription })}
      />
    </RootStack.Navigator>
  );
}


