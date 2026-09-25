import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { fetchListingById, fetchListings } from '../services/content';
import type { JourneyKind } from '../services/mappers';
import type { Listing } from '../types';

export function useListings(category: string, journey: JourneyKind = 'all') {
  return useQuery({
    queryKey: ['listings', category, journey],
    queryFn: () => fetchListings(category, journey),
  });
}

function listingFromCatalogCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string | undefined
): Listing | undefined {
  if (!id) return undefined;
  const catalogs = queryClient.getQueriesData<Listing[]>({ queryKey: ['listings'] });
  for (const [, data] of catalogs) {
    const found = data?.find(l => l.id === id);
    if (found) return found;
  }
  return undefined;
}

export function listingFromRouteState(state: unknown, id?: string): Listing | undefined {
  const listing = (state as { listing?: Listing } | null)?.listing;
  if (!listing) return undefined;
  if (!id || listing.id === id) return listing;
  return undefined;
}

export function useListing(id: string | undefined, initial?: Listing | null) {
  const queryClient = useQueryClient();
  const cached = (initial?.id === id ? initial : undefined) ?? listingFromCatalogCache(queryClient, id);

  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => (id ? fetchListingById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    initialData: cached ?? undefined,
    placeholderData: cached ?? undefined,
  });
}

/** Resolve o listing da URL + state da navegação (swipe, feed, etc.). */
export function useRoutedListing() {
  const { id } = useParams();
  const location = useLocation();
  const fromState = listingFromRouteState(location.state, id);
  return useListing(id, fromState);
}
