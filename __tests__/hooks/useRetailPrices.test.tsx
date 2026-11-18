import { cleanup, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRetailPrices } from '../../src/hooks/useRetailPrices';
import * as eiaClient from '../../src/api/eiaClient';

jest.mock('../../src/api/eiaClient');
const mockFetchRaw = eiaClient.fetchRetailPricesRaw as jest.Mock;
const mockBuildPrices = eiaClient.buildStatePrices as jest.Mock;

const mockPrices = [
  { stateid: 'CA', stateDescription: 'California', price: 25.4, period: '2024-06' },
  { stateid: 'TX', stateDescription: 'Texas', price: 12.1, period: '2024-06' },
];

let client: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useRetailPrices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  // The hooks keep unused queries for 24 hours. Clearing the cache cancels
  // those timers so that Jest can exit.
  afterEach(async () => {
    await cleanup();
    client.clear();
  });

  it('returns data on success', async () => {
    mockFetchRaw.mockResolvedValue({});
    mockBuildPrices.mockReturnValue(mockPrices);

    const { result } = await renderHook(() => useRetailPrices(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].stateid).toBe('CA');
  });

  it('returns error state on failure', async () => {
    mockFetchRaw.mockRejectedValue(new Error('Network error'));

    const { result } = await renderHook(() => useRetailPrices(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toBe('Network error');
  });

  it('starts in loading state', async () => {
    let finishFetch: (raw: unknown) => void = () => {};
    mockFetchRaw.mockImplementation(
      () => new Promise((resolve) => { finishFetch = resolve; })
    );
    mockBuildPrices.mockReturnValue(mockPrices);

    const { result } = await renderHook(() => useRetailPrices(), { wrapper });
    expect(result.current.isLoading).toBe(true);

    finishFetch({});
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
