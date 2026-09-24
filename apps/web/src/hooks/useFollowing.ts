import { useQuery } from '@tanstack/react-query';
import { fetchFollowing } from '../services/social';

/** Ids seguidos pelo usuário (agentes, espaços, perfis). */
export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: () => (userId ? fetchFollowing(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
