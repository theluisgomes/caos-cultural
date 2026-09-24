import React, { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { Layers, MapPin, Route as RouteIcon, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import { useCulturalRoute } from '../hooks/useCulturalRoutes';
import { fetchSavedPlaces, saveMapPlace } from '../services/mapSavedPlaces';
import { Listing, ListingType } from '../types';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };

type MapLayer = 'spaces' | 'events' | 'agents' | 'favorites';

/** PT labels + marker colour per layer (estudo p. 9: "não mostrar tudo ao mesmo tempo"). */
const LAYER_META: Record<MapLayer, { label: string; color: string }> = {
  spaces: { label: 'Espaços', color: '#22d3ee' },
  events: { label: 'Eventos', color: '#e11d48' },
  agents: { label: 'Usuários', color: '#a855f7' },
  favorites: { label: 'Meus favoritos', color: '#f59e0b' },
};

function layerOfListing(listing: Listing): MapLayer {
  if (listing.type === ListingType.SPACE) return 'spaces';
  if (listing.type === ListingType.EVENT) return 'events';
  return 'agents';
}

/** Inline SVG pin so each type reads by colour without extra assets. */
function pinIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 39C15 39 28 24.5 28 14.5A13 13 0 1 0 2 14.5C2 24.5 15 39 15 39Z" fill="${color}" stroke="#09090b" stroke-width="2"/>
    <circle cx="15" cy="14.5" r="4.5" fill="#09090b"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const routeLineRef = useRef<google.maps.Polyline | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get('rota') ?? undefined;
  const { data: route } = useCulturalRoute(routeId);
  const { user } = useAuth();
  const { data: listings = [] } = useListings('all', 'all');
  const [selected, setSelected] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Começa com uma camada só — o estudo pede não mostrar tudo ao mesmo tempo.
  const [layers, setLayers] = useState<Record<MapLayer, boolean>>({
    spaces: false,
    events: true,
    agents: false,
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
          const layer = savedIds.has(listing.id) ? 'favorites' : layerOfListing(listing);
          const marker = new markerLib.Marker({
            map: mapInstance.current!,
            position: { lat: listing.coordinates.lat, lng: listing.coordinates.lng },
            title: listing.title,
            icon: {
              url: pinIcon(LAYER_META[layer].color),
              scaledSize: new google.maps.Size(30, 40),
            },
          });
          marker.addListener('click', () => setSelected(listing));
          markersRef.current.push(marker);
        });

        new markerLib.Marker({
          map: mapInstance.current!,
          position: SAO_PAULO,
          title: 'Centro da busca',
        });

        // Camada Trajetos: desenha o roteiro salvo quando `?rota=<id>`.
        routeLineRef.current?.setMap(null);
        routeLineRef.current = null;

        const path = (route?.stops ?? [])
          .filter(stop => stop.geo)
          .map(stop => ({ lat: stop.geo!.lat, lng: stop.geo!.lng }));

        if (path.length > 1) {
          routeLineRef.current = new google.maps.Polyline({
            map: mapInstance.current!,
            path,
            strokeColor: '#e11d48',
            strokeOpacity: 0.9,
            strokeWeight: 4,
          });
        }

        (route?.stops ?? []).forEach((stop, index) => {
          if (!stop.geo) return;
          const marker = new markerLib.Marker({
            map: mapInstance.current!,
            position: { lat: stop.geo.lat, lng: stop.geo.lng },
            title: `${index + 1}. ${stop.label}`,
            label: { text: String(index + 1), color: '#09090b', fontWeight: '700' },
          });
          markersRef.current.push(marker);
        });

        if (path.length) {
          const bounds = new google.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          mapInstance.current!.fitBounds(bounds);
        }
      })
      .catch(() => setError('Falha ao carregar Google Maps.'));
  }, [visibleListings, radiusKm, route]);

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
          <label key={layer} className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: LAYER_META[layer].color }}
              />
              {LAYER_META[layer].label}
            </span>
            <input
              type="checkbox"
              className="accent-brand-500"
              checked={layers[layer]}
              onChange={() => toggleLayer(layer)}
            />
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
        {route && (
          <div className="rounded-lg border border-brand-500/40 bg-brand-500/10 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
              <RouteIcon size={13} /> Trajeto
            </div>
            <p className="mt-1 text-sm font-bold text-white">{route.name}</p>
            <p className="text-xs text-zinc-400">{route.stops.length} paradas</p>
          </div>
        )}
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
