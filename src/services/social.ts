import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';

const LOCAL_FOLLOWS = 'caos_follows';

export async function followTarget(
  userId: string,
  targetType: 'agent' | 'space' | 'user',
  targetId: string
): Promise<void> {
  const id = `${userId}_${targetType}_${targetId}`;
  if (isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    await setDoc(doc(db, 'follows', id), {
      id,
      followerUserId: userId,
      targetType,
      targetId,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  const items = JSON.parse(localStorage.getItem(LOCAL_FOLLOWS) || '[]');
  items.push({ id, followerUserId: userId, targetType, targetId });
  localStorage.setItem(LOCAL_FOLLOWS, JSON.stringify(items));
}

export async function unfollowTarget(id: string): Promise<void> {
  if (isFirebaseConfigured()) {
    await deleteDoc(doc(getFirestoreInstance(), 'follows', id));
    return;
  }
  const items = JSON.parse(localStorage.getItem(LOCAL_FOLLOWS) || '[]').filter((f: { id: string }) => f.id !== id);
  localStorage.setItem(LOCAL_FOLLOWS, JSON.stringify(items));
}

export async function fetchFollowing(userId: string): Promise<string[]> {
  if (isFirebaseConfigured()) {
    const snap = await getDocs(
      query(collection(getFirestoreInstance(), 'follows'), where('followerUserId', '==', userId))
    );
    return snap.docs.map(d => d.data().targetId as string);
  }
  return JSON.parse(localStorage.getItem(LOCAL_FOLLOWS) || '[]').map((f: { targetId: string }) => f.targetId);
}
