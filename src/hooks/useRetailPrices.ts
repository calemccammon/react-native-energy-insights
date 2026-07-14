import { useQuery } from '@tanstack/react-query';
import { fetchRetailPricesRaw, buildStatePrices } from '../api/eiaClient';
import type { StatePrice } from '../api/types';

export function useRetailPrices() {
  return useQuery<StatePrice[], Error>({
    queryKey: ['retail-prices'],
    queryFn: async () => {
      const raw = await fetchRetailPricesRaw();
      return buildStatePrices(raw);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
