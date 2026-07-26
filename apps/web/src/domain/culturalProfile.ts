import { z } from 'zod';
import { Id, IsoDate, Slug } from './common';

/**
 * CulturalProfile = permanent cultural brand / series (ex.: Festival Afluentes).
 * Individual dated occurrences live in `events` with optional `profileId`.
 */

export const CulturalProfile = z.object({
  id: Id,
  slug: Slug,
  name: z.string().min(1).max(160),
  tagline: z.string().max(240).default(''),
  description: z.string().max(8000).default(''),
  coverUrl: z.url().nullable(),
  ownerAgentId: Id.nullable(),
  managerUserIds: z.array(Id).default([]),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type CulturalProfile = z.infer<typeof CulturalProfile>;
