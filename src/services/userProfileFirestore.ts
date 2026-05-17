import type { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { UserProfile } from '../types';

const USERS = 'users';

function handleFromEmail(email: string): string {
  const local = email.split('@')[0] || 'user';
  const safe = local.replace(/[^a-zA-Z0-9_.]/g, '_').slice(0, 24);
  return `@${safe}`;
}

function joinDateLabel(): string {
  return new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

/**
 * Creates `users/{uid}` on first sign-in, or lightly syncs provider fields.
 * In Phase 0.4 this merge logic can move to a Cloud Function `onCreate` trigger.
 */
export async function ensureUserDocument(
  db: Firestore,
  fbUser: FirebaseUser
): Promise<void> {
  const ref = doc(db, USERS, fbUser.uid);
  const snap = await getDoc(ref);
  const email = fbUser.email ?? '';
  const baseName =
    fbUser.displayName?.trim() ||
    (email ? email.split('@')[0] : 'Usuário');
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const profile: Record<string, unknown> = {
      id: fbUser.uid,
      email,
      name: baseName,
      handle: email ? handleFromEmail(email) : `@user_${fbUser.uid.slice(0, 8)}`,
      role: 'VISITOR',
      bio: '',
      location: '',
      avatarUrl:
        fbUser.photoURL ||
        `https://picsum.photos/seed/${encodeURIComponent(fbUser.uid)}/200/200`,
      coverUrl: 'https://picsum.photos/seed/cover_new/1200/400',
      disciplines: [],
      stats: {
        followers: 0,
        following: 0,
        eventsAttended: 0,
        projectsCreated: 0,
      },
      joinDate: joinDateLabel(),
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, profile);
    return;
  }

  const patch: Record<string, unknown> = {
    email,
    updatedAt: now,
  };
  if (fbUser.photoURL && typeof snap.data()?.avatarUrl === 'string') {
    const current = snap.data()?.avatarUrl as string;
    if (!current || current.includes('picsum.photos')) {
      patch.avatarUrl = fbUser.photoURL;
    }
  }
  await updateDoc(ref, patch);
}

function coerceUserProfile(data: Record<string, unknown>, uid: string): UserProfile {
  const stats = data.stats as UserProfile['stats'] | undefined;
  return {
    id: (data.id as string) || uid,
    name: (data.name as string) || 'Usuário',
    email: data.email as string | undefined,
    handle: (data.handle as string) || '@user',
    role: (data.role as UserProfile['role']) || 'VISITOR',
    bio: (data.bio as string) ?? '',
    location: (data.location as string) ?? '',
    avatarUrl: (data.avatarUrl as string) || `https://picsum.photos/seed/${uid}/200/200`,
    coverUrl: (data.coverUrl as string) || 'https://picsum.photos/seed/cover_new/1200/400',
    disciplines: Array.isArray(data.disciplines) ? (data.disciplines as string[]) : [],
    stats: stats ?? {
      followers: 0,
      following: 0,
      eventsAttended: 0,
      projectsCreated: 0,
    },
    socialLinks: data.socialLinks as UserProfile['socialLinks'],
    joinDate: (data.joinDate as string) || joinDateLabel(),
  };
}

export async function loadUserProfile(
  db: Firestore,
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return coerceUserProfile(snap.data() as Record<string, unknown>, uid);
}

export async function saveUserProfile(
  db: Firestore,
  profile: UserProfile
): Promise<void> {
  const ref = doc(db, USERS, profile.id);
  const { id, ...rest } = profile;
  void id;
  await setDoc(
    ref,
    {
      ...rest,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
