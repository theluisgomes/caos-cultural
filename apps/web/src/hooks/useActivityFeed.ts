import { useQuery } from '@tanstack/react-query';
import { fetchActivityFeed } from '../services/activityFeed';
import type { Listing } from '../types';

export function useActivityFeed(userId: string | undefined, listings: Listing[]) {
  return useQuery({
    queryKey: ['activityFeed', userId, listings.length],
    queryFn: () => fetchActivityFeed(userId, listings),
    enabled: listings.length > 0,
    staleTime: 30_000,
  });
}
