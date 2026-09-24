import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Feed de atividades — "Feed ≠ CAOS" (estudo p. 5).
 * Derivado de dados existentes (novos listings de perfis/espaços seguidos,
 * itens de agenda públicos). Posts manuais ficam para o próximo momento.
 */

export const ActivityKind = z.enum([
  'new_event',
  'new_work',
  'new_space',
  'new_agent',
  'agenda_public',
]);
export type ActivityKind = z.infer<typeof ActivityKind>;

export const ActivityFilter = z.enum(['all', 'people', 'spaces', 'events']);
export type ActivityFilter = z.infer<typeof ActivityFilter>;

export const ActivityItem = z.object({
  id: Id,
  kind: ActivityKind,
  /** Quem gerou a atividade (agente, espaço ou perfil). */
  actorId: Id,
  actorName: z.string().min(1),
  actorAvatarUrl: z.string().nullable(),
  /** Item referenciado (evento, obra, espaço...). */
  targetId: Id,
  targetTitle: z.string().min(1),
  targetSubtitle: z.string().default(''),
  targetImageUrl: z.string().nullable(),
  /** Rota interna para abrir o item. */
  targetHref: z.string().min(1),
  filter: ActivityFilter,
  message: z.string().min(1),
  /** Verdadeiro quando vem de alguém que o usuário segue. */
  fromFollowing: z.boolean().default(false),
  createdAt: IsoDate,
});
export type ActivityItem = z.infer<typeof ActivityItem>;
