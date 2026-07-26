import React from 'react';
import { Listing, ListingType } from '../../types';
import { EventCard } from '../cards/EventCard';
import { AgentCard } from '../cards/AgentCard';
import { SpaceCard } from '../cards/SpaceCard';
import { WorkCard } from '../cards/WorkCard';
import { HybridArtistCard } from '../cards/HybridArtistCard';
import { MixedCard } from '../cards/MixedCard';
import { useCardVariant } from '../../hooks/useCardVariant';
import type { JourneyKind } from '../../services/mappers';

interface FeedGridProps {
  listings: Listing[];
  loading: boolean;
  onListingClick: (listing: Listing) => void;
  journey: JourneyKind;
}

function AgentCardForJourney({
  listing,
  journey,
  onClick,
}: {
  listing: Listing;
  journey: JourneyKind;
  onClick: () => void;
}) {
  const wideVariant = useCardVariant('wide_discovery');
  if (journey === 'agents') {
    return <HybridArtistCard listing={listing} onClick={onClick} variant="face" />;
  }
  if (journey === 'all') {
    return <HybridArtistCard listing={listing} onClick={onClick} variant={wideVariant} />;
  }
  return <AgentCard listing={listing} onClick={onClick} />;
}

function renderCard(listing: Listing, journey: JourneyKind, onClick: () => void) {
  if (journey === 'all') {
    return <MixedCard listing={listing} onClick={onClick} />;
  }
  if (listing.type === ListingType.ARTIST || journey === 'agents') {
    return <AgentCardForJourney listing={listing} journey={journey} onClick={onClick} />;
  }
  if (listing.type === ListingType.EVENT) return <EventCard listing={listing} onClick={onClick} />;
  if (listing.type === ListingType.SPACE) return <SpaceCard listing={listing} onClick={onClick} />;
  if (listing.type === ListingType.WORK) return <WorkCard listing={listing} onClick={onClick} />;
  return <MixedCard listing={listing} onClick={onClick} />;
}

export const FeedGrid: React.FC<FeedGridProps> = ({ listings, loading, onListingClick, journey }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col gap-3">
            <div className="bg-zinc-800 aspect-[4/5] rounded-sm" />
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-900 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="text-center py-20 border border-zinc-800 rounded-lg border-dashed">
        <h2 className="text-3xl font-bold text-white mb-2">Vazio.</h2>
        <p className="text-zinc-500">Ainda não há conteúdo nesta jornada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {listings.map(listing => (
        <div key={listing.id}>{renderCard(listing, journey, () => onListingClick(listing))}</div>
      ))}
    </div>
  );
};
