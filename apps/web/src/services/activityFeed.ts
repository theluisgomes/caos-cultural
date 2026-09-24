import type { ActivityFilter, ActivityItem } from '../domain/activity';
import { listingsToPublicAgenda } from './agenda';
import { fetchFollowing } from './social';
import { ListingType, type Listing } from '../types';

/**
 * Feed de atividades (estudo p. 5, "Feed ≠ CAOS").
 * MVP derivado de dados existentes: novos listings de perfis/espaços seguidos
 * e itens de agenda públicos. Sem posts manuais.
 */

function startTime(listing: Listing): number {
  const iso = listing.meta?.startsAt;
  const time = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(time) ? Date.now() : time;
}

function hrefFor(listing: Listing): string {
  if (listing.type === ListingType.WORK) return `/obra/${listing.id}`;
  if (listing.type === ListingType.SPACE) return `/espaco/${listing.id}`;
  if (listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE) {
    return `/evento/${listing.id}`;
  }
  return `/agente/${listing.id}`;
}

function filterFor(listing: Listing): ActivityFilter {
  if (listing.type === ListingType.SPACE) return 'spaces';
  if (listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE) return 'events';
  return 'people';
}

function activityFor(listing: Listing, following: Set<string>): ActivityItem | null {
  const isFollowed = following.has(listing.id) || (listing.authorId ? following.has(listing.authorId) : false);
  const createdAt = new Date(startTime(listing)).toISOString();

  switch (listing.type) {
    case ListingType.EVENT:
    case ListingType.EXPERIENCE:
      return {
        id: `act_event_${listing.id}`,
        kind: 'new_event',
        actorId: listing.authorId ?? listing.id,
        actorName: listing.subtitle || 'Organização',
        actorAvatarUrl: listing.imageUrl ?? null,
        targetId: listing.id,
        targetTitle: listing.title,
        targetSubtitle: listing.subtitle,
        targetImageUrl: listing.imageUrl ?? null,
        targetHref: hrefFor(listing),
        filter: 'events',
        message: 'anunciou um novo evento',
        fromFollowing: isFollowed,
        createdAt,
      };
    case ListingType.SPACE:
      return {
        id: `act_space_${listing.id}`,
        kind: 'new_space',
        actorId: listing.id,
        actorName: listing.title,
        actorAvatarUrl: listing.imageUrl ?? null,
        targetId: listing.id,
        targetTitle: listing.title,
        targetSubtitle: listing.subtitle,
        targetImageUrl: listing.imageUrl ?? null,
        targetHref: hrefFor(listing),
        filter: 'spaces',
        message: 'atualizou a programação do espaço',
        fromFollowing: isFollowed,
        createdAt,
      };
    case ListingType.WORK:
      return {
        id: `act_work_${listing.id}`,
        kind: 'new_work',
        actorId: listing.authorId ?? listing.id,
        actorName: listing.subtitle || 'Usuário',
        actorAvatarUrl: listing.imageUrl ?? null,
        targetId: listing.id,
        targetTitle: listing.title,
        targetSubtitle: listing.subtitle,
        targetImageUrl: listing.imageUrl ?? null,
        targetHref: hrefFor(listing),
        filter: 'people',
        message: 'publicou uma nova obra',
        fromFollowing: isFollowed,
        createdAt,
      };
    case ListingType.ARTIST:
      return {
        id: `act_agent_${listing.id}`,
        kind: 'new_agent',
        actorId: listing.id,
        actorName: listing.title,
        actorAvatarUrl: listing.imageUrl ?? null,
        targetId: listing.id,
        targetTitle: listing.title,
        targetSubtitle: listing.subtitle,
        targetImageUrl: listing.imageUrl ?? null,
        targetHref: hrefFor(listing),
        filter: filterFor(listing),
        message: 'entrou no CAOS',
        fromFollowing: isFollowed,
        createdAt,
      };
    default:
      return null;
  }
}

export function buildActivityFeed(listings: Listing[], followingIds: string[]): ActivityItem[] {
  const following = new Set(followingIds);

  const fromListings = listings
    .map(listing => activityFor(listing, following))
    .filter((item): item is ActivityItem => item !== null);

  // Itens de agenda públicos dos perfis seguidos entram como atividade.
  const followedEvents = listings.filter(
    l =>
      (l.type === ListingType.EVENT || l.type === ListingType.EXPERIENCE) &&
      (following.has(l.id) || (l.authorId ? following.has(l.authorId) : false))
  );
  const fromAgenda: ActivityItem[] = listingsToPublicAgenda(followedEvents, 'rede').map(item => ({
    id: `act_agenda_${item.id}`,
    kind: 'agenda_public',
    actorId: item.eventId ?? item.id,
    actorName: item.customLocation || 'Perfil seguido',
    actorAvatarUrl: null,
    targetId: item.eventId ?? item.id,
    targetTitle: item.customTitle ?? 'Evento',
    targetSubtitle: item.customLocation ?? '',
    targetImageUrl: null,
    targetHref: item.eventId ? `/evento/${item.eventId}` : '/agenda',
    filter: 'events',
    message: 'marcou presença na agenda pública',
    fromFollowing: true,
    createdAt: item.startsAt,
  }));

  const seen = new Set<string>();
  return [...fromAgenda, ...fromListings]
    .filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => {
      if (a.fromFollowing !== b.fromFollowing) return a.fromFollowing ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function filterActivity(items: ActivityItem[], filter: ActivityFilter): ActivityItem[] {
  if (filter === 'all') return items;
  return items.filter(item => item.filter === filter);
}

export async function fetchActivityFeed(
  userId: string | undefined,
  listings: Listing[]
): Promise<ActivityItem[]> {
  const followingIds = userId ? await fetchFollowing(userId) : [];
  return buildActivityFeed(listings, followingIds);
}
