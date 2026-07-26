import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Work (Obra) = a concrete piece of art authored by an Agent.
 * First-class entity so users can browse, save, and acquire works
 * independently of the artist page (analysis section 4).
 */

export const WorkMedium = z.enum([
  'painting',
  'photography',
  'sculpture',
  'illustration',
  'digital',
  'video',
  'installation',
  'music',
  'performance',
  'text',
  'design',
  'mixed_media',
  'other',
]);
export type WorkMedium = z.infer<typeof WorkMedium>;

export const Work = z.object({
  id: Id,
  authorAgentId: Id,
  title: z.string().min(1).max(160),
  description: z.string().max(4000).default(''),
  medium: WorkMedium,
  technique: z.string().nullable(),
  year: z.number().int().nullable(),
  dimensions: z.string().nullable(),
  durationSeconds: z.number().int().positive().nullable(),
  coverUrl: z.url().nullable(),
  images: z.array(z.url()).default([]),
  audioUrl: z.url().nullable(),
  videoUrl: z.url().nullable(),
  editionOf: z.number().int().positive().nullable(),
  priceBRL: z.number().nonnegative().nullable(),
  isForSale: z.boolean().default(false),
  isSold: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  stats: z
    .object({
      saves: z.number().int().nonnegative().default(0),
      likes: z.number().int().nonnegative().default(0),
      views: z.number().int().nonnegative().default(0),
    })
    .default({ saves: 0, likes: 0, views: 0 }),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Work = z.infer<typeof Work>;
