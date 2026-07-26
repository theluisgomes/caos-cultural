import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { Agent, type Agent as AgentT } from '../../domain/agent';
import { parseDoc, prepareWrite } from '../../lib/firestore';

const COL = 'agents';

export async function getAgent(db: Firestore, id: string): Promise<AgentT | null> {
  return parseDoc(Agent, await getDoc(doc(db, COL, id)));
}

export async function getAgentByOwner(
  db: Firestore,
  ownerUserId: string
): Promise<AgentT | null> {
  const snap = await getDocs(
    query(collection(db, COL), where('ownerUserId', '==', ownerUserId))
  );
  const first = snap.docs[0];
  return first ? parseDoc(Agent, first) : null;
}

export async function upsertAgent(db: Firestore, agent: AgentT): Promise<void> {
  const payload = prepareWrite(Agent, agent);
  await setDoc(doc(db, COL, agent.id), payload, { merge: true });
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'agent';
}
