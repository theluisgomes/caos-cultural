import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { getFallbackListings } from './geminiService';
import { getLacumbucaListings } from './lacumbucaListings';
import {
  agentToListing,
  eventToListing,
  JourneyKind,
  listingMatchesCategory,
  listingMatchesJourney,
  spaceToListing,
  workToListing,
} from './mappers';
import { isFirebaseConfigured, getFirestoreInstance } from '../lib/firebase';
import type { Agent } from '../domain/agent';
import type { Event } from '../domain/event';
import type { Space } from '../domain/space';
import type { Work } from '../domain/work';
import { Listing } from '../types';
import type { SearchFilters } from '../domain/feed';

const PAGE_SIZE = 48;

async function fetchCollection<T>(name: string): Promise<T[]> {
  const db = getFirestoreInstance();
  const snap = await getDocs(query(collection(db, name), limit(PAGE_SIZE)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
}

async function fetchFromFirestore(): Promise<Listing[]> {
  const [events, spaces, agents, works] = await Promise.all([
    fetchCollection<Event>('events'),
    fetchCollection<Space>('spaces'),
    fetchCollection<Agent>('agents'),
    fetchCollection<Work>('works'),
  ]);

  const worksByAgent = new Map<string, Work>();
  for (const work of works) {
    if (!worksByAgent.has(work.authorAgentId)) {
      worksByAgent.set(work.authorAgentId, work);
    }
  }

  return [
    ...events.filter(e => e.isPublished).map(eventToListing),
    ...spaces.filter(s => s.isPublished).map(spaceToListing),
    ...agents.filter(a => a.isPublic).map(a => agentToListing(a, worksByAgent.get(a.id))),
    ...works.filter(w => w.isPublished).map(workToListing),
  ];
}

function mergeLacumbuca(listings: Listing[], category: string): Listing[] {
  const lacumbuca = getLacumbucaListings();
  const show = category === 'all' || category === 'music' || category === 'social';
  if (!show) return listings;
  const ids = new Set(listings.map(l => l.id));
  return [...lacumbuca.filter(l => !ids.has(l.id)), ...listings];
}

export async function fetchListings(
  category = 'all',
  journey: JourneyKind = 'all'
): Promise<Listing[]> {
  let listings: Listing[] = [];

  if (isFirebaseConfigured()) {
    try {
      listings = await fetchFromFirestore();
    } catch (err) {
      console.warn('Firestore fetch failed, using fallback:', err);
    }
  }

  if (listings.length === 0) {
    listings = getFallbackListings(category);
  }

  listings = mergeLacumbuca(listings, category);
  return listings
    .filter(l => listingMatchesJourney(l, journey))
    .filter(l => listingMatchesCategory(l, category));
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    for (const col of ['events', 'spaces', 'agents', 'works'] as const) {
      const snap = await getDoc(doc(db, col, id));
      if (!snap.exists()) continue;
      const data = { id: snap.id, ...snap.data() };
      if (col === 'events') return eventToListing(data as Event);
      if (col === 'spaces') return spaceToListing(data as Space);
      if (col === 'agents') return agentToListing(data as Agent);
      if (col === 'works') return workToListing(data as Work);
    }
  }

  const all = await fetchListings('all', 'all');
  return all.find(l => l.id === id) ?? null;
}

export function applySearchFilters(listings: Listing[], filters: SearchFilters): Listing[] {
  let result = [...listings];

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.city) {
    const city = filters.city.toLowerCase();
    result = result.filter(
      l =>
        l.subtitle.toLowerCase().includes(city) ||
        l.meta?.city?.toLowerCase().includes(city)
    );
  }

  if (filters.neighborhood) {
    const nb = filters.neighborhood.toLowerCase();
    result = result.filter(l => l.meta?.neighborhood?.toLowerCase().includes(nb));
  }

  if (filters.eventKinds.length) {
    result = result.filter(
      l => filters.eventKinds.some(k => l.meta?.eventKind === k || l.tags.includes(k))
    );
  }

  if (filters.spaceKinds.length) {
    result = result.filter(
      l => filters.spaceKinds.some(k => l.meta?.spaceKind === k || l.tags.includes(k))
    );
  }

  if (filters.agentKinds.length) {
    result = result.filter(l => filters.agentKinds.some(k => l.meta?.agentKind === k));
  }

  if (filters.disciplines.length) {
    result = result.filter(l => filters.disciplines.some(d => l.tags.includes(d)));
  }

  if (filters.techniques.length) {
    result = result.filter(l => filters.techniques.some(t => l.tags.includes(t)));
  }

  if (filters.genders.length) {
    result = result.filter(l => {
      const g = l.meta?.identity?.gender;
      return g ? filters.genders.includes(g) : false;
    });
  }

  if (filters.races.length) {
    result = result.filter(l => {
      const r = l.meta?.identity?.race;
      return r ? filters.races.includes(r) : false;
    });
  }

  if (filters.ageRanges.length) {
    result = result.filter(l => {
      const a = l.meta?.identity?.ageRange;
      return a ? filters.ageRanges.includes(a) : false;
    });
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter(l => {
      if (!l.meta?.startsAt) return true;
      return new Date(l.meta.startsAt).getTime() >= from;
    });
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    result = result.filter(l => {
      if (!l.meta?.startsAt) return true;
      return new Date(l.meta.startsAt).getTime() <= to;
    });
  }

  if (filters.priceMax != null) {
    result = result.filter(l => {
      const p = l.meta?.priceBRL;
      return p == null || p <= filters.priceMax!;
    });
  }

  if (filters.radiusKm != null && filters.city) {
    // Client-side radius stub: already filtered by city; radius refinement happens in search service.
    result = result;
  }

  return result;
}
