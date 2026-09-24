/**
 * Ações de salvar específicas por tipo de card (estudo p. 3).
 *
 * - Card usuário  → Salvar em Listas + Seguir
 * - Card evento   → Salvar em Agenda + Seguir
 * - Card espaço   → Seguir + Salvar no mapa
 * - Card obra     → Salvar em Listas
 *
 * Camada fina sobre os serviços existentes (social, lists, agenda, mapPins,
 * interactions) para que UI (cards, deck, detalhes) compartilhe o mesmo
 * comportamento.
 */

import type { InteractionTargetType } from '../domain/interaction';
import type { ListTargetType } from '../domain/list';
import { addAgendaItem } from './agenda';
import { recordInteraction } from './interactions';
import { addListItem } from './lists';
import { saveMapPlace } from './mapSavedPlaces';
import { followTarget, unfollowTarget } from './social';
import { Listing, ListingType } from '../types';

export type CardActionKind = 'follow' | 'save_list' | 'save_agenda' | 'save_map';

export type FollowTargetType = 'agent' | 'space' | 'user';

export function interactionTargetTypeOf(listing: Listing): InteractionTargetType {
  switch (listing.type) {
    case ListingType.EVENT:
    case ListingType.EXPERIENCE:
      return 'event';
    case ListingType.SPACE:
      return 'space';
    case ListingType.WORK:
      return 'work';
    default:
      return 'agent';
  }
}

export function followTargetTypeOf(listing: Listing): FollowTargetType {
  if (listing.type === ListingType.SPACE) return 'space';
  return 'agent';
}

export function listTargetTypeOf(listing: Listing): ListTargetType {
  switch (listing.type) {
    case ListingType.EVENT:
    case ListingType.EXPERIENCE:
      return 'event';
    case ListingType.SPACE:
      return 'space';
    case ListingType.WORK:
      return 'work';
    default:
      return 'agent';
  }
}

/** Ordem importa: é a ordem em que os botões aparecem no card. */
export function actionsForListing(listing: Listing): CardActionKind[] {
  switch (listing.type) {
    case ListingType.EVENT:
    case ListingType.EXPERIENCE:
      return ['save_agenda', 'follow'];
    case ListingType.SPACE:
      return ['follow', 'save_map'];
    case ListingType.WORK:
      return ['save_list'];
    default:
      return ['save_list', 'follow'];
  }
}

export function followEdgeId(userId: string, listing: Listing): string {
  return `${userId}_${followTargetTypeOf(listing)}_${listing.id}`;
}

export async function toggleFollowListing(
  userId: string,
  listing: Listing,
  isFollowing: boolean
): Promise<boolean> {
  const targetType = followTargetTypeOf(listing);
  if (isFollowing) {
    await unfollowTarget(followEdgeId(userId, listing));
    await recordInteraction(userId, 'unfollow', interactionTargetTypeOf(listing), listing.id);
    return false;
  }
  await followTarget(userId, targetType, listing.id);
  await recordInteraction(userId, 'follow', interactionTargetTypeOf(listing), listing.id);
  return true;
}

export async function saveListingToAgenda(userId: string, listing: Listing): Promise<void> {
  const now = new Date().toISOString();
  await addAgendaItem(userId, {
    agendaId: `personal_${userId}`,
    addedByUserId: userId,
    eventId: listing.id,
    customTitle: listing.title,
    customLocation: listing.subtitle || null,
    startsAt: listing.meta?.startsAt ?? now,
    endsAt: null,
    status: 'interested',
    notes: '',
    reminderMinutesBefore: null,
    createdAt: now,
    updatedAt: now,
  });
  await recordInteraction(userId, 'save', 'event', listing.id);
}

export async function saveListingToList(
  userId: string,
  listing: Listing,
  listId: string
): Promise<void> {
  const now = new Date().toISOString();
  await addListItem({
    id: `li_${listId}_${listing.id}`,
    listId,
    targetType: listTargetTypeOf(listing),
    targetId: listing.id,
    note: '',
    orderIndex: 0,
    addedAt: now,
  });
  await recordInteraction(userId, 'save', interactionTargetTypeOf(listing), listing.id);
}

export async function saveListingToMap(userId: string, listing: Listing): Promise<boolean> {
  if (!listing.coordinates) return false;
  await saveMapPlace({
    userId,
    targetType: listing.type === ListingType.EVENT ? 'event' : 'space',
    targetId: listing.id,
    label: listing.title,
    lat: listing.coordinates.lat,
    lng: listing.coordinates.lng,
  });
  await recordInteraction(userId, 'save', interactionTargetTypeOf(listing), listing.id);
  return true;
}
