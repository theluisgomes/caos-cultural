import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * User = the authentication identity.
 * A User MAY own an Agent profile (artistic/professional persona).
 * Keep this lean — user-facing artistic fields live on Agent.
 */

export const TrustTier = z.enum([
  'unverified',
  'email',
  'document',
  'document_and_face',
]);
export type TrustTier = z.infer<typeof TrustTier>;

export const UserRole = z.enum(['member', 'admin', 'moderator']);
export type UserRole = z.infer<typeof UserRole>;

export const User = z.object({
  id: Id,
  email: z.email().nullable(),
  phone: z.string().nullable(),
  displayName: z.string().min(1).max(80),
  handle: z.string().regex(/^@?[a-zA-Z0-9_.]{2,30}$/),
  avatarUrl: z.url().nullable(),
  coverUrl: z.url().nullable(),
  bio: z.string().max(500).default(''),
  locationLabel: z.string().nullable(),
  primaryCity: z.string().nullable(),
  primaryState: z.string().nullable(),
  primaryCountry: z.string().default('BR'),
  trustTier: TrustTier.default('unverified'),
  role: UserRole.default('member'),
  agentId: Id.nullable(),
  preferences: z
    .object({
      language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
      pushEnabled: z.boolean().default(true),
      emailEnabled: z.boolean().default(true),
    })
    .default({
      language: 'pt-BR',
      pushEnabled: true,
      emailEnabled: true,
    }),
  createdAt: IsoDate,
  updatedAt: IsoDate,
  lastSeenAt: IsoDate.nullable(),
});
export type User = z.infer<typeof User>;
