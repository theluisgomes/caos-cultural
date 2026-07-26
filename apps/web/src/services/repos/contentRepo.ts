import { collection, doc, getDocs, query, setDoc, where, type Firestore } from 'firebase/firestore';
import { Space, type Space as SpaceT } from '../../domain/space';
import { Event, type Event as EventT } from '../../domain/event';
import { Work, type Work as WorkT } from '../../domain/work';
import { parseDoc, prepareWrite } from '../../lib/firestore';

export async function upsertSpace(db: Firestore, space: SpaceT): Promise<void> {
  await setDoc(doc(db, 'spaces', space.id), prepareWrite(Space, space), { merge: true });
}

export async function upsertEvent(db: Firestore, event: EventT): Promise<void> {
  await setDoc(doc(db, 'events', event.id), prepareWrite(Event, event), { merge: true });
}

export async function upsertWork(db: Firestore, work: WorkT): Promise<void> {
  await setDoc(doc(db, 'works', work.id), prepareWrite(Work, work), { merge: true });
}

export async function listPublishedSpaces(db: Firestore): Promise<SpaceT[]> {
  const snap = await getDocs(query(collection(db, 'spaces'), where('isPublished', '==', true)));
  return snap.docs.map(d => parseDoc(Space, d)).filter(Boolean) as SpaceT[];
}

export async function listPublishedEvents(db: Firestore): Promise<EventT[]> {
  const snap = await getDocs(query(collection(db, 'events'), where('isPublished', '==', true)));
  return snap.docs.map(d => parseDoc(Event, d)).filter(Boolean) as EventT[];
}

export async function listPublishedWorks(db: Firestore): Promise<WorkT[]> {
  const snap = await getDocs(query(collection(db, 'works'), where('isPublished', '==', true)));
  return snap.docs.map(d => parseDoc(Work, d)).filter(Boolean) as WorkT[];
}
