import type { Listing } from '../types';
import type { SearchFilters } from '../domain/feed';
import { applySearchFilters } from './content';

/**
 * Client-side faceted search. In production this fronts Cloud Run + Typesense/Vertex.
 */
export async function searchListings(
  listings: Listing[],
  filters: SearchFilters
): Promise<Listing[]> {
  await new Promise(r => setTimeout(r, 120));
  return applySearchFilters(listings, filters);
}

export function saveSearchSubscription(userId: string, filters: SearchFilters): void {
  const key = `caos_saved_search_${userId}`;
  const existing: SearchFilters[] = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([filters, ...existing].slice(0, 10)));
}

export function getSavedSearches(userId: string): SearchFilters[] {
  try {
    return JSON.parse(localStorage.getItem(`caos_saved_search_${userId}`) || '[]');
  } catch {
    return [];
  }
}
