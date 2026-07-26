import type { Agent } from '../domain/agent';
import type { Event } from '../domain/event';
import type { Space } from '../domain/space';
import type { Work } from '../domain/work';
import { Listing, ListingType } from '../types';

function formatPriceBRL(value: number | null | undefined, free = false): string {
  if (free || value === 0) return 'Grátis';
  if (value == null) return 'Consulte';
  return `R$ ${value}`;
}

function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Em breve';
  }
}

export function eventToListing(event: Event): Listing {
  return {
    id: event.id,
    type: ListingType.EVENT,
    title: event.title,
    subtitle: event.locationLabel || event.subtitle || 'Local a confirmar',
    description: event.description,
    imageUrl: event.coverUrl || `https://picsum.photos/seed/${event.id}/600/400`,
    price: formatPriceBRL(event.ticketing.priceFromBRL, event.ticketing.isFree),
    rating: 4.5 + (event.stats.likes % 5) / 10,
    reviews: event.stats.saves + event.stats.attended,
    date: formatEventDate(event.startsAt),
    coordinates: event.geo ? { lat: event.geo.lat, lng: event.geo.lng } : undefined,
    tags: [...event.categories, ...event.tags],
    meta: {
      eventKind: event.kind,
      city: event.locationLabel?.split(',').pop()?.trim(),
      startsAt: event.startsAt,
      priceBRL: event.ticketing.priceFromBRL,
    },
    sponsored: event.tags?.includes('patrocinado') || event.categories?.includes('Patrocinado'),
  };
}

export function spaceToListing(space: Space): Listing {
  return {
    id: space.id,
    type: ListingType.SPACE,
    title: space.name,
    subtitle: `${space.address.neighborhood || space.address.city}, ${space.address.state}`,
    description: space.description,
    imageUrl: space.coverUrl || `https://picsum.photos/seed/${space.id}/600/400`,
    price: space.priceRange === 'free' ? 'Grátis' : 'Consulte',
    rating: 4.6,
    reviews: 40,
    coordinates: space.geo ? { lat: space.geo.lat, lng: space.geo.lng } : undefined,
    tags: [space.kind, ...space.tags],
    meta: {
      spaceKind: space.kind,
      city: space.address.city,
      neighborhood: space.address.neighborhood ?? undefined,
    },
  };
}

export function agentToListing(agent: Agent, relatedWork?: Work): Listing {
  return {
    id: agent.id,
    authorId: agent.ownerUserId,
    type: ListingType.ARTIST,
    title: agent.displayName,
    subtitle: agent.professions[0] || agent.disciplines[0] || agent.kind,
    description: agent.bio || agent.tagline,
    imageUrl: agent.avatarUrl || `https://picsum.photos/seed/${agent.id}/600/400`,
    workImageUrl: relatedWork?.coverUrl || agent.portfolioImages[0] || undefined,
    price: agent.acceptsCommissions ? 'Consulte' : 'Grátis',
    rating: 4.7,
    reviews: 28,
    coordinates: agent.city ? { lat: -23.55, lng: -46.63 } : undefined,
    tags: [...agent.disciplines, ...agent.techniques, agent.kind],
    meta: {
      agentKind: agent.kind,
      city: agent.city,
      neighborhood: agent.neighborhood,
      identity: agent.identity,
    },
  };
}

export function workToListing(work: Work): Listing {
  return {
    id: work.id,
    authorId: work.authorAgentId,
    type: ListingType.WORK,
    title: work.title,
    subtitle: work.medium,
    description: work.description,
    imageUrl: work.coverUrl || `https://picsum.photos/seed/${work.id}/600/400`,
    price: work.isForSale ? formatPriceBRL(work.priceBRL) : 'Consulte',
    rating: 4.8,
    reviews: work.stats.views,
    tags: [work.medium, ...(work.technique ? [work.technique] : []), ...work.tags],
  };
}

export type JourneyKind = 'all' | 'events' | 'agents' | 'spaces' | 'works';

export function listingMatchesCategory(listing: Listing, category: string): boolean {
  if (category === 'all') return true;
  if (category === 'spaces') return listing.type === ListingType.SPACE;
  if (category === 'music' || category === 'social') {
    return listing.tags.some(t => /música|music|jazz|techno|rave|social/i.test(t));
  }
  if (category === 'visual') {
    return listing.tags.some(t => /arte|visual|digital|exposição|pintura/i.test(t));
  }
  if (category === 'workshops') return listing.type === ListingType.EXPERIENCE || listing.type === ListingType.WORK;
  if (category === 'photo') return listing.tags.some(t => /foto|photo/i.test(t));
  if (category === 'theater') return listing.tags.some(t => /teatro|theater|performance/i.test(t));
  if (category === 'cinema') return listing.tags.some(t => /cinema|filme/i.test(t));
  if (category === 'talks') return listing.tags.some(t => /palestra|talk/i.test(t));
  return true;
}

export function listingMatchesJourney(listing: Listing, journey: JourneyKind): boolean {
  if (journey === 'all') return true;
  if (journey === 'events') return listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE;
  if (journey === 'agents') return listing.type === ListingType.ARTIST;
  if (journey === 'spaces') return listing.type === ListingType.SPACE;
  if (journey === 'works') return listing.type === ListingType.WORK;
  return true;
}
