import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { CulturalRoute, type CulturalRoute as CulturalRouteT, type RouteStop } from '../domain/culturalRoute';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { fromFirestore, prepareWrite } from '../lib/firestore';
import { ListingType, type Listing } from '../types';

/**
 * Persistência de roteiros culturais (plano, fase 6).
 * Firestore quando configurado; localStorage como fallback, no mesmo padrão
 * de `services/agenda.ts` e `services/mapSavedPlaces.ts`.
 */

const COL = 'culturalRoutes';
const LOCAL_KEY = 'caos_cultural_routes';

function readLocal(): CulturalRouteT[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(routes: CulturalRouteT[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(routes));
}

export function listingToStop(listing: Listing, orderIndex: number): RouteStop {
  return {
    id: `stop_${listing.id}`,
    targetType:
      listing.type === ListingType.SPACE
        ? 'space'
        : listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE
          ? 'event'
          : listing.type === ListingType.ARTIST
            ? 'agent'
            : 'custom',
    targetId: listing.id,
    label: listing.title,
    subtitle: listing.subtitle ?? '',
    imageUrl: listing.imageUrl ?? null,
    geo: listing.coordinates ? { lat: listing.coordinates.lat, lng: listing.coordinates.lng } : null,
    orderIndex,
    note: '',
  };
}

export async function fetchUserRoutes(userId: string): Promise<CulturalRouteT[]> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(
        query(collection(getFirestoreInstance(), COL), where('ownerUserId', '==', userId))
      );
      return snap.docs.map(d => ({ id: d.id, ...fromFirestore(d.data()) }) as CulturalRouteT);
    } catch {
      return [];
    }
  }
  return readLocal().filter(route => route.ownerUserId === userId);
}

export async function fetchRoute(routeId: string): Promise<CulturalRouteT | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDoc(doc(getFirestoreInstance(), COL, routeId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...fromFirestore(snap.data()) } as CulturalRouteT;
    } catch {
      return null;
    }
  }
  return readLocal().find(route => route.id === routeId) ?? null;
}

export interface SaveRouteInput {
  id?: string;
  ownerUserId: string;
  name: string;
  description?: string;
  stops: RouteStop[];
  isPublic?: boolean;
}

export async function saveRoute(input: SaveRouteInput): Promise<CulturalRouteT> {
  const now = new Date().toISOString();
  const existing = input.id ? await fetchRoute(input.id) : null;

  const route: CulturalRouteT = CulturalRoute.parse({
    id: input.id ?? `route_${Date.now()}`,
    ownerUserId: input.ownerUserId,
    name: input.name,
    description: input.description ?? '',
    stops: input.stops.map((stop, index) => ({ ...stop, orderIndex: index })),
    isPublic: input.isPublic ?? false,
    invitedUserIds: existing?.invitedUserIds ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  if (isFirebaseConfigured()) {
    await setDoc(doc(getFirestoreInstance(), COL, route.id), prepareWrite(CulturalRoute, route));
    return route;
  }

  const routes = readLocal().filter(r => r.id !== route.id);
  writeLocal([...routes, route]);
  return route;
}

export async function deleteRoute(routeId: string): Promise<void> {
  if (isFirebaseConfigured()) {
    await deleteDoc(doc(getFirestoreInstance(), COL, routeId));
    return;
  }
  writeLocal(readLocal().filter(route => route.id !== routeId));
}

export function routeShareUrl(routeId: string): string {
  const origin = typeof window === 'undefined' ? 'https://caos-cultural.web.app' : window.location.origin;
  return `${origin}/rota/${routeId}`;
}
