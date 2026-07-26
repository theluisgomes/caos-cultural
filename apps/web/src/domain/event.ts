import { z } from 'zod';
import { GeoPoint, Id, IsoDate, Slug } from './common';

/**
 * Event = a cultural happening (Jornada 1 do usuario).
 * Connects to Spaces and Agents (organizers + featured agents).
 */

export const EventKind = z.enum([
  'show',
  'exhibition',
  'play',
  'workshop',
  'talk',
  'festival',
  'film_screening',
  'performance',
  'party',
  'book_launch',
  'residency',
  'other',
]);
export type EventKind = z.infer<typeof EventKind>;

export const Ticketing = z.object({
  isFree: z.boolean().default(false),
  priceFromBRL: z.number().nonnegative().nullable(),
  priceToBRL: z.number().nonnegative().nullable(),
  externalUrl: z.url().nullable(),
  soldInternally: z.boolean().default(false),
  capacity: z.number().int().positive().nullable(),
  ticketsSold: z.number().int().nonnegative().default(0),
});
export type Ticketing = z.infer<typeof Ticketing>;

export const Event = z.object({
  id: Id,
  slug: Slug,
  title: z.string().min(1).max(160),
  kind: EventKind,
  subtitle: z.string().max(240).default(''),
  description: z.string().max(8000).default(''),
  coverUrl: z.url().nullable(),
  images: z.array(z.url()).default([]),
  startsAt: IsoDate,
  endsAt: IsoDate.nullable(),
  timezone: z.string().default('America/Sao_Paulo'),
  spaceId: Id.nullable(),
  locationLabel: z.string().nullable(),
  geo: GeoPoint.nullable(),
  organizerAgentIds: z.array(Id).default([]),
  featuredAgentIds: z.array(Id).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  ticketing: Ticketing,
  ageRating: z.enum(['free', '12', '14', '16', '18']).nullable(),
  isPublished: z.boolean().default(false),
  isCancelled: z.boolean().default(false),
  stats: z
    .object({
      saves: z.number().int().nonnegative().default(0),
      likes: z.number().int().nonnegative().default(0),
      attended: z.number().int().nonnegative().default(0),
    })
    .default({ saves: 0, likes: 0, attended: 0 }),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Event = z.infer<typeof Event>;
