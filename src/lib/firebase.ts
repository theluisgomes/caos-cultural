import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

/**
 * Firebase / Google Cloud client bootstrap.
 *
 * Set `VITE_FIREBASE_*` in `.env.local` (see `.env.example`).
 * When any required variable is missing, `isFirebaseConfigured()` is false
 * and the app falls back to `mockAuth` so local development still works.
 *
 * Cloud Functions region matches the project plan: `southamerica-east1`.
 */

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function isFirebaseConfigured(): boolean {
  const env = import.meta.env;
  return REQUIRED_KEYS.every(k => {
    const v = env[k as keyof ImportMetaEnv] as string | undefined;
    return typeof v === 'string' && v.length > 0;
  });
}

let appInstance: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env.local and fill VITE_FIREBASE_* values from the Firebase console.'
    );
  }
  if (!appInstance) {
    const env = import.meta.env;
    appInstance =
      getApps().length > 0
        ? getApps()[0]!
        : initializeApp({
            apiKey: env.VITE_FIREBASE_API_KEY,
            authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: env.VITE_FIREBASE_APP_ID,
            measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
          });
  }
  return appInstance;
}

export function getAuthInstance(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirestoreInstance(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getStorageInstance(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

/** Callable / HTTPS triggers in `southamerica-east1` (Phase 0.4 seed, etc.) */
export function getFunctionsInstance(): Functions {
  return getFunctions(getFirebaseApp(), 'southamerica-east1');
}

let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Google Analytics (Firebase). Só disponível no browser e quando o SDK é suportado.
 * Use depois de `measurementId` estar em `VITE_FIREBASE_MEASUREMENT_ID`.
 */
export function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  const env = import.meta.env;
  if (!env.VITE_FIREBASE_MEASUREMENT_ID) return Promise.resolve(null);
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const supported = await isSupported();
      if (!supported) return null;
      return getAnalytics(getFirebaseApp());
    })();
  }
  return analyticsPromise;
}
