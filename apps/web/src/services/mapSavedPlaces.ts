import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';

const LOCAL_MAP = 'caos_map_pins';

export interface SavedMapPlace {
  id: string;
  userId: string;
  targetType: 'space' | 'event';
  targetId: string;
  label: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export async function fetchSavedPlaces(userId: string): Promise<SavedMapPlace[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    const snap = await getDocs(
      query(collection(db, 'mapPins'), where('userId', '==', userId))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as SavedMapPlace);
  }
  try {
    return JSON.parse(localStorage.getItem(`${LOCAL_MAP}_${userId}`) || '[]');
  } catch {
    return [];
  }
}

export async function saveMapPlace(place: Omit<SavedMapPlace, 'id' | 'createdAt'>): Promise<void> {
  const id = `pin_${Date.now()}`;
  const full: SavedMapPlace = { ...place, id, createdAt: new Date().toISOString() };

  if (isFirebaseConfigured()) {
    await setDoc(doc(getFirestoreInstance(), 'mapPins', id), full);
    return;
  }

  const items = await fetchSavedPlaces(place.userId);
  localStorage.setItem(`${LOCAL_MAP}_${place.userId}`, JSON.stringify([...items, full]));
}

export async function removeMapPlace(userId: string, pinId: string): Promise<void> {
  if (isFirebaseConfigured()) {
    await deleteDoc(doc(getFirestoreInstance(), 'mapPins', pinId));
    return;
  }
  const items = (await fetchSavedPlaces(userId)).filter(p => p.id !== pinId);
  localStorage.setItem(`${LOCAL_MAP}_${userId}`, JSON.stringify(items));
}
