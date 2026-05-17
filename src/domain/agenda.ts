import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Cultural Agenda (analysis 1.3 and 9.3).
 * Supports personal, shared (collaborative with friends), and public
 * agendas (artists / bands / influencers sharing their cultural life).
 */

export const AgendaVisibility = z.enum(['private', 'shared', 'public']);
export type AgendaVisibility = z.infer<typeof AgendaVisibility>;

export const AgendaMemberRole = z.enum(['owner', 'editor', 'viewer']);
export type AgendaMemberRole = z.infer<typeof AgendaMemberRole>;

export const AgendaMember = z.object({
  userId: Id,
  role: AgendaMemberRole,
  addedAt: IsoDate,
});
export type AgendaMember = z.infer<typeof AgendaMember>;

export const Agenda = z.object({
  id: Id,
  ownerUserId: Id,
  name: z.string().min(1).max(80),
  description: z.string().max(500).default(''),
  visibility: AgendaVisibility.default('private'),
  members: z.array(AgendaMember).default([]),
  coverUrl: z.url().nullable(),
  itemCount: z.number().int().nonnegative().default(0),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Agenda = z.infer<typeof Agenda>;

export const AgendaItemStatus = z.enum([
  'interested',
  'going',
  'attended',
  'skipped',
]);
export type AgendaItemStatus = z.infer<typeof AgendaItemStatus>;

export const AgendaItem = z.object({
  id: Id,
  agendaId: Id,
  addedByUserId: Id,
  eventId: Id.nullable(),
  customTitle: z.string().nullable(),
  customLocation: z.string().nullable(),
  startsAt: IsoDate,
  endsAt: IsoDate.nullable(),
  status: AgendaItemStatus.default('interested'),
  notes: z.string().max(1000).default(''),
  reminderMinutesBefore: z.number().int().nonnegative().nullable(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type AgendaItem = z.infer<typeof AgendaItem>;

export const AgendaInvite = z.object({
  id: Id,
  agendaId: Id,
  invitedUserId: Id,
  invitedByUserId: Id,
  role: AgendaMemberRole,
  status: z.enum(['pending', 'accepted', 'declined']).default('pending'),
  createdAt: IsoDate,
  respondedAt: IsoDate.nullable(),
});
export type AgendaInvite = z.infer<typeof AgendaInvite>;
