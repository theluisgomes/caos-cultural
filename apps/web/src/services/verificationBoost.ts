import { doc, setDoc } from 'firebase/firestore';
import { Verification, type Verification as VerificationT } from '../domain/verification';
import { Boost, type Boost as BoostT } from '../domain/boost';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { prepareWrite } from '../lib/firestore';

function maskDocument(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export async function submitVerification(input: {
  userId: string;
  documentNumber: string;
}): Promise<VerificationT> {
  const digits = input.documentNumber.replace(/\D/g, '');
  const kind = digits.length > 11 ? 'cnpj' : 'cpf';
  const now = new Date().toISOString();
  const verification: VerificationT = {
    id: `ver_${input.userId}`,
    userId: input.userId,
    kind,
    status: 'submitted',
    maskedValue: maskDocument(digits),
    documentRef: null,
    documentAiJobId: null,
    rejectionReason: null,
    submittedAt: now,
    verifiedAt: null,
    expiresAt: null,
  };

  Verification.parse(verification);

  if (isFirebaseConfigured()) {
    await setDoc(
      doc(getFirestoreInstance(), 'verifications', verification.id),
      prepareWrite(Verification, verification),
      { merge: true }
    );
  } else {
    localStorage.setItem(
      `caos_verification_${input.userId}`,
      JSON.stringify(verification)
    );
  }

  return verification;
}

export async function createBoost(input: {
  actorUserId: string;
  targetType: BoostT['targetType'];
  targetId: string;
  budgetBRL: number;
}): Promise<BoostT> {
  const now = new Date();
  const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const id = `boost_${now.getTime()}`;
  const boost: BoostT = {
    id,
    actorUserId: input.actorUserId,
    targetType: input.targetType,
    targetId: input.targetId,
    budgetBRL: input.budgetBRL,
    spentBRL: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    targetAudience: {
      cities: [],
      disciplines: [],
      ageRanges: [],
      radiusKm: null,
    },
    status: 'pending_payment',
    startsAt: now.toISOString(),
    endsAt: ends.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  Boost.parse(boost);

  if (isFirebaseConfigured()) {
    await setDoc(
      doc(getFirestoreInstance(), 'boosts', id),
      prepareWrite(Boost, boost),
      { merge: true }
    );
  } else {
    const key = `caos_boosts_${input.actorUserId}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([boost, ...items]));
  }

  return boost;
}
