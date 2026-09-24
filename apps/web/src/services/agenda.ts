import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import type { Agenda, AgendaItem } from '../domain/agenda';
import { ListingType, type Listing } from '../types';

const LOCAL_AGENDA = 'caos_agenda_items';

export async function fetchAgendaItems(userId: string): Promise<AgendaItem[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    const snap = await getDocs(
      query(collection(db, 'agendaItems'), where('addedByUserId', '==', userId))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as AgendaItem);
  }
  try {
    return JSON.parse(localStorage.getItem(LOCAL_AGENDA) || '[]');
  } catch {
    return [];
  }
}

export async function addAgendaItem(userId: string, item: Omit<AgendaItem, 'id'>): Promise<void> {
  const id = `ai_${Date.now()}`;
  const full = { ...item, id };

  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    await setDoc(doc(db, 'agendaItems', id), full);
    return;
  }

  const items = await fetchAgendaItems(userId);
  localStorage.setItem(LOCAL_AGENDA, JSON.stringify([...items, full]));
}

/**
 * Agenda pública de um perfil (estudo p. 14): derivada dos eventos ligados ao
 * perfil, para que outra pessoa possa "salvar na agenda" cada item.
 */
export function listingsToPublicAgenda(listings: Listing[], ownerId: string): AgendaItem[] {
  return listings
    .filter(l => l.type === ListingType.EVENT || l.type === ListingType.EXPERIENCE)
    .map((listing): AgendaItem | null => {
      const startsAt = listing.meta?.startsAt;
      if (!startsAt) return null;
      return {
        id: `public_${ownerId}_${listing.id}`,
        agendaId: `public_${ownerId}`,
        addedByUserId: ownerId,
        eventId: listing.id,
        customTitle: listing.title,
        customLocation: listing.subtitle || null,
        startsAt,
        endsAt: null,
        status: 'going',
        notes: '',
        reminderMinutesBefore: null,
        createdAt: startsAt,
        updatedAt: startsAt,
      };
    })
    .filter((item): item is AgendaItem => item !== null)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export async function fetchUserAgendas(userId: string): Promise<Agenda[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getFirestoreInstance();
  const snap = await getDocs(query(collection(db, 'agendas'), where('ownerUserId', '==', userId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Agenda);
}
