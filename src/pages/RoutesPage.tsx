import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { ListingType } from '../types';

export const RoutesPage: React.FC = () => {
  const { data: listings = [] } = useListings('all', 'all');
  const spaces = listings.filter(l => l.type === ListingType.SPACE).slice(0, 6);
  const events = listings.filter(l => l.type === ListingType.EVENT).slice(0, 4);

  const routes = [
    { id: 'r_pinheiros', title: 'Pinheiros noturno', stops: spaces.slice(0, 4), duration: '4h' },
    { id: 'r_galerias', title: 'Galerias do centro', stops: spaces.slice(2, 5), duration: '3h' },
    { id: 'r_eventos', title: 'Semana de eventos', stops: events, duration: '6h' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 mb-8">
        <Route className="text-brand-500" /> Rotas culturais
      </h1>
      <p className="text-zinc-500 mb-8">Rotas públicas curadas — abra no mapa para ver direções.</p>
      <div className="space-y-4">
        {routes.map(r => (
          <Link key={r.id} to="/mapa" className="block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-brand-500">
            <h3 className="font-bold text-white">{r.title}</h3>
            <p className="text-zinc-500 text-sm mt-1">{r.stops.length} paradas · {r.duration}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {r.stops.map(s => (
                <span key={s.id} className="text-xs text-zinc-600 border border-zinc-800 px-2 py-1 rounded">{s.title}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
