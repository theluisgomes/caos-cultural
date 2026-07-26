import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { MapPin, type MapPin as MapPinT } from '../domain/mapPin';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { fromFirestore, prepareWrite } from '../lib/firestore';

const LOCAL_MAP = 'caos_map_pins';

/** @deprecated Prefer MapPin domain; kept for UI lat/lng convenience. */
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

function toSaved(pin: MapPinT): SavedMapPlace {
  return {
    id: pin.id,
    userId: pin.userId,
    targetType: pin.targetType,
    targetId: pin.targetId,
    label: pin.label,
    lat: pin.geo.lat,
    lng: pin.geo.lng,
    createdAt: pin.createdAt,
  };
}

function fromSaved(place: SavedMapPlace): MapPinT {
  return MapPin.parse({
    id: place.id,
    userId: place.userId,
    targetType: place.targetType,
    targetId: place.targetId,
    label: place.label,
    geo: { lat: place.lat, lng: place.lng },
    createdAt: place.createdAt,
  });
}

export async function fetchSavedPlaces(userId: string): Promise<SavedMapPlace[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    const snap = await getDocs(
      query(collection(db, 'mapPins'), where('userId', '==', userId))
    );
    return snap.docs.map(d => {
      const data = fromFirestore(d.data());
      if (data.geo && typeof (data.geo as { lat?: number }).lat === 'number') {
        const parsed = MapPin.safeParse({ id: d.id, ...data });
        if (parsed.success) return toSaved(parsed.data);
      }
      return {
        id: d.id,
        userId: data.userId as string,
        targetType: data.targetType as 'space' | 'event',
        targetId: data.targetId as string,
        label: data.label as string,
        lat: data.lat as number,
        lng: data.lng as number,
        createdAt: data.createdAt as string,
      };
    });
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
  const pin = fromSaved(full);

  if (isFirebaseConfigured()) {
    await setDoc(doc(getFirestoreInstance(), 'mapPins', id), prepareWrite(MapPin, pin));
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
