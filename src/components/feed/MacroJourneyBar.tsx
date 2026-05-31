import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Compass, Landmark, Palette, Users } from 'lucide-react';

const journeys = [
  { id: '/explorar', label: 'Explorar', icon: Compass },
  { id: '/eventos', label: 'Eventos', icon: Calendar },
  { id: '/agentes', label: 'Agentes', icon: Users },
  { id: '/espacos', label: 'Espaços', icon: Landmark },
  { id: '/obras', label: 'Obras', icon: Palette },
];

export const MacroJourneyBar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="w-full bg-zinc-950 sticky top-[68px] z-30 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-3">
          {journeys.map(j => {
            const Icon = j.icon;
            const active = pathname === j.id || (j.id === '/explorar' && pathname === '/');
            return (
              <Link
                key={j.id}
                to={j.id === '/explorar' ? '/' : j.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Icon size={16} />
                {j.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
