import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Chancela institucional (estudo p. 13/15): uma instituição verificada
 * (espaço, festival, coletivo) concede um selo a um perfil ou obra.
 * Ex.: Blue Note → músico; CCBB → artista visual.
 */

export const EndorsementTargetType = z.enum(['agent', 'work', 'space', 'event']);
export type EndorsementTargetType = z.infer<typeof EndorsementTargetType>;

export const Endorsement = z.object({
  id: Id,
  /** Instituição que chancela (espaço/organização verificada). */
  issuerId: Id,
  issuerName: z.string().min(1).max(160),
  issuerLogoUrl: z.string().nullable(),
  targetType: EndorsementTargetType,
  targetId: Id,
  /** Rótulo público do selo, ex.: "Artista residente". */
  label: z.string().min(1).max(80),
  note: z.string().max(500).default(''),
  issuedAt: IsoDate,
  /** Só instituições verificadas geram selo visível. */
  issuerVerified: z.boolean().default(true),
});
export type Endorsement = z.infer<typeof Endorsement>;
