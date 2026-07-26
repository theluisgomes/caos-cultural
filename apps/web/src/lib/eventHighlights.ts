import { Listing, ListingType } from '../types';

const HIGHLIGHT_COUNT = 6;
const UPCOMING_COUNT = 5;

function eventSortKey(listing: Listing): number {
  const iso = listing.meta?.startsAt;
  if (iso) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return Date.now() + 86400000 * 30;
}

/** 5 próximos eventos + 1 patrocinado (patrocinado no centro do carrossel). */
export function buildEventHighlights(listings: Listing[]): Listing[] {
  const events = listings.filter(l => l.type === ListingType.EVENT);
  if (!events.length) return [];

  let sponsored = events.find(e => e.sponsored);
  const pool = events.filter(e => e.id !== sponsored?.id);
  pool.sort((a, b) => eventSortKey(a) - eventSortKey(b));

  const upcoming = pool.slice(0, UPCOMING_COUNT);
  if (!sponsored) {
    sponsored = { ...pool[0] ?? events[0], sponsored: true };
  } else {
    sponsored = { ...sponsored, sponsored: true };
  }

  const withoutSponsored = upcoming.filter(e => e.id !== sponsored.id);
  while (withoutSponsored.length < UPCOMING_COUNT) {
    const extra = pool.find(e => !withoutSponsored.some(u => u.id === e.id) && e.id !== sponsored.id);
    if (!extra) break;
    withoutSponsored.push(extra);
  }

  const ordered: Listing[] = [];
  const left = withoutSponsored.slice(0, 2);
  const right = withoutSponsored.slice(2, 5);
  ordered.push(...left, sponsored, ...right);

  return ordered.slice(0, HIGHLIGHT_COUNT);
}

export function formatHighlightDate(listing: Listing): string {
  if (listing.date) return listing.date;
  if (listing.meta?.startsAt) {
    try {
      return new Date(listing.meta.startsAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      }).toUpperCase();
    } catch {
      return 'EM BREVE';
    }
  }
  return 'EM BREVE';
}
