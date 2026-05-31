import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import {
  getAuthInstance,
  getFirebaseApp,
  getFirestoreInstance,
  getFunctionsInstance,
  getStorageInstance,
  initFirebaseAnalytics,
  isFirebaseConfigured,
} from './firebase';
import { reportEvent } from './observability';

let initialized = false;

/**
 * Eagerly initializes Firebase App + product SDKs (Auth, Firestore, Storage,
 * Functions, Analytics). Safe to call multiple times.
 */
export async function initializeFirebaseProducts(): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    reportEvent('firebase_skipped', { reason: 'missing_env' });
    return false;
  }
  if (initialized) return true;

  getFirebaseApp();
  getAuthInstance();
  getFirestoreInstance();
  getStorageInstance();
  getFunctionsInstance();

  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    const auth = getAuth(getFirebaseApp());
    const db = getFirestore(getFirebaseApp());
    const storage = getStorage(getFirebaseApp());
    const functions = getFunctions(getFirebaseApp(), 'southamerica-east1');

    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    reportEvent('firebase_emulators_connected');
  }

  await initFirebaseAnalytics();

  initialized = true;
  reportEvent('firebase_initialized', {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    region: 'southamerica-east1',
  });
  return true;
}
