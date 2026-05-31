import React from 'react';
import { Listing, ListingType } from '../../types';
import { EventCard } from './EventCard';
import { AgentCard } from './AgentCard';
import { SpaceCard } from './SpaceCard';
import { WorkCard } from './WorkCard';
import { HybridArtistCard } from './HybridArtistCard';
import { SponsoredBadge } from '../monetization/SponsoredBadge';
import { useCardVariant } from '../../hooks/useCardVariant';

interface MixedCardProps {
  listing: Listing;
  onClick?: () => void;
}

export const MixedCard: React.FC<MixedCardProps> = ({ listing, onClick }) => {
  const variant = useCardVariant('wide_discovery');

  if (listing.type === ListingType.ARTIST) {
    return <HybridArtistCard listing={listing} onClick={onClick} variant={variant} />;
  }

  const inner =
    listing.type === ListingType.EVENT ? (
      <EventCard listing={listing} onClick={onClick} />
    ) : listing.type === ListingType.SPACE ? (
      <SpaceCard listing={listing} onClick={onClick} />
    ) : listing.type === ListingType.WORK ? (
      <WorkCard listing={listing} onClick={onClick} />
    ) : (
      <AgentCard listing={listing} onClick={onClick} />
    );

  if (!listing.sponsored) return inner;

  return (
    <div className="relative">
      <SponsoredBadge className="absolute top-3 right-3 z-10" />
      {inner}
    </div>
  );
};
