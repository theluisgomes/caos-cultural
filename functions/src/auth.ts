import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

function handleFromEmail(email: string): string {
  const local = email.split('@')[0] || 'user';
  return `@${local.replace(/[^a-zA-Z0-9_.]/g, '_').slice(0, 24)}`;
}

/** Creates `users/{uid}` when a Firebase Auth account is first created (Gen2). */
export const upsertUserOnLogin = beforeUserCreated(async event => {
  const user = event.data;
  if (!user?.uid) return;

  const email = user.email ?? '';
  const name = user.displayName?.trim() || (email ? email.split('@')[0] : 'Usuário');
  const now = new Date().toISOString();

  await db.collection('users').doc(user.uid).set(
    {
      id: user.uid,
      email,
      name,
      handle: email ? handleFromEmail(email) : `@user_${user.uid.slice(0, 8)}`,
      role: 'VISITOR',
      bio: '',
      location: '',
      avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
      coverUrl: 'https://picsum.photos/seed/cover_new/1200/400',
      disciplines: [],
      stats: { followers: 0, following: 0, eventsAttended: 0, projectsCreated: 0 },
      joinDate: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      trustTier: 'email',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  logger.info('User document created via auth trigger', { uid: user.uid });
});
