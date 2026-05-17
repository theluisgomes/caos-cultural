import React, { useEffect, useRef, useState } from 'react';
import { Listing, ListingType } from '../types';
import { X, Zap, Building2, Users, Sparkles, ExternalLink, Star } from 'lucide-react';

// Leaflet is loaded from CDN as window.L
declare const L: any;

interface MapVisualizerProps {
  listings: Listing[];
  onClose?: () => void;
  onListingClick?: (listing: Listing) => void;
}

// Pin color per listing type
const TYPE_META: Record<ListingType, { color: string; label: string; Icon: React.ElementType }> = {
  [ListingType.EVENT]:      { color: '#e11d48', label: 'Evento',     Icon: Zap },
  [ListingType.SPACE]:      { color: '#9333ea', label: 'Espaço',     Icon: Building2 },
  [ListingType.ARTIST]:     { color: '#10b981', label: 'Artista',    Icon: Users },
  [ListingType.EXPERIENCE]: { color: '#f59e0b', label: 'Experiência',Icon: Sparkles },
};

// Real coordinates spread across Brazil's cultural hubs
// When a listing has real coordinates we use those; otherwise we cycle through these
const BRAZIL_FALLBACK_COORDS: [number, number][] = [
  [-23.5505, -46.6333], // São Paulo
  [-22.9068, -43.1729], // Rio de Janeiro
  [-19.9167, -43.9333], // Belo Horizonte
  [-12.9714, -38.5014], // Salvador
  [-8.0476,  -34.8770], // Recife
  [-3.7172,  -38.5433], // Fortaleza
  [-15.7801, -47.9292], // Brasília
  [-30.0346, -51.2177], // Porto Alegre
  [-3.1190,  -60.0217], // Manaus
  [-1.4558,  -48.4902], // Belém
  [-25.4284, -49.2733], // Curitiba
  [-2.5307,  -44.3068], // São Luís
];

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ listings, onClose, onListingClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (typeof L === 'undefined') return;

    // Dark CartoDB tiles — no API key needed
    const map = L.map(mapRef.current, {
      center: [-14.235, -51.925], // Brazil center
      zoom: 4,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map);

    // Custom zoom controls (top-right)
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Fit Brazil bounding box
    map.fitBounds([
      [-33.75, -73.98], // SW
      [5.27,   -28.85], // NE
    ]);

    // Add markers
    listings.forEach((listing, i) => {
      const meta = TYPE_META[listing.type] || TYPE_META[ListingType.EVENT];
      const coords: [number, number] =
        listing.coordinates &&
        typeof listing.coordinates.lat === 'number' &&
        typeof listing.coordinates.lng === 'number'
          ? [listing.coordinates.lat, listing.coordinates.lng]
          : BRAZIL_FALLBACK_COORDS[i % BRAZIL_FALLBACK_COORDS.length];

      // SVG pin icon
      const svgPin = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
          <circle cx="20" cy="20" r="20" fill="${meta.color}" opacity="0.15"/>
          <circle cx="20" cy="20" r="14" fill="${meta.color}"/>
          <circle cx="20" cy="20" r="6" fill="white"/>
          <line x1="20" y1="34" x2="20" y2="52" stroke="${meta.color}" stroke-width="2.5"/>
        </svg>`;

      const icon = L.divIcon({
        html: svgPin,
        className: '',
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -54],
      });

      const marker = L.marker(coords, { icon }).addTo(map);
      marker.on('click', () => setSelectedListing(listing));
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings]);

  const activeMeta = selectedListing ? TYPE_META[selectedListing.type] : null;
  const ActiveIcon = activeMeta?.Icon;

  return (
    <div className="relative w-full h-full bg-[#121212] overflow-hidden">
      {/* Leaflet map canvas */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-[9999] bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-full shadow-xl text-sm font-bold tracking-wide flex items-center gap-2"
        >
          <X size={16} />
          FECHAR MAPA
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[9999] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 space-y-2 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Legenda</p>
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.Icon;
          return (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
              <Icon size={14} className="text-zinc-400" />
              <span className="text-xs text-zinc-300">{meta.label}</span>
            </div>
          );
        })}
      </div>

      {/* Selected Listing Panel */}
      {selectedListing && activeMeta && (
        <div className="absolute bottom-8 right-4 z-[9999] w-72 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Image */}
          <div className="relative h-40 w-full">
            <img
              src={selectedListing.imageUrl}
              alt={selectedListing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full p-1.5 transition-colors"
            >
              <X size={14} />
            </button>
            {/* Type badge */}
            <div
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: activeMeta.color }}
            >
              {ActiveIcon && <ActiveIcon size={10} />}
              {activeMeta.label}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-white text-base leading-tight">{selectedListing.title}</h3>
            <p className="text-zinc-400 text-xs mt-1 truncate">{selectedListing.subtitle}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-brand-500 text-sm font-bold">
                <Star size={12} fill="currentColor" />
                <span>{selectedListing.rating}</span>
                <span className="text-zinc-600 font-normal text-xs">({selectedListing.reviews})</span>
              </div>
              <span className="font-bold text-white text-sm">{selectedListing.price || 'Grátis'}</span>
            </div>

            {selectedListing.date && (
              <p className="text-zinc-500 text-xs mt-2">📅 {selectedListing.date}</p>
            )}

            {selectedListing.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {selectedListing.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {onListingClick && (
              <button
                onClick={() => onListingClick(selectedListing)}
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-bold text-white py-2.5 rounded-lg transition-all"
                style={{ backgroundColor: activeMeta.color }}
              >
                Ver detalhes <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};