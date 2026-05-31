import { useQuery } from '@tanstack/react-query';
import { fetchListingById, fetchListings } from '../services/content';
import type { JourneyKind } from '../services/mappers';

export function useListings(category: string, journey: JourneyKind = 'all') {
  return useQuery({
    queryKey: ['listings', category, journey],
    queryFn: () => fetchListings(category, journey),
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => (id ? fetchListingById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}
