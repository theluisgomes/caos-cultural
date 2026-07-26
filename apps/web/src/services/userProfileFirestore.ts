import type { User as FirebaseUser } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { AgentKind } from '../domain/agent';
import type { User as DomainUser } from '../domain/user';
import type { UserProfile } from '../types';
import { getAgent, getAgentByOwner, slugify, upsertAgent } from './repos/agentsRepo';
import { getUserLenient, upsertUser } from './repos/usersRepo';
import {
  agentKindFromUiRole,
  domainUserToProfile,
  profileToDomainPatch,
} from './userMappers';

function handleFromEmail(email: string): string {
  const local = email.split('@')[0] || 'user';
  const safe = local.replace(/[^a-zA-Z0-9_.]/g, '_').slice(0, 24);
  return `@${safe}`;
}

/**
 * Ensures `users/{uid}` exists (canonical User shape).
 * Cloud Function `upsertUserOnLogin` also creates the doc; this is a client fallback
 * and light provider-field sync.
 */
export async function ensureUserDocument(
  db: Firestore,
  fbUser: FirebaseUser
): Promise<void> {
  const existing = await getUserLenient(db, fbUser.uid);
  const email = fbUser.email ?? '';
  const baseName =
    fbUser.displayName?.trim() ||
    (email ? email.split('@')[0] : 'Usuário');
  const now = new Date().toISOString();

  if (!existing) {
    const user: DomainUser = {
      id: fbUser.uid,
      email: email || null,
      phone: null,
      displayName: baseName,
      handle: email ? handleFromEmail(email) : `@user_${fbUser.uid.slice(0, 8)}`,
      avatarUrl:
        fbUser.photoURL ||
        `https://picsum.photos/seed/${encodeURIComponent(fbUser.uid)}/200/200`,
      coverUrl: 'https://picsum.photos/seed/cover_new/1200/400',
      bio: '',
      locationLabel: null,
      primaryCity: null,
      primaryState: null,
      primaryCountry: 'BR',
      trustTier: email ? 'email' : 'unverified',
      role: 'member',
      agentId: null,
      preferences: {
        language: 'pt-BR',
        pushEnabled: true,
        emailEnabled: true,
      },
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    };
    await upsertUser(db, user);
    return;
  }

  const patch: DomainUser = {
    ...existing,
    email: email || existing.email,
    updatedAt: now,
    lastSeenAt: now,
  };
  if (fbUser.photoURL) {
    const current = existing.avatarUrl;
    if (!current || current.includes('picsum.photos')) {
      patch.avatarUrl = fbUser.photoURL;
    }
  }
  await upsertUser(db, patch);
}

export async function loadUserProfile(
  db: Firestore,
  uid: string
): Promise<UserProfile | null> {
  const user = await getUserLenient(db, uid);
  if (!user) return null;

  let agentKind: AgentKind | null = null;
  let disciplines: string[] = [];
  if (user.agentId) {
    const agent = await getAgent(db, user.agentId);
    if (agent) {
      agentKind = agent.kind;
      disciplines = agent.disciplines;
    }
  } else {
    const agent = await getAgentByOwner(db, uid);
    if (agent) {
      agentKind = agent.kind;
      disciplines = agent.disciplines;
    }
  }

  return domainUserToProfile(user, { agentKind, disciplines });
}

export async function saveUserProfile(
  db: Firestore,
  profile: UserProfile
): Promise<UserProfile> {
  const existing = await getUserLenient(db, profile.id);
  const domain = profileToDomainPatch(profile, existing);

  const kind =
    (profile.agentKind as AgentKind | null | undefined) ||
    agentKindFromUiRole(profile.role);

  const now = new Date().toISOString();
  let agentId = domain.agentId;

  if (!agentId) {
    agentId = `agent_${profile.id}`;
    await upsertAgent(db, {
      id: agentId,
      ownerUserId: profile.id,
      kind,
      displayName: profile.name || 'Usuário',
      slug: slugify(profile.handle.replace(/^@/, '') || profile.name || profile.id),
      tagline: '',
      bio: profile.bio || '',
      manifesto: '',
      disciplines: profile.disciplines || [],
      techniques: [],
      professions: [],
      languages: ['pt-BR'],
      city: null,
      state: null,
      country: 'BR',
      neighborhood: null,
      identity: {},
      socialLinks: {
        instagram: profile.socialLinks?.instagram ?? undefined,
        portfolio: profile.socialLinks?.portfolio ?? undefined,
      },
      avatarUrl: profile.avatarUrl || null,
      coverUrl: profile.coverUrl || null,
      portfolioImages: [],
      isPublic: true,
      isVerified: false,
      acceptsCommissions: false,
      acceptsBookings: false,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    const agent = await getAgent(db, agentId);
    if (agent) {
      await upsertAgent(db, {
        ...agent,
        kind,
        displayName: profile.name || agent.displayName,
        bio: profile.bio || agent.bio,
        disciplines: profile.disciplines?.length ? profile.disciplines : agent.disciplines,
        avatarUrl: profile.avatarUrl || agent.avatarUrl,
        coverUrl: profile.coverUrl || agent.coverUrl,
        updatedAt: now,
      });
    }
  }

  domain.agentId = agentId;
  // Never allow client to self-elevate platform role
  if (existing?.role === 'super_admin') {
    domain.role = 'super_admin';
  } else if (domain.role !== 'member' && domain.role !== existing?.role) {
    domain.role = existing?.role ?? 'member';
  } else if (!existing) {
    domain.role = 'member';
  }

  await upsertUser(db, domain);
  return domainUserToProfile(domain, {
    agentKind: kind,
    disciplines: profile.disciplines,
    stats: profile.stats,
    socialLinks: profile.socialLinks,
    joinDate: profile.joinDate,
  });
}
