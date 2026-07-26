import React, { useEffect, useState } from 'react';
import { Listing } from '../../types';
import { useCardVariant, CardVariant } from '../../hooks/useCardVariant';
import { InteractionBar } from '../interactions/InteractionBar';

interface HybridArtistCardProps {
  listing: Listing;
  onClick?: () => void;
  variant?: CardVariant;
  enableFlip?: boolean;
}

export const HybridArtistCard: React.FC<HybridArtistCardProps> = ({
  listing,
  onClick,
  variant: forcedVariant,
  enableFlip = true,
}) => {
  const autoVariant = useCardVariant('agent_search');
  const variant = forcedVariant ?? autoVariant;
  const [showWork, setShowWork] = useState(variant === 'work');

  useEffect(() => {
    if (!enableFlip || variant !== 'mosaic') return;
    const t = setInterval(() => setShowWork(v => !v), 4000);
    return () => clearInterval(t);
  }, [enableFlip, variant]);

  const workImage =
    listing.workImageUrl || `https://picsum.photos/seed/work-${listing.id}/600/400`;

  return (
    <div className="group cursor-pointer flex flex-col gap-4" onClick={onClick}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900 [perspective:1000px]">
        {variant === 'mosaic' ? (
          <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${showWork ? '[transform:rotateY(180deg)]' : ''}`}>
            <img src={listing.imageUrl} alt={listing.title} className="absolute inset-0 h-full w-full object-cover [backface-visibility:hidden]" />
            <img src={workImage} alt="Obra" className="absolute inset-0 h-full w-full object-cover [backface-visibility:hidden] [transform:rotateY(180deg)]" />
          </div>
        ) : (
          <img
            src={variant === 'work' ? workImage : listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
          {variant === 'work' ? 'Obra' : 'Artista'}
        </div>
        <InteractionBar targetType="agent" targetId={listing.id} className="absolute bottom-3 right-3" />
      </div>
      <div>
        <h3 className="font-bold text-lg text-zinc-100 group-hover:text-brand-500 transition-colors">{listing.title}</h3>
        <p className="text-zinc-500 text-sm">{listing.subtitle}</p>
      </div>
    </div>
  );
};
