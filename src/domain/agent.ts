import { z } from 'zod';
import { Id, IsoDate, Slug, SocialLinks } from './common';

/**
 * Agent = the artistic / professional public persona.
 * Corresponds to analysis section 5.2 (profile segmentation) and section 2
 * (Jornada do usuario - Agentes Culturais).
 *
 * AgentKind enumerates the profile types described in the analysis:
 * Produtor, Curador, Colecionador, Artista, Projeto, Banda, Coletivo,
 * Designer, Publico geral. We also include `space_manager` for agents
 * that run a cultural space.
 */

export const AgentKind = z.enum([
  'artist',
  'producer',
  'curator',
  'collector',
  'collective',
  'band',
  'project',
  'designer',
  'space_manager',
  'public',
]);
export type AgentKind = z.infer<typeof AgentKind>;

/**
 * Identity attributes used by the pro-grade filter (analysis 2.3).
 * All fields are optional and free-form where possible to remain inclusive.
 */
export const AgentIdentity = z.object({
  ageRange: z
    .enum(['under_18', '18_24', '25_34', '35_44', '45_plus'])
    .nullable(),
  gender: z.string().nullable(),
  race: z.string().nullable(),
  sexuality: z.string().nullable(),
  pronouns: z.string().nullable(),
});
export type AgentIdentity = z.infer<typeof AgentIdentity>;

export const Agent = z.object({
  id: Id,
  ownerUserId: Id,
  kind: AgentKind,
  displayName: z.string().min(1).max(120),
  slug: Slug,
  tagline: z.string().max(160).default(''),
  bio: z.string().max(2000).default(''),
  manifesto: z.string().max(4000).default(''),
  disciplines: z.array(z.string()).default([]),
  techniques: z.array(z.string()).default([]),
  professions: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().default('BR'),
  neighborhood: z.string().nullable(),
  identity: AgentIdentity.partial().default({}),
  socialLinks: SocialLinks.partial().default({}),
  avatarUrl: z.url().nullable(),
  coverUrl: z.url().nullable(),
  portfolioImages: z.array(z.url()).default([]),
  isPublic: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  acceptsCommissions: z.boolean().default(false),
  acceptsBookings: z.boolean().default(false),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Agent = z.infer<typeof Agent>;
