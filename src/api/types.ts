// EIA API v2 — TypeScript interfaces for all response shapes used in the app.

// ---------------------------------------------------------------------------
// Generic EIA v2 response envelope
// ---------------------------------------------------------------------------

export interface EiaResponse<T> {
  response: {
    total: number;
    dateRange: { start: string; end: string };
    data: T[];
    warnings?: string[];
  };
  request?: {
    command: string;
    params: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Generation data  (electric-power-operational-data endpoint)
// ---------------------------------------------------------------------------

export type FuelTypeId =
  | 'NG'   // Natural Gas
  | 'COL'  // Coal
  | 'NUC'  // Nuclear
  | 'WND'  // Wind
  | 'SUN'  // Solar (utility scale)
  | 'HYC'  // Conventional Hydroelectric
  | 'HPS'  // Hydroelectric Pumped Storage
  | 'GEO'  // Geothermal
  | 'OTH'  // Other
  | 'ALL'; // All fuels (aggregate)

// Fuels charted individually. EIA also returns aggregate rows (ALL and
// categories such as fossil fuels or all renewables) that overlap these.
export const INDIVIDUAL_FUELS: FuelTypeId[] = [
  'NG', 'COL', 'NUC', 'WND', 'SUN', 'HYC', 'HPS', 'GEO', 'OTH',
];

// Pumped storage is left out: it stores electricity generated elsewhere.
export const RENEWABLE_FUELS: FuelTypeId[] = ['WND', 'SUN', 'HYC', 'GEO'];

export const FUEL_LABELS: Record<FuelTypeId, string> = {
  NG: 'Natural Gas',
  COL: 'Coal',
  NUC: 'Nuclear',
  WND: 'Wind',
  SUN: 'Solar',
  HYC: 'Hydro',
  HPS: 'Pumped Hydro',
  GEO: 'Geothermal',
  OTH: 'Other',
  ALL: 'All Fuels',
};

export const FUEL_COLORS: Record<FuelTypeId, string> = {
  NG: '#f97316',
  COL: '#6b7280',
  NUC: '#8b5cf6',
  WND: '#22c55e',
  SUN: '#eab308',
  HYC: '#3b82f6',
  HPS: '#06b6d4',
  GEO: '#10b981',
  OTH: '#9ca3af',
  ALL: '#1d4ed8',
};

export interface GenerationDataPoint {
  period: string;           // "2024-01"
  location: string;         // "US"
  stateDescription: string;
  fueltypeid: FuelTypeId;
  fuelTypeDescription: string;
  sectorid: string;
  sectorDescription: string;
  generation: number | null; // thousand MWh (null when not reported)
  'generation-units': string;
}

// Derived type used in UI — one entry per fuel type for the most recent period
export interface GenerationSummary {
  period: string;
  fuelType: FuelTypeId;
  label: string;
  generationTwh: number;   // converted from thousand MWh → TWh (÷ 1000)
  color: string;
  isRenewable: boolean;
}

// Aggregated dashboard stats
export interface GenerationStats {
  period: string;
  totalTwh: number;
  renewableTwh: number;
  renewablePct: number;
  byFuel: GenerationSummary[];
}

// ---------------------------------------------------------------------------
// Retail price data  (retail-sales endpoint)
// ---------------------------------------------------------------------------

export interface RetailPriceDataPoint {
  period: string;           // "2024-01"
  stateid: string;          // "CA"
  stateDescription: string; // "California"
  sectorid: string;
  sectorName: string;       // "residential"
  customers: number | null;
  price: number | null;     // cents per kWh
  revenue: number | null;
  sales: number | null;
  'price-units': string;
  'customers-units': string;
  'revenue-units': string;
  'sales-units': string;
}

// Derived type used in FlatList
export interface StatePrice {
  stateid: string;
  stateDescription: string;
  price: number;            // cents per kWh
  period: string;
}

// Derived type used in line chart
export interface PriceTrendPoint {
  period: string;           // "2024-01"
  price: number;            // cents per kWh
}
