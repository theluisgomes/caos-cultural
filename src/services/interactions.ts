import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { isFirebaseConfigured, getFirestoreInstance } from '../lib/firebase';
import type { InteractionKind, InteractionTargetType } from '../domain/interaction';

const LOCAL_KEY = 'caos_interactions';

type LocalInteraction = {
  id: string;
  kind: InteractionKind;
  targetType: InteractionTargetType;
  targetId: string;
};

function readLocal(): LocalInteraction[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(items: LocalInteraction[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export async function recordInteraction(
  actorUserId: string,
  kind: InteractionKind,
  targetType: InteractionTargetType,
  targetId: string
): Promise<void> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    await addDoc(collection(db, 'interactions'), {
      actorUserId,
      kind,
      targetType,
      targetId,
      surface: 'discover_mixed',
      createdAt: new Date().toISOString(),
    });
    return;
  }

  const items = readLocal();
  items.push({ id: `${Date.now()}`, kind, targetType, targetId });
  writeLocal(items);
}

export async function getSavedTargetIds(
  actorUserId: string,
  targetType: InteractionTargetType
): Promise<string[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'interactions'),
      where('actorUserId', '==', actorUserId),
      where('targetType', '==', targetType),
      where('kind', '==', 'save')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().targetId as string);
  }
  return readLocal()
    .filter(i => i.targetType === targetType && i.kind === 'save')
    .map(i => i.targetId);
}

export async function toggleSave(
  actorUserId: string,
  targetType: InteractionTargetType,
  targetId: string,
  saved: boolean
): Promise<boolean> {
  if (saved) {
    await recordInteraction(actorUserId, 'unsave', targetType, targetId);
    return false;
  }
  await recordInteraction(actorUserId, 'save', targetType, targetId);
  return true;
}

export async function removeInteraction(id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirestoreInstance();
  await deleteDoc(doc(db, 'interactions', id));
}
