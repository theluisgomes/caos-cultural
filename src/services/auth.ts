import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getAuthInstance, isFirebaseConfigured } from '../lib/firebase';

export { isFirebaseConfigured };

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(getAuthInstance(), email, password);
  return cred.user;
}

export async function registerWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
  return cred.user;
}

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const auth = getAuthInstance();
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (err: unknown) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code ?? '')
        : '';

    // In embedded/dev environments popup can fail even when Google auth is correctly configured.
    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(getAuthInstance());
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  if (!isFirebaseConfigured()) return null;
  return getAuthInstance().currentUser;
}
