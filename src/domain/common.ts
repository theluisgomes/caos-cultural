import { z } from 'zod';

/**
 * Shared primitives used across domain aggregates.
 *
 * Timestamps are stored as ISO 8601 strings in application code.
 * A small adapter in `src/lib/firestore.ts` (Phase 0.3) will convert to/from
 * Firestore `Timestamp` objects at the persistence boundary.
 */

export const IsoDate = z.iso.datetime({ offset: true });
export type IsoDate = z.infer<typeof IsoDate>;

export const Id = z.string().min(1);
export type Id = z.infer<typeof Id>;

export const Slug = z.string().regex(/^[a-z0-9][a-z0-9-_]*$/);
export type Slug = z.infer<typeof Slug>;

export const GeoPoint = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});
export type GeoPoint = z.infer<typeof GeoPoint>;

export const Address = z.object({
  street: z.string().nullable(),
  number: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string().default('BR'),
  postalCode: z.string().nullable(),
});
export type Address = z.infer<typeof Address>;

export const SocialLinks = z.object({
  instagram: z.url().nullable().optional(),
  portfolio: z.url().nullable().optional(),
  website: z.url().nullable().optional(),
  spotify: z.url().nullable().optional(),
  soundcloud: z.url().nullable().optional(),
  youtube: z.url().nullable().optional(),
  bandcamp: z.url().nullable().optional(),
  behance: z.url().nullable().optional(),
});
export type SocialLinks = z.infer<typeof SocialLinks>;

export const Media = z.object({
  url: z.url(),
  storagePath: z.string().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  alt: z.string().nullable(),
});
export type Media = z.infer<typeof Media>;
