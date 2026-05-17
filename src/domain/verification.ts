import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Identity verification (analysis section 7).
 * Supports CPF (natural persons), CNPJ (orgs), document photo, and
 * optional facial match. Stored separately from `users` so security
 * rules can restrict access to privileged roles + the owner.
 */

export const VerificationKind = z.enum([
  'cpf',
  'cnpj',
  'document_photo',
  'selfie_match',
]);
export type VerificationKind = z.infer<typeof VerificationKind>;

export const VerificationStatus = z.enum([
  'pending',
  'submitted',
  'verified',
  'rejected',
]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

export const Verification = z.object({
  id: Id,
  userId: Id,
  kind: VerificationKind,
  status: VerificationStatus.default('pending'),
  /** Encrypted / masked number for cpf / cnpj. Raw value must never be stored plain. */
  maskedValue: z.string().nullable(),
  documentRef: z.string().nullable(),
  documentAiJobId: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  submittedAt: IsoDate.nullable(),
  verifiedAt: IsoDate.nullable(),
  expiresAt: IsoDate.nullable(),
});
export type Verification = z.infer<typeof Verification>;
