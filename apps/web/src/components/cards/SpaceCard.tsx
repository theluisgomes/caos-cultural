import React from 'react';
import { Listing } from '../../types';
import { MapPin } from 'lucide-react';
import { InteractionBar } from '../interactions/InteractionBar';

interface SpaceCardProps {
  listing: Listing;
  onClick?: () => void;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ listing, onClick }) => (
  <div className="group cursor-pointer flex flex-col gap-4" onClick={onClick}>
    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900">
      <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
      <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">Espaço</div>
      <InteractionBar targetType="space" targetId={listing.id} className="absolute bottom-3 right-3" />
    </div>
    <div>
      <h3 className="font-bold text-lg text-zinc-100 group-hover:text-brand-500 transition-colors">{listing.title}</h3>
      <p className="text-zinc-500 text-sm flex items-center gap-1"><MapPin size={12} />{listing.subtitle}</p>
    </div>
  </div>
);
