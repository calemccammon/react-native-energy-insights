import { useQuery } from '@tanstack/react-query';
import { fetchStatePriceTrendRaw, buildPriceTrend } from '../api/eiaClient';
import type { PriceTrendPoint } from '../api/types';

export function useStateDetail(stateid: string) {
  return useQuery<PriceTrendPoint[], Error>({
    queryKey: ['state-detail', stateid],
    queryFn: async () => {
      const raw = await fetchStatePriceTrendRaw(stateid);
      return buildPriceTrend(raw);
    },
    enabled: stateid.length > 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
