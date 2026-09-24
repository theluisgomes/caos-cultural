import { doc, getDoc } from 'firebase/firestore';
import type { CulturalProfile } from '../domain/culturalProfile';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { fromFirestore } from '../lib/firestore';
import { ListingType, type Listing } from '../types';

/**
 * Evento em dois níveis (estudo p. 18/19):
 *   CulturalProfile (marca permanente, ex.: Festival Afluentes)
 *     └─ ocorrências datadas (`events` com `profileId`)
 *
 * Retrocompatibilidade: listings de evento existentes continuam funcionando
 * como ocorrências avulsas. Quando não há `culturalProfiles` no Firestore,
 * derivamos um perfil a partir da "série" dos títulos (Afluentes 2025 /
 * Afluentes 2026 → série "afluentes"), para que a camada nova já tenha
 * conteúdo sem migração de dados.
 */

const COL = 'culturalProfiles';

/** Chave de série: título sem ano, edição ou numeração romana no fim. */
export function seriesKeyOf(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/\b\d+[aoªº]?\s*edicao\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

export async function fetchCulturalProfile(id: string): Promise<CulturalProfile | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const snap = await getDoc(doc(getFirestoreInstance(), COL, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...fromFirestore(snap.data()) } as CulturalProfile;
  } catch {
    return null;
  }
}

export interface DerivedCulturalProfile {
  profile: CulturalProfile;
  /** Ocorrências datadas ligadas ao perfil, mais recentes primeiro. */
  occurrences: Listing[];
}

function eventListings(listings: Listing[]): Listing[] {
  return listings.filter(l => l.type === ListingType.EVENT || l.type === ListingType.EXPERIENCE);
}

/** Monta um CulturalProfile a partir das ocorrências que compartilham a série. */
export function deriveCulturalProfile(
  listings: Listing[],
  seriesKey: string
): DerivedCulturalProfile | null {
  const occurrences = eventListings(listings)
    .filter(l => seriesKeyOf(l.title) === seriesKey)
    .sort((a, b) => startOf(b) - startOf(a));

  if (!occurrences.length) return null;

  const first = occurrences[0];
  const now = new Date().toISOString();
  const name = first.title.replace(/\s*(19|20)\d{2}\s*$/, '').trim() || first.title;

  return {
    profile: {
      id: seriesKey,
      slug: seriesKey,
      name,
      tagline: first.subtitle,
      description: first.description,
      coverUrl: first.imageUrl,
      ownerAgentId: first.authorId ?? null,
      managerUserIds: [],
      tags: Array.from(new Set(occurrences.flatMap(o => o.tags))).slice(0, 12),
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    occurrences,
  };
}

/** Todas as séries com mais de uma ocorrência — candidatas a perfil cultural. */
export function listCulturalSeries(listings: Listing[]): DerivedCulturalProfile[] {
  const keys = new Set(eventListings(listings).map(l => seriesKeyOf(l.title)));
  return Array.from(keys)
    .map(key => deriveCulturalProfile(listings, key))
    .filter((entry): entry is DerivedCulturalProfile => entry !== null)
    .filter(entry => entry.occurrences.length > 1);
}

function startOf(listing: Listing): number {
  const iso = listing.meta?.startsAt;
  const time = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
}
