import { collection, getDocs, query, where } from 'firebase/firestore';
import type { InteractionTargetType } from '../domain/interaction';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';

/**
 * Métricas por projeto (estudo: "visualizações, curtidas, compartilhamentos").
 * Agregadas a partir da coleção `interactions`; sem Firebase, lê o espelho
 * local usado por `services/interactions.ts`.
 */

export interface TargetMetrics {
  views: number;
  likes: number;
  saves: number;
  shares: number;
}

const EMPTY: TargetMetrics = { views: 0, likes: 0, saves: 0, shares: 0 };
const LOCAL_KEY = 'caos_interactions';

function tally(kinds: string[]): TargetMetrics {
  return kinds.reduce<TargetMetrics>(
    (acc, kind) => {
      if (kind === 'visit') acc.views += 1;
      else if (kind === 'like') acc.likes += 1;
      else if (kind === 'unlike') acc.likes = Math.max(0, acc.likes - 1);
      else if (kind === 'save') acc.saves += 1;
      else if (kind === 'unsave') acc.saves = Math.max(0, acc.saves - 1);
      else if (kind === 'share') acc.shares += 1;
      return acc;
    },
    { ...EMPTY }
  );
}

export async function fetchTargetMetrics(
  targetType: InteractionTargetType,
  targetId: string
): Promise<TargetMetrics> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(
        query(
          collection(getFirestoreInstance(), 'interactions'),
          where('targetType', '==', targetType),
          where('targetId', '==', targetId)
        )
      );
      return tally(snap.docs.map(d => d.data().kind as string));
    } catch {
      return { ...EMPTY };
    }
  }

  try {
    const local: Array<{ kind: string; targetType: string; targetId: string }> = JSON.parse(
      localStorage.getItem(LOCAL_KEY) || '[]'
    );
    return tally(
      local.filter(i => i.targetType === targetType && i.targetId === targetId).map(i => i.kind)
    );
  } catch {
    return { ...EMPTY };
  }
}
