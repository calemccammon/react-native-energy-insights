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
