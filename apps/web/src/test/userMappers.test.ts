import { describe, expect, it } from 'vitest';
import { normalizeLegacyUser } from '../services/repos/usersRepo';
import { agentKindFromUiRole, domainUserToProfile } from '../services/userMappers';
import type { User } from '../domain/user';

describe('normalizeLegacyUser', () => {
  it('maps name and ARTIST role to displayName + member', () => {
    const normalized = normalizeLegacyUser({
      id: 'u1',
      name: 'Ana',
      handle: '@ana',
      role: 'ARTIST',
      email: 'ana@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(normalized.displayName).toBe('Ana');
    expect(normalized.role).toBe('member');
  });

  it('maps adminRole super_admin to role', () => {
    const normalized = normalizeLegacyUser({
      id: 'u2',
      displayName: 'Admin',
      handle: '@admin',
      role: 'VISITOR',
      adminRole: 'super_admin',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(normalized.role).toBe('super_admin');
  });
});

describe('userMappers', () => {
  it('maps agent kind to UI persona role', () => {
    expect(agentKindFromUiRole('ARTIST')).toBe('artist');
    const user: User = {
      id: 'u1',
      email: null,
      phone: null,
      displayName: 'Ana',
      handle: '@ana',
      avatarUrl: null,
      coverUrl: null,
      bio: '',
      locationLabel: null,
      primaryCity: null,
      primaryState: null,
      primaryCountry: 'BR',
      trustTier: 'email',
      role: 'member',
      agentId: 'agent_u1',
      preferences: { language: 'pt-BR', pushEnabled: true, emailEnabled: true },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      lastSeenAt: null,
    };
    const profile = domainUserToProfile(user, { agentKind: 'artist' });
    expect(profile.role).toBe('ARTIST');
    expect(profile.platformRole).toBe('member');
    expect(profile.name).toBe('Ana');
  });
});
