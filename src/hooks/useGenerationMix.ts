import { useQuery } from '@tanstack/react-query';
import { fetchGenerationRaw, buildGenerationStats } from '../api/eiaClient';
import type { GenerationStats } from '../api/types';

export function useGenerationMix() {
  return useQuery<GenerationStats, Error>({
    queryKey: ['generation-mix'],
    queryFn: async () => {
      const raw = await fetchGenerationRaw();
      return buildGenerationStats(raw);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
