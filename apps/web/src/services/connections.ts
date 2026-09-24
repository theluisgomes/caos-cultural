import type { Connection, ConnectionRelation } from '../domain/connection';
import { fetchFollowing } from './social';
import { ListingType, type Listing } from '../types';

/**
 * Rede do perfil (estudo p. 15). Sem backend de conexões ainda: derivamos das
 * arestas de follow existentes + coautoria em obras/eventos, mantendo a forma
 * do domínio (`domain/connection.ts`) para trocar a fonte depois.
 */

interface BuildNetworkInput {
  userId: string;
  /** Ids seguidos pelo usuário (de `services/social`). */
  followingIds: string[];
  listings: Listing[];
  /** Ids de obras/eventos criados pelo usuário — geram colaborações. */
  ownedListingIds?: string[];
}

function relationFor(listing: Listing, isFollowing: boolean, isCollaborator: boolean): ConnectionRelation {
  if (isCollaborator) return 'colaborador';
  if (listing.type === ListingType.SPACE) return 'parceiro';
  if (isFollowing) return 'seguindo';
  return 'contato';
}

function toConnection(
  listing: Listing,
  ownerUserId: string,
  relation: ConnectionRelation,
  bucket: Connection['bucket']
): Connection {
  return {
    id: `${ownerUserId}_${bucket}_${listing.id}`,
    ownerUserId,
    targetId: listing.id,
    targetType: listing.type === ListingType.SPACE ? 'space' : 'agent',
    displayName: listing.title,
    subtitle: listing.subtitle,
    avatarUrl: listing.imageUrl ?? null,
    relation,
    bucket,
    createdAt: new Date().toISOString(),
  };
}

export function buildNetwork({
  userId,
  followingIds,
  listings,
  ownedListingIds = [],
}: BuildNetworkInput): Connection[] {
  const following = new Set(followingIds);
  const ownedTags = new Set(
    listings.filter(l => ownedListingIds.includes(l.id)).flatMap(l => l.tags)
  );

  const people = listings.filter(
    l => l.type === ListingType.ARTIST || l.type === ListingType.SPACE
  );

  const connections: Connection[] = [];

  for (const listing of people) {
    if (listing.id === userId) continue;
    const isFollowing = following.has(listing.id);
    const isCollaborator = ownedTags.size > 0 && listing.tags.some(tag => ownedTags.has(tag));

    if (isFollowing) {
      connections.push(
        toConnection(listing, userId, relationFor(listing, true, isCollaborator), 'seguindo')
      );
    }
    if (isCollaborator) {
      connections.push(toConnection(listing, userId, 'colaborador', 'colaboracoes'));
    }
  }

  // Contatos: quem o usuário segue e também aparece como colaborador ou parceiro.
  const contactIds = new Set(
    connections.filter(c => c.bucket === 'colaboracoes').map(c => c.targetId)
  );
  for (const connection of connections.filter(c => c.bucket === 'seguindo')) {
    if (contactIds.has(connection.targetId)) {
      connections.push({ ...connection, id: `${connection.id}_contato`, bucket: 'contatos', relation: 'amigo' });
    }
  }

  // Seguidores: sem grafo reverso no MVP, usamos os pares que compartilham tags
  // com o que o usuário segue — sinalizado como "seguidor" para a UI.
  const followedTags = new Set(
    people.filter(p => following.has(p.id)).flatMap(p => p.tags)
  );
  for (const listing of people) {
    if (following.has(listing.id) || listing.id === userId) continue;
    if (listing.tags.some(tag => followedTags.has(tag))) {
      connections.push(toConnection(listing, userId, 'seguidor', 'seguidores'));
    }
  }

  return connections;
}

export async function fetchNetwork(
  userId: string,
  listings: Listing[],
  ownedListingIds: string[] = []
): Promise<Connection[]> {
  const followingIds = await fetchFollowing(userId);
  return buildNetwork({ userId, followingIds, listings, ownedListingIds });
}
