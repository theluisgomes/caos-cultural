import { z } from 'zod';
import { GeoPoint, Id, IsoDate } from './common';

/**
 * Roteiros culturais (estudo p. 16): montar o roteiro do dia/fim de semana
 * com paradas ordenadas, ver no mapa e compartilhar depois ("tipo Strava").
 */

export const RouteStopTargetType = z.enum(['space', 'event', 'agent', 'custom']);
export type RouteStopTargetType = z.infer<typeof RouteStopTargetType>;

export const RouteStop = z.object({
  id: Id,
  targetType: RouteStopTargetType,
  targetId: Id,
  label: z.string().min(1).max(160),
  subtitle: z.string().default(''),
  imageUrl: z.string().nullable(),
  geo: GeoPoint.nullable(),
  orderIndex: z.number().int().nonnegative().default(0),
  note: z.string().max(500).default(''),
});
export type RouteStop = z.infer<typeof RouteStop>;

export const CulturalRoute = z.object({
  id: Id,
  ownerUserId: Id,
  name: z.string().min(1).max(120),
  description: z.string().max(1000).default(''),
  stops: z.array(RouteStop).default([]),
  /** Rota pública gera link compartilhável. */
  isPublic: z.boolean().default(false),
  /** Convites ficam para "próximo momento"; guardamos os ids desde já. */
  invitedUserIds: z.array(Id).default([]),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type CulturalRoute = z.infer<typeof CulturalRoute>;

/** Duração estimada: 45 min por parada (heurística de UI). */
export function estimateDurationLabel(stopCount: number): string {
  const minutes = stopCount * 45;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!stopCount) return '—';
  if (!hours) return `${rest}min`;
  return rest ? `${hours}h${rest}` : `${hours}h`;
}
