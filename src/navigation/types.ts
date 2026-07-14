import type { NavigatorScreenParams } from '@react-navigation/native';

// ---------------------------------------------------------------------------
// Root stack: tabs + StateDetail pushed on top
// ---------------------------------------------------------------------------
export type RootStackParamList = {
  Tabs: undefined;
  StateDetail: {
    stateid: string;
    stateDescription: string;
  };
};

// ---------------------------------------------------------------------------
// Root bottom tab navigator
// ---------------------------------------------------------------------------
export type TabParamList = {
  Dashboard: undefined;
  Generation: undefined;
  Prices: undefined;
  Settings: undefined;
};

// ---------------------------------------------------------------------------
// Typed navigation + route props helpers
// ---------------------------------------------------------------------------
export type { RouteProp } from '@react-navigation/native';
export type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
