import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance, isFirebaseConfigured } from '../lib/firebase';

export interface SeedResult {
  agents: number;
  spaces: number;
  events: number;
  works: number;
  gemini?: boolean;
}

/** Admin-gated callable to populate Firestore with cultural seed data. */
export async function seedCulturalData(): Promise<SeedResult> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.');
  }
  const fn = httpsCallable<undefined, SeedResult>(getFunctionsInstance(), 'seedCulturalData');
  const result = await fn();
  return result.data;
}
