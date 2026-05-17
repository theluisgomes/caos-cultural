import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * "Turbinar" / Boost (analysis 6.5).
 * Users can impulse a work, event, or agent profile toward users whose
 * interaction embedding is close to the target. Strictly budget-bound.
 */

export const BoostTargetType = z.enum(['event', 'work', 'agent', 'space']);
export type BoostTargetType = z.infer<typeof BoostTargetType>;

export const BoostStatus = z.enum([
  'draft',
  'pending_payment',
  'active',
  'paused',
  'ended',
  'rejected',
]);
export type BoostStatus = z.infer<typeof BoostStatus>;

export const Boost = z.object({
  id: Id,
  actorUserId: Id,
  targetType: BoostTargetType,
  targetId: Id,
  budgetBRL: z.number().positive(),
  spentBRL: z.number().nonnegative().default(0),
  impressions: z.number().int().nonnegative().default(0),
  clicks: z.number().int().nonnegative().default(0),
  conversions: z.number().int().nonnegative().default(0),
  targetAudience: z
    .object({
      cities: z.array(z.string()).default([]),
      disciplines: z.array(z.string()).default([]),
      ageRanges: z.array(z.string()).default([]),
      radiusKm: z.number().positive().nullable(),
    })
    .default({
      cities: [],
      disciplines: [],
      ageRanges: [],
      radiusKm: null,
    }),
  status: BoostStatus.default('draft'),
  startsAt: IsoDate,
  endsAt: IsoDate,
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Boost = z.infer<typeof Boost>;
