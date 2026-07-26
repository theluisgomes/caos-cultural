import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import type { Agenda, AgendaItem } from '../domain/agenda';

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

export async function fetchUserAgendas(userId: string): Promise<Agenda[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getFirestoreInstance();
  const snap = await getDocs(query(collection(db, 'agendas'), where('ownerUserId', '==', userId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Agenda);
}
