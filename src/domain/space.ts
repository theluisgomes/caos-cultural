import { z } from 'zod';
import { Address, GeoPoint, Id, IsoDate, Slug } from './common';

/**
 * Space = cultural venue (Jornada 3 do usuario).
 * Represents galleries, bars with live music, museums, studios, theaters, etc.
 */

export const SpaceKind = z.enum([
  'bar_live_music',
  'club',
  'gallery',
  'museum',
  'theater',
  'studio',
  'concert_hall',
  'cultural_center',
  'residency',
  'bookstore',
  'cinema',
  'rehearsal_space',
  'open_air',
  'other',
]);
export type SpaceKind = z.infer<typeof SpaceKind>;

export const Space = z.object({
  id: Id,
  slug: Slug,
  ownerAgentId: Id.nullable(),
  managerUserIds: z.array(Id).default([]),
  name: z.string().min(1).max(120),
  kind: SpaceKind,
  description: z.string().max(4000).default(''),
  address: Address,
  geo: GeoPoint.nullable(),
  capacity: z.number().int().positive().nullable(),
  amenities: z.array(z.string()).default([]),
  priceRange: z.enum(['free', 'low', 'mid', 'high']).nullable(),
  openingHours: z
    .object({
      mon: z.string().nullable(),
      tue: z.string().nullable(),
      wed: z.string().nullable(),
      thu: z.string().nullable(),
      fri: z.string().nullable(),
      sat: z.string().nullable(),
      sun: z.string().nullable(),
    })
    .partial()
    .default({}),
  contact: z
    .object({
      phone: z.string().nullable(),
      email: z.email().nullable(),
      website: z.url().nullable(),
    })
    .partial()
    .default({}),
  coverUrl: z.url().nullable(),
  images: z.array(z.url()).default([]),
  tags: z.array(z.string()).default([]),
  isVerified: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Space = z.infer<typeof Space>;
