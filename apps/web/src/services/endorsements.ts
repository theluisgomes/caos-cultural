import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Endorsement, EndorsementTargetType } from '../domain/endorsement';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { fromFirestore } from '../lib/firestore';
import { ListingType, type Listing } from '../types';

/**
 * Chancela institucional (estudo p. 13/15).
 * Fonte de verdade: coleção `endorsements`. Enquanto ela não é populada,
 * derivamos selos a partir de espaços verificados que compartilham tags com o
 * perfil — mesma forma de dado, troca de fonte sem mudar a UI.
 */

const COL = 'endorsements';

export async function fetchEndorsements(
  targetType: EndorsementTargetType,
  targetId: string
): Promise<Endorsement[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(
      query(
        collection(getFirestoreInstance(), COL),
        where('targetType', '==', targetType),
        where('targetId', '==', targetId)
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...fromFirestore(d.data()) }) as Endorsement);
  } catch {
    return [];
  }
}

function isVerifiedInstitution(listing: Listing): boolean {
  return (
    listing.type === ListingType.SPACE &&
    (listing.tags.some(tag => /verificad|oficial|institucional/i.test(tag)) || listing.rating >= 4.6)
  );
}

/** Selos derivados: instituições verificadas que compartilham tags com o alvo. */
export function deriveEndorsements(
  listings: Listing[],
  target: Listing,
  targetType: EndorsementTargetType
): Endorsement[] {
  return listings
    .filter(isVerifiedInstitution)
    .filter(space => space.id !== target.id && space.tags.some(tag => target.tags.includes(tag)))
    .slice(0, 3)
    .map(space => ({
      id: `end_${space.id}_${target.id}`,
      issuerId: space.id,
      issuerName: space.title,
      issuerLogoUrl: space.imageUrl ?? null,
      targetType,
      targetId: target.id,
      label: targetType === 'work' ? 'Obra chancelada' : 'Perfil chancelado',
      note: `Reconhecido por ${space.title}.`,
      issuedAt: new Date().toISOString(),
      issuerVerified: true,
    }));
}

/** Combina selos reais (Firestore) com os derivados, sem duplicar emissor. */
export async function resolveEndorsements(
  listings: Listing[],
  target: Listing,
  targetType: EndorsementTargetType
): Promise<Endorsement[]> {
  const stored = await fetchEndorsements(targetType, target.id);
  const issuers = new Set(stored.map(e => e.issuerId));
  const derived = deriveEndorsements(listings, target, targetType).filter(
    e => !issuers.has(e.issuerId)
  );
  return [...stored, ...derived];
}
