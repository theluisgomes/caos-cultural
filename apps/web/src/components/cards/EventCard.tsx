import React from 'react';
import { Listing } from '../../types';
import { Calendar } from 'lucide-react';
import { InteractionBar } from '../interactions/InteractionBar';

interface EventCardProps {
  listing: Listing;
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ listing, onClick }) => (
  <div className="group cursor-pointer flex flex-col gap-4" onClick={onClick}>
    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900">
      <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
      <div className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">Evento</div>
      <InteractionBar
        targetType="event"
        targetId={listing.id}
        targetTitle={listing.title}
        targetStartsAt={listing.meta?.startsAt}
        targetLocation={listing.subtitle}
        className="absolute bottom-3 right-3"
      />
    </div>
    <div>
      <h3 className="font-sans font-bold text-lg leading-snug text-zinc-100 group-hover:text-brand-500 transition-colors">{listing.title}</h3>
      <p className="text-zinc-500 text-sm mt-1">{listing.subtitle}</p>
      {listing.date && <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1"><Calendar size={12} />{listing.date}</p>}
    </div>
  </div>
);
