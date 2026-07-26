import {
  AgentKind,
  type AgentKind as AgentKindT,
} from '../domain/agent';
import type { EventKind } from '../domain/event';
import type { SpaceKind } from '../domain/space';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';
import { slugify, upsertAgent } from './repos/agentsRepo';
import { upsertEvent, upsertSpace } from './repos/contentRepo';
import { getUserLenient, upsertUser } from './repos/usersRepo';

function nowIso() {
  return new Date().toISOString();
}

function toSlug(handle: string, fallback: string): string {
  return slugify(handle.replace(/^@/, '') || fallback);
}

function optionalUrl(value: string | undefined | null): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  const withProtocol = v.startsWith('http') ? v : `https://${v}`;
  try {
    // eslint-disable-next-line no-new
    new URL(withProtocol);
    return withProtocol;
  } catch {
    return undefined;
  }
}

export async function publishAgentListing(input: {
  userId: string;
  displayName: string;
  handle: string;
  bio: string;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  kind: AgentKindT;
  disciplines: string[];
  techniques: string[];
  professions: string[];
  avatarUrl: string | null;
  social: { instagram?: string; website?: string };
}): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.');
  }
  const db = getFirestoreInstance();
  const id = `agent_${input.userId}`;
  const now = nowIso();
  await upsertAgent(db, {
    id,
    ownerUserId: input.userId,
    kind: AgentKind.parse(input.kind),
    displayName: input.displayName,
    slug: toSlug(input.handle, input.displayName),
    tagline: '',
    bio: input.bio,
    manifesto: '',
    disciplines: input.disciplines,
    techniques: input.techniques,
    professions: input.professions,
    languages: ['pt-BR'],
    city: input.city,
    state: input.state,
    country: 'BR',
    neighborhood: input.neighborhood,
    identity: {},
    socialLinks: {
      instagram: optionalUrl(input.social.instagram),
      website: optionalUrl(input.social.website),
    },
    avatarUrl: input.avatarUrl,
    coverUrl: null,
    portfolioImages: [],
    isPublic: true,
    isVerified: false,
    acceptsCommissions: false,
    acceptsBookings: false,
    createdAt: now,
    updatedAt: now,
  });

  const user = await getUserLenient(db, input.userId);
  if (user) {
    await upsertUser(db, {
      ...user,
      displayName: input.displayName,
      handle: input.handle.startsWith('@') ? input.handle : `@${input.handle}`,
      bio: input.bio,
      agentId: id,
      locationLabel: [input.city, input.state].filter(Boolean).join(', ') || user.locationLabel,
      updatedAt: now,
    });
  }
  return id;
}

const SPACE_KIND_MAP: Record<string, SpaceKind> = {
  galeria: 'gallery',
  gallery: 'gallery',
  museo: 'museum',
  museu: 'museum',
  teatro: 'theater',
  bar: 'bar_live_music',
  clube: 'club',
  estudio: 'studio',
  cinema: 'cinema',
  livraria: 'bookstore',
};

export async function publishSpaceListing(input: {
  userId: string;
  name: string;
  handle: string;
  category: string;
  description: string;
  city: string;
  street: string | null;
  number: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
}): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.');
  }
  const db = getFirestoreInstance();
  const id = `space_${input.userId}_${Date.now()}`;
  const now = nowIso();
  const kindKey = input.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const kind = SPACE_KIND_MAP[kindKey] ?? 'other';

  await upsertSpace(db, {
    id,
    slug: toSlug(input.handle, input.name),
    ownerAgentId: null,
    managerUserIds: [input.userId],
    name: input.name,
    kind,
    description: input.description,
    address: {
      street: input.street,
      number: input.number,
      neighborhood: null,
      city: input.city || 'São Paulo',
      state: 'SP',
      country: 'BR',
      postalCode: null,
    },
    geo: null,
    capacity: null,
    amenities: [],
    priceRange: null,
    openingHours: {},
    contact: {
      phone: input.contactPhone,
      email: input.contactEmail?.trim() || null,
      website: optionalUrl(input.website) ?? null,
    },
    coverUrl: null,
    images: [],
    tags: [input.category].filter(Boolean),
    isVerified: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

const EVENT_KIND_MAP: Record<string, EventKind> = {
  show: 'show',
  exposicao: 'exhibition',
  exhibition: 'exhibition',
  festival: 'festival',
  workshop: 'workshop',
  palestra: 'talk',
  festa: 'party',
};

export async function publishEventListing(input: {
  userId: string;
  title: string;
  handle: string;
  category: string;
  description: string;
  city: string;
  ageRating: string | null;
}): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.');
  }
  const db = getFirestoreInstance();
  const id = `event_${input.userId}_${Date.now()}`;
  const now = nowIso();
  const kindKey = input.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const kind = EVENT_KIND_MAP[kindKey] ?? 'other';
  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await upsertEvent(db, {
    id,
    slug: toSlug(input.handle, input.title),
    title: input.title,
    kind,
    subtitle: '',
    description: input.description,
    coverUrl: null,
    images: [],
    startsAt,
    endsAt: null,
    timezone: 'America/Sao_Paulo',
    spaceId: null,
    profileId: null,
    locationLabel: input.city || null,
    geo: null,
    organizerAgentIds: [],
    featuredAgentIds: [],
    createdByUserId: input.userId,
    categories: [input.category].filter(Boolean),
    tags: [],
    ticketing: {
      isFree: true,
      priceFromBRL: null,
      priceToBRL: null,
      externalUrl: null,
      soldInternally: false,
      capacity: null,
      ticketsSold: 0,
    },
    ageRating:
      input.ageRating === '12' ||
      input.ageRating === '14' ||
      input.ageRating === '16' ||
      input.ageRating === '18' ||
      input.ageRating === 'free'
        ? input.ageRating
        : null,
    isPublished: true,
    isCancelled: false,
    stats: { saves: 0, likes: 0, attended: 0 },
    createdAt: now,
    updatedAt: now,
  });
  return id;
}
