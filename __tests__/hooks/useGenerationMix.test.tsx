import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGenerationMix } from '../../src/hooks/useGenerationMix';
import * as eiaClient from '../../src/api/eiaClient';

jest.mock('../../src/api/eiaClient');
const mockFetchRaw = eiaClient.fetchGenerationRaw as jest.Mock;
const mockBuildStats = eiaClient.buildGenerationStats as jest.Mock;

const mockStats = {
  totalTwh: 400,
  renewableTwh: 120,
  renewablePct: 30,
  period: '2024-06',
  byFuel: [
    { fuelType: 'NG', label: 'Natural Gas', generationTwh: 200, pct: 50, color: '#64748b' },
    { fuelType: 'WND', label: 'Wind', generationTwh: 80, pct: 20, color: '#22c55e' },
  ],
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useGenerationMix', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns data on success', async () => {
    mockFetchRaw.mockResolvedValue({});
    mockBuildStats.mockReturnValue(mockStats);

    const { result } = await renderHook(() => useGenerationMix(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockStats);
  });

  it('returns error state on failure', async () => {
    mockFetchRaw.mockRejectedValue(new Error('API error'));

    const { result } = await renderHook(() => useGenerationMix(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toBe('API error');
  });

  it('starts in loading state', async () => {
    mockFetchRaw.mockImplementation(() => new Promise(() => {}));
    const { result } = await renderHook(() => useGenerationMix(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });
});
