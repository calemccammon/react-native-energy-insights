import {
  buildGenerationStats,
  buildPriceTrend,
  buildQuery,
  buildStatePrices,
  pinStateFirst,
} from '../../src/api/eiaClient';
import type { GenerationDataPoint, RetailPriceDataPoint } from '../../src/api/types';

// EIA returns numeric fields as strings, and fuel type ids outside FuelTypeId.
function generationRow(period: string, fueltypeid: string, generation: string | null) {
  return {
    period,
    location: 'US',
    stateDescription: 'U.S. Total',
    fueltypeid,
    fuelTypeDescription: fueltypeid.toLowerCase(),
    sectorid: '99',
    sectorDescription: 'All Sectors',
    generation,
    'generation-units': 'thousand megawatthours',
  } as unknown as GenerationDataPoint;
}

function priceRow(period: string, stateid: string, name: string, price: string | null) {
  return {
    period,
    stateid,
    stateDescription: name,
    sectorid: 'RES',
    sectorName: 'residential',
    price,
  } as unknown as RetailPriceDataPoint;
}

describe('buildQuery', () => {
  it('keeps bracketed keys and encodes values', () => {
    expect(
      buildQuery([
        ['api_key', 'a b&c'],
        ['facets[stateid][]', 'CA'],
        ['length', 12],
      ])
    ).toBe('api_key=a%20b%26c&facets[stateid][]=CA&length=12');
  });
});

describe('buildGenerationStats', () => {
  // Thousand MWh. The aggregate rows overlap the individual fuels.
  const raw = [
    generationRow('2026-04', 'ALL', '330000'),
    generationRow('2026-04', 'FOS', '190000'),
    generationRow('2026-04', 'NGO', '141000'),
    generationRow('2026-04', 'REN', '80000'),
    generationRow('2026-04', 'AOR', '55000'),
    generationRow('2026-04', 'NG', '140000'),
    generationRow('2026-04', 'COL', '50000'),
    generationRow('2026-04', 'NUC', '60000'),
    generationRow('2026-04', 'WND', '45000'),
    generationRow('2026-04', 'SUN', '20000'),
    generationRow('2026-04', 'HYC', '10000'),
    generationRow('2026-04', 'HPS', '-500'),
    generationRow('2026-04', 'GEO', null),
    generationRow('2026-03', 'ALL', '999000'),
    generationRow('2026-03', 'NG', '999000'),
  ];

  it('returns an empty summary for no rows', () => {
    expect(buildGenerationStats([])).toEqual({
      period: '',
      totalTwh: 0,
      renewableTwh: 0,
      renewablePct: 0,
      byFuel: [],
    });
  });

  it('uses only the newest period', () => {
    const stats = buildGenerationStats(raw);
    expect(stats.period).toBe('2026-04');
    expect(stats.byFuel.every((f) => f.period === '2026-04')).toBe(true);
  });

  it('lists individual fuels only, largest first, in TWh', () => {
    const stats = buildGenerationStats(raw);
    expect(stats.byFuel.map((f) => f.fuelType)).toEqual([
      'NG', 'NUC', 'COL', 'WND', 'SUN', 'HYC', 'HPS',
    ]);
    expect(stats.byFuel[0]).toMatchObject({
      label: 'Natural Gas',
      generationTwh: 140,
      isRenewable: false,
    });
  });

  it('takes the total from the ALL row instead of summing overlapping rows', () => {
    expect(buildGenerationStats(raw).totalTwh).toBe(330);
  });

  it('counts wind, solar and hydro as renewable, and pumped storage as not', () => {
    const stats = buildGenerationStats(raw);
    expect(stats.renewableTwh).toBe(75);
    expect(stats.renewablePct).toBeCloseTo((75 / 330) * 100);
    expect(stats.byFuel.filter((f) => f.isRenewable).map((f) => f.fuelType)).toEqual([
      'WND', 'SUN', 'HYC',
    ]);
  });

  it('sums the individual fuels when there is no ALL row', () => {
    const withoutAll = raw.filter((r) => (r.fueltypeid as string) !== 'ALL');
    expect(buildGenerationStats(withoutAll).totalTwh).toBeCloseTo(324.5);
  });
});

describe('buildStatePrices', () => {
  const raw = [
    priceRow('2026-04', 'US', 'U.S. Total', '17.5'),
    priceRow('2026-04', 'NEW', 'New England', '29.1'),
    priceRow('2026-04', 'DC', 'District of Columbia', '18.2'),
    priceRow('2026-04', 'TX', 'Texas', '15.3'),
    priceRow('2026-04', 'CA', 'California', '31.9'),
    priceRow('2026-04', 'AK', 'Alaska', null),
    priceRow('2026-03', 'TX', 'Texas', '14.8'),
    priceRow('2026-03', 'AK', 'Alaska', '25.0'),
  ];

  it('keeps the 50 states only, sorted by name', () => {
    expect(buildStatePrices(raw).map((p) => p.stateid)).toEqual(['AK', 'CA', 'TX']);
  });

  it('takes the newest row that has a price for each state', () => {
    const byId = Object.fromEntries(buildStatePrices(raw).map((p) => [p.stateid, p]));
    expect(byId.TX).toEqual({
      stateid: 'TX',
      stateDescription: 'Texas',
      price: 15.3,
      period: '2026-04',
    });
    expect(byId.AK.period).toBe('2026-03');
    expect(byId.AK.price).toBe(25);
  });
});

describe('buildPriceTrend', () => {
  it('returns prices oldest first and drops rows without a price', () => {
    const raw = [
      priceRow('2026-04', 'CA', 'California', '31.9'),
      priceRow('2026-03', 'CA', 'California', null),
      priceRow('2026-02', 'CA', 'California', '30.1'),
    ];
    expect(buildPriceTrend(raw)).toEqual([
      { period: '2026-02', price: 30.1 },
      { period: '2026-04', price: 31.9 },
    ]);
  });
});

describe('pinStateFirst', () => {
  const prices = buildStatePrices([
    priceRow('2026-04', 'AK', 'Alaska', '25.0'),
    priceRow('2026-04', 'CA', 'California', '31.9'),
    priceRow('2026-04', 'TX', 'Texas', '15.3'),
  ]);

  it('moves the chosen state to the front and keeps the rest in order', () => {
    expect(pinStateFirst(prices, 'TX').map((p) => p.stateid)).toEqual(['TX', 'AK', 'CA']);
  });

  it('leaves the list unchanged when the state is not in it', () => {
    expect(pinStateFirst(prices, 'ZZ')).toBe(prices);
  });
});
