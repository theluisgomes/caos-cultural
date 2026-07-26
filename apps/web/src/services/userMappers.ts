/**
 * UI DTO mappers between domain User/Agent and legacy UserProfile.
 * Listing remains a feed DTO — not a Firestore shape.
 */

import type { AgentKind } from '../domain/agent';
import type { User as DomainUser } from '../domain/user';
import type { UserProfile } from '../types';

export type PersonaUiRole = UserProfile['role'];

const KIND_TO_UI: Record<AgentKind, PersonaUiRole> = {
  artist: 'ARTIST',
  producer: 'ORGANIZER',
  curator: 'ORGANIZER',
  collector: 'VISITOR',
  collective: 'ORGANIZER',
  band: 'ARTIST',
  project: 'ORGANIZER',
  designer: 'VISITOR',
  space_manager: 'ORGANIZER',
  public: 'VISITOR',
};

const UI_TO_KIND: Partial<Record<PersonaUiRole, AgentKind>> = {
  ARTIST: 'artist',
  ORGANIZER: 'producer',
  VISITOR: 'public',
};

export function agentKindFromUiRole(role: PersonaUiRole): AgentKind {
  if (role === 'SUPER_ADMIN') return 'public';
  return UI_TO_KIND[role] ?? 'public';
}

export function uiRoleFromAgentKind(kind: AgentKind | null | undefined): PersonaUiRole {
  if (!kind) return 'VISITOR';
  return KIND_TO_UI[kind] ?? 'VISITOR';
}

export function domainUserToProfile(
  user: DomainUser,
  extras?: {
    agentKind?: AgentKind | null;
    disciplines?: string[];
    stats?: UserProfile['stats'];
    socialLinks?: UserProfile['socialLinks'];
    joinDate?: string;
  }
): UserProfile {
  const platform = user.role;
  const personaRole: PersonaUiRole =
    platform === 'super_admin'
      ? 'SUPER_ADMIN'
      : uiRoleFromAgentKind(extras?.agentKind);

  return {
    id: user.id,
    name: user.displayName,
    email: user.email ?? undefined,
    handle: user.handle,
    role: personaRole,
    bio: user.bio,
    location: user.locationLabel ?? '',
    avatarUrl: user.avatarUrl ?? `https://picsum.photos/seed/${user.id}/200/200`,
    coverUrl: user.coverUrl ?? 'https://picsum.photos/seed/cover_new/1200/400',
    disciplines: extras?.disciplines ?? [],
    stats: extras?.stats ?? {
      followers: 0,
      following: 0,
      eventsAttended: 0,
      projectsCreated: 0,
    },
    socialLinks: extras?.socialLinks,
    joinDate:
      extras?.joinDate ??
      new Date(user.createdAt).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      }),
    agentId: user.agentId,
    agentKind: extras?.agentKind ?? null,
    platformRole: platform,
  };
}

export function profileToDomainPatch(
  profile: UserProfile,
  existing: DomainUser | null
): DomainUser {
  const now = new Date().toISOString();
  let platformRole: DomainUser['role'] = existing?.role ?? 'member';
  if (profile.platformRole) {
    platformRole = profile.platformRole;
  } else if (profile.role === 'SUPER_ADMIN') {
    platformRole = 'super_admin';
  }

  return {
    id: profile.id,
    email: profile.email ?? existing?.email ?? null,
    phone: existing?.phone ?? null,
    displayName: profile.name || existing?.displayName || 'Usuário',
    handle: profile.handle || existing?.handle || '@user',
    avatarUrl: emptyToNull(profile.avatarUrl) || existing?.avatarUrl || null,
    coverUrl: emptyToNull(profile.coverUrl) || existing?.coverUrl || null,
    bio: profile.bio ?? existing?.bio ?? '',
    locationLabel: profile.location || existing?.locationLabel || null,
    primaryCity: existing?.primaryCity ?? null,
    primaryState: existing?.primaryState ?? null,
    primaryCountry: existing?.primaryCountry ?? 'BR',
    trustTier: existing?.trustTier ?? 'unverified',
    role: platformRole,
    agentId: profile.agentId ?? existing?.agentId ?? null,
    preferences: existing?.preferences ?? {
      language: 'pt-BR',
      pushEnabled: true,
      emailEnabled: true,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastSeenAt: existing?.lastSeenAt ?? null,
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  return value;
}
