import { useQuery } from '@tanstack/react-query';
import type { InteractionTargetType } from '../domain/interaction';
import { fetchTargetMetrics } from '../services/metrics';

export function useTargetMetrics(
  targetType: InteractionTargetType,
  targetId: string | undefined
) {
  return useQuery({
    queryKey: ['metrics', targetType, targetId],
    queryFn: () =>
      targetId
        ? fetchTargetMetrics(targetType, targetId)
        : Promise.resolve({ views: 0, likes: 0, saves: 0, shares: 0 }),
    enabled: Boolean(targetId),
    staleTime: 30_000,
  });
}
