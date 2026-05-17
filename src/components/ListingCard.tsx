import React from 'react';
import { Listing, ListingType } from '../types';
import { Star, Heart } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-4 relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900">
        <img 
          src={listing.imageUrl} 
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button 
          className="absolute top-3 right-3 p-2 text-white hover:scale-110 transition-transform z-10"
          onClick={(e) => {
            e.stopPropagation();
            // Handle save/favorite logic here
          }}
        >
          <Heart size={22} className="drop-shadow-md stroke-white hover:fill-white transition-colors" />
        </button>
        
        {listing.type !== ListingType.EVENT && (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            {listing.type === ListingType.SPACE ? 'Espaço' : listing.type === ListingType.ARTIST ? 'Artista' : 'Experiência'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-zinc-100 leading-tight truncate w-full group-hover:text-brand-500 transition-colors">{listing.title}</h3>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star size={12} className="fill-brand-500 text-brand-500" />
            <span className="text-zinc-300">{listing.rating}</span>
          </div>
        </div>
        <p className="text-zinc-500 text-sm">{listing.subtitle}</p>
        <div className="flex items-center justify-between mt-1">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{listing.date || 'Disponível'}</p>
            <div className="text-sm">
                <span className="font-semibold text-zinc-100">{listing.price || 'Consulte'}</span>
                {listing.type === ListingType.SPACE && <span className="font-light text-zinc-500"> /noite</span>}
            </div>
        </div>
      </div>
    </div>
  );
};