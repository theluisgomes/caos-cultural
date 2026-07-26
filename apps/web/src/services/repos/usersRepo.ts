import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';
import { User, type User as UserT } from '../../domain/user';
import { parseDoc, prepareWrite, fromFirestore } from '../../lib/firestore';

const COL = 'users';

export async function getUser(db: Firestore, id: string): Promise<UserT | null> {
  return parseDoc(User, await getDoc(doc(db, COL, id)));
}

/** Soft parse: merges legacy fields into domain User when possible. */
export async function getUserLenient(db: Firestore, id: string): Promise<UserT | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  const raw = { id: snap.id, ...fromFirestore(snap.data()!) };
  const normalized = normalizeLegacyUser(raw);
  const parsed = User.safeParse(normalized);
  if (parsed.success) return parsed.data;
  console.warn('[usersRepo] lenient parse failed', parsed.error.flatten());
  return null;
}

export async function upsertUser(db: Firestore, user: UserT): Promise<void> {
  const payload = prepareWrite(User, user);
  await setDoc(doc(db, COL, user.id), payload, { merge: true });
}

export function normalizeLegacyUser(raw: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();
  const displayName =
    (raw.displayName as string) ||
    (raw.name as string) ||
    'Usuário';

  let role = raw.role;
  if (raw.adminRole === 'super_admin' || role === 'SUPER_ADMIN' || role === 'super_admin') {
    role = 'super_admin';
  } else if (
    role === 'ARTIST' ||
    role === 'ORGANIZER' ||
    role === 'VISITOR' ||
    role === 'member' ||
    role === 'admin' ||
    role === 'moderator'
  ) {
    role =
      role === 'ARTIST' || role === 'ORGANIZER' || role === 'VISITOR' ? 'member' : role;
  } else {
    role = 'member';
  }

  return {
    id: raw.id,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    displayName,
    handle: (raw.handle as string) || '@user',
    avatarUrl: emptyToNull(raw.avatarUrl as string | null | undefined),
    coverUrl: emptyToNull(raw.coverUrl as string | null | undefined),
    bio: (raw.bio as string) ?? '',
    locationLabel: (raw.locationLabel as string) ?? (raw.location as string) ?? null,
    primaryCity: raw.primaryCity ?? null,
    primaryState: raw.primaryState ?? null,
    primaryCountry: raw.primaryCountry ?? 'BR',
    trustTier: raw.trustTier ?? 'unverified',
    role,
    agentId: raw.agentId ?? null,
    preferences: raw.preferences ?? {
      language: 'pt-BR',
      pushEnabled: true,
      emailEnabled: true,
    },
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    lastSeenAt: raw.lastSeenAt ?? null,
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  return value;
}
