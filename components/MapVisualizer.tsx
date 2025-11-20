import React, { useState } from 'react';
import { Listing } from '../types';
import { MapPin, X } from 'lucide-react';

interface MapVisualizerProps {
  listings: Listing[];
  onClose?: () => void;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ listings, onClose }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="bg-zinc-950 w-full h-full relative overflow-hidden">
      {/* Dark Map Background */}
      <div className="absolute inset-0 bg-[#121212]">
        {/* Grid lines to simulate streets - Dark Mode */}
        <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>
        
        {/* Abstract dark geography */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-900/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-48 bg-purple-900/20 rounded-full blur-[80px]"></div>
        
        {/* Roads abstract */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <path d="M-10 300 Q 400 200 800 400 T 1600 200" fill="none" stroke="white" strokeWidth="4" />
            <path d="M200 -10 Q 300 400 100 800" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Pins */}
      {listings.map((listing) => {
        const top = listing.coordinates?.lat || 50;
        const left = listing.coordinates?.lng || 50;
        const isActive = activeId === listing.id;

        return (
          <div
            key={listing.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10"
            style={{ top: `${top}%`, left: `${left}%` }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveId(isActive ? null : listing.id);
            }}
          >
            {isActive ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl p-0 w-64 animate-in fade-in zoom-in duration-200 z-50">
                <div className="relative h-32 w-full">
                   <img src={listing.imageUrl} className="w-full h-full object-cover" alt="" />
                   <button className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black">
                     <X size={14} />
                   </button>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-white text-sm truncate">{listing.title}</h4>
                  <p className="text-xs text-zinc-400 truncate mt-1">{listing.subtitle}</p>
                  <div className="mt-3 font-semibold text-brand-500 text-sm">{listing.price}</div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-zinc-900 rotate-45 border-r border-b border-zinc-800"></div>
              </div>
            ) : (
              <div className="group">
                 <div className="bg-zinc-900 text-white font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:z-50 group-hover:bg-white group-hover:text-black transition-all text-xs border border-zinc-700 flex items-center gap-1">
                    {listing.price || 'Free'}
                 </div>
                 <div className="w-1 h-4 bg-zinc-500 mx-auto mt-[-2px] opacity-50"></div>
              </div>
            )}
          </div>
        );
      })}

      {/* Map Controls Mock */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="bg-zinc-900 border border-zinc-800 p-3 rounded-full shadow-lg hover:bg-zinc-800 text-white">
            <MapPin size={20} />
        </button>
      </div>

      {onClose && (
         <button 
           onClick={onClose}
           className="absolute top-4 left-4 bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-full shadow-xl text-sm font-bold tracking-wide"
         >
           FECHAR MAPA
         </button>
      )}
    </div>
  );
};