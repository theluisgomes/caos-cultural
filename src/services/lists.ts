import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import type { List, ListItem } from '../domain/list';

const LOCAL_LISTS = 'caos_lists';

const DEFAULT_LISTS: Omit<List, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { ownerUserId: '', name: 'Contrataria', preset: 'contrataria', description: '', isPublic: false, coverUrl: null, itemCount: 0 },
  { ownerUserId: '', name: 'Curadoria', preset: 'curadoria', description: '', isPublic: false, coverUrl: null, itemCount: 0 },
  { ownerUserId: '', name: 'Compraria obras', preset: 'compraria_obra', description: '', isPublic: false, coverUrl: null, itemCount: 0 },
  { ownerUserId: '', name: 'Referências', preset: 'referencias', description: '', isPublic: false, coverUrl: null, itemCount: 0 },
];

export async function ensureDefaultLists(userId: string): Promise<List[]> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    const existing = await getDocs(query(collection(db, 'lists'), where('ownerUserId', '==', userId)));
    if (existing.empty) {
      for (const tpl of DEFAULT_LISTS) {
        const id = `list_${tpl.preset}_${userId.slice(0, 6)}`;
        await setDoc(doc(db, 'lists', id), { ...tpl, ownerUserId: userId, id, createdAt: now, updatedAt: now });
      }
    }
    const snap = await getDocs(query(collection(db, 'lists'), where('ownerUserId', '==', userId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as List);
  }

  const stored: List[] = JSON.parse(localStorage.getItem(LOCAL_LISTS) || '[]');
  if (!stored.length) {
    const seeded = DEFAULT_LISTS.map((tpl, i) => ({
      ...tpl,
      ownerUserId: userId,
      id: `list_${i}`,
      createdAt: now,
      updatedAt: now,
    }));
    localStorage.setItem(LOCAL_LISTS, JSON.stringify(seeded));
    return seeded;
  }
  return stored;
}

export async function addListItem(item: ListItem): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirestoreInstance();
  await setDoc(doc(db, 'listItems', item.id), item);
}

export async function fetchListItems(listId: string): Promise<ListItem[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getFirestoreInstance();
  const snap = await getDocs(query(collection(db, 'listItems'), where('listId', '==', listId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as ListItem);
}
