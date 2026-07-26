import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Personal lists for cultural agents (analysis 2.2).
 * Default presets: Contrataria, Curadoria, Compraria obras, Referencias.
 * Users can also create fully custom lists.
 */

export const ListPreset = z.enum([
  'contrataria',
  'curadoria',
  'compraria_obra',
  'referencias',
  'custom',
]);
export type ListPreset = z.infer<typeof ListPreset>;

export const ListTargetType = z.enum(['agent', 'work', 'space', 'event']);
export type ListTargetType = z.infer<typeof ListTargetType>;

export const List = z.object({
  id: Id,
  ownerUserId: Id,
  name: z.string().min(1).max(80),
  preset: ListPreset.default('custom'),
  description: z.string().max(500).default(''),
  isPublic: z.boolean().default(false),
  coverUrl: z.url().nullable(),
  itemCount: z.number().int().nonnegative().default(0),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type List = z.infer<typeof List>;

export const ListItem = z.object({
  id: Id,
  listId: Id,
  targetType: ListTargetType,
  targetId: Id,
  note: z.string().max(500).default(''),
  orderIndex: z.number().int().default(0),
  addedAt: IsoDate,
});
export type ListItem = z.infer<typeof ListItem>;
