import React, { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { Layers, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import { fetchSavedPlaces, saveMapPlace } from '../services/mapSavedPlaces';
import { Listing, ListingType } from '../types';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };

type MapLayer = 'spaces' | 'events' | 'agents' | 'favorites';

export const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listings = [] } = useListings('all', 'all');
  const [selected, setSelected] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<MapLayer, boolean>>({
    spaces: true,
    events: true,
    agents: true,
    favorites: false,
  });
  const [radiusKm, setRadiusKm] = useState(5);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchSavedPlaces(user.id).then(places => setSavedIds(new Set(places.map(p => p.targetId))));
  }, [user]);

  const visibleListings = listings.filter(l => {
    if (!l.coordinates) return false;
    if (layers.favorites && !savedIds.has(l.id)) return false;
    if (l.type === ListingType.SPACE && !layers.spaces) return false;
    if (l.type === ListingType.EVENT && !layers.events) return false;
    if (l.type === ListingType.ARTIST && !layers.agents) return false;
    if (l.type === ListingType.WORK) return layers.agents;
    return true;
  });

  useEffect(() => {
    if (!mapRef.current) return;
    if (!MAPS_KEY) {
      setError('Configure VITE_GOOGLE_MAPS_API_KEY para o mapa vivo.');
      return;
    }

    setOptions({ key: MAPS_KEY, v: 'weekly' });

    Promise.all([importLibrary('maps'), importLibrary('marker')])
      .then(([mapsLib, markerLib]) => {
        if (!mapInstance.current) {
          mapInstance.current = new mapsLib.Map(mapRef.current!, {
            center: SAO_PAULO,
            zoom: 12,
          });
        }

        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        visibleListings.forEach(listing => {
          if (!listing.coordinates) return;
          const marker = new markerLib.Marker({
            map: mapInstance.current!,
            position: { lat: listing.coordinates.lat, lng: listing.coordinates.lng },
            title: listing.title,
          });
          marker.addListener('click', () => setSelected(listing));
          markersRef.current.push(marker);
        });

        new markerLib.Marker({
          map: mapInstance.current!,
          position: SAO_PAULO,
          title: 'Centro da busca',
        });
      })
      .catch(() => setError('Falha ao carregar Google Maps.'));
  }, [visibleListings, radiusKm]);

  const toggleLayer = (layer: MapLayer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const saveToMap = async () => {
    if (!user || !selected?.coordinates) return;
    await saveMapPlace({
      userId: user.id,
      targetType: selected.type === ListingType.EVENT ? 'event' : 'space',
      targetId: selected.id,
      label: selected.title,
      lat: selected.coordinates.lat,
      lng: selected.coordinates.lng,
    });
    setSavedIds(prev => new Set([...prev, selected.id]));
  };

  const rideshare = (provider: 'uber' | '99') => {
    if (!selected?.coordinates) return;
    const { lat, lng } = selected.coordinates;
    const url =
      provider === 'uber'
        ? `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`
        : `https://99app.com/r/?destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950">
      <div ref={mapRef} className="absolute inset-0" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 p-8 text-center">{error}</div>
      )}

      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-72 bg-zinc-950/95 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Layers size={16} /> Camadas
        </div>
        {(['spaces', 'events', 'agents', 'favorites'] as MapLayer[]).map(layer => (
          <label key={layer} className="flex items-center justify-between text-xs text-zinc-400 capitalize">
            {layer === 'favorites' ? 'Meus favoritos' : layer}
            <input type="checkbox" checked={layers[layer]} onChange={() => toggleLayer(layer)} />
          </label>
        ))}
        <div>
          <label className="text-xs text-zinc-500">Raio: {radiusKm} km</label>
          <input
            type="range"
            min={1}
            max={25}
            value={radiusKm}
            onChange={e => setRadiusKm(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>
        <button
          type="button"
          onClick={() => navigate('/rotas')}
          className="w-full text-xs font-bold uppercase tracking-wider text-brand-500"
        >
          Ver rotas culturais →
        </button>
      </div>

      {selected && (
        <div className="absolute bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-zinc-950/95 border border-zinc-800 rounded-xl p-4">
          <button type="button" onClick={() => setSelected(null)} className="absolute top-2 right-2 text-zinc-500" aria-label="Fechar">
            <X size={16} />
          </button>
          <h3 className="font-bold text-white">{selected.title}</h3>
          <p className="text-zinc-400 text-sm">{selected.subtitle}</p>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => rideshare('uber')} className="flex-1 bg-white text-black py-2 rounded text-xs font-bold">Uber</button>
            <button type="button" onClick={() => rideshare('99')} className="flex-1 bg-zinc-800 text-white py-2 rounded text-xs font-bold">99</button>
          </div>
          {user && (
            <button type="button" onClick={saveToMap} className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-brand-500 font-bold">
              <MapPin size={14} /> Salvar no meu mapa
            </button>
          )}
        </div>
      )}
    </div>
  );
};
