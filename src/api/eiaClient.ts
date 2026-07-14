import axios from 'axios';
import type {
  EiaResponse,
  GenerationDataPoint,
  RetailPriceDataPoint,
  GenerationStats,
  GenerationSummary,
  StatePrice,
  PriceTrendPoint,
  FuelTypeId,
} from './types';
import { FUEL_LABELS, FUEL_COLORS, RENEWABLE_FUELS } from './types';

const BASE_URL = 'https://api.eia.gov/v2';

const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_EIA_API_KEY;
  if (!key) {
    throw new Error(
      'EIA API key is not configured. Add EXPO_PUBLIC_EIA_API_KEY to your .env file.'
    );
  }
  return key;
}

// ---------------------------------------------------------------------------
// Raw API calls
// ---------------------------------------------------------------------------

/**
 * Fetches monthly national generation by fuel type for the last ~12 months.
 * Returns raw EIA data points sorted newest-first.
 */
export async function fetchGenerationRaw(): Promise<GenerationDataPoint[]> {
  const params = [
    `api_key=${getApiKey()}`,
    `frequency=monthly`,
    `data[0]=generation`,
    `facets[location][]=US`,
    `facets[sectorid][]=99`,
    `sort[0][column]=period`,
    `sort[0][direction]=desc`,
    `length=120`,
  ].join('&');
  const { data } = await client.get<EiaResponse<GenerationDataPoint>>(
    `/electricity/electric-power-operational-data/data/?${params}`
  );
  return data.response.data;
}

/**
 * Fetches the most recent residential retail electricity prices for all states.
 */
export async function fetchRetailPricesRaw(): Promise<RetailPriceDataPoint[]> {
  const params = [
    `api_key=${getApiKey()}`,
    `frequency=monthly`,
    `data[0]=price`,
    `facets[sectorid][]=RES`,
    `sort[0][column]=period`,
    `sort[0][direction]=desc`,
    `length=200`,
  ].join('&');
  const { data } = await client.get<EiaResponse<RetailPriceDataPoint>>(
    `/electricity/retail-sales/data/?${params}`
  );
  return data.response.data;
}

/**
 * Fetches 12 months of residential retail prices for a single state.
 */
export async function fetchStatePriceTrendRaw(
  stateid: string
): Promise<RetailPriceDataPoint[]> {
  const params = [
    `api_key=${getApiKey()}`,
    `frequency=monthly`,
    `data[0]=price`,
    `facets[stateid][]=${encodeURIComponent(stateid)}`,
    `facets[sectorid][]=RES`,
    `sort[0][column]=period`,
    `sort[0][direction]=desc`,
    `length=12`,
  ].join('&');
  const { data } = await client.get<EiaResponse<RetailPriceDataPoint>>(
    `/electricity/retail-sales/data/?${params}`
  );
  return data.response.data;
}

// ---------------------------------------------------------------------------
// Data transformation helpers
// ---------------------------------------------------------------------------

/**
 * Converts raw generation data into a GenerationStats summary for the
 * most recent available period.
 */
export function buildGenerationStats(raw: GenerationDataPoint[]): GenerationStats {
  if (raw.length === 0) {
    return { period: '', totalTwh: 0, renewableTwh: 0, renewablePct: 0, byFuel: [] };
  }

  // Most recent period with data
  const latestPeriod = raw[0].period;
  const latestRows = raw.filter((r) => r.period === latestPeriod && r.generation != null);

  const byFuel: GenerationSummary[] = latestRows
    .filter((r) => r.fueltypeid !== 'ALL')
    .map((r) => ({
      period: r.period,
      fuelType: r.fueltypeid,
      label: FUEL_LABELS[r.fueltypeid] ?? r.fuelTypeDescription,
      generationTwh: parseFloat(r.generation as unknown as string) / 1_000 || 0,
      color: FUEL_COLORS[r.fueltypeid] ?? '#9ca3af',
      isRenewable: (RENEWABLE_FUELS as FuelTypeId[]).includes(r.fueltypeid),
    }))
    .sort((a, b) => b.generationTwh - a.generationTwh);

  const totalTwh = byFuel.reduce((sum, f) => sum + f.generationTwh, 0);
  const renewableTwh = byFuel
    .filter((f) => f.isRenewable)
    .reduce((sum, f) => sum + f.generationTwh, 0);

  return {
    period: latestPeriod,
    totalTwh,
    renewableTwh,
    renewablePct: totalTwh > 0 ? (renewableTwh / totalTwh) * 100 : 0,
    byFuel,
  };
}

/**
 * Converts raw retail price data into a deduplicated list of StatePrice,
 * taking the most recent price per state.
 */
export function buildStatePrices(raw: RetailPriceDataPoint[]): StatePrice[] {
  const seen = new Map<string, StatePrice>();
  for (const r of raw) {
    const price = parseFloat(r.price as unknown as string);
    if (r.price == null || isNaN(price) || r.stateid === 'US') continue;
    if (!seen.has(r.stateid)) {
      seen.set(r.stateid, {
        stateid: r.stateid,
        stateDescription: r.stateDescription,
        price,
        period: r.period,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.stateDescription.localeCompare(b.stateDescription)
  );
}

/**
 * Converts raw trend data for a state into chronological PriceTrendPoints.
 */
export function buildPriceTrend(raw: RetailPriceDataPoint[]): PriceTrendPoint[] {
  return raw
    .map((r) => ({ period: r.period, price: parseFloat(r.price as unknown as string) }))
    .filter((r) => !isNaN(r.price))
    .reverse();
}
