import React, { useMemo, useState } from 'react';
import { BadgeCheck, LayoutGrid, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SwipeDeck } from '../components/caos/SwipeDeck';
import { useListings } from '../hooks/useListings';
import { DEFAULT_CENTER, haversineKm } from '../lib/geo';
import { Listing, ListingType } from '../types';

/**
 * Buscar (swipe): mesmo deck do CAOS, porém com filtros explícitos.
 * O estudo pede "Trocar Artista por Usuário" no filtro de tipo (p. 3).
 */

type TypeFilter = 'Todos' | 'Usuários' | 'Espaços' | 'Eventos' | 'Obras';
type AvailabilityFilter = 'Qualquer' | 'Hoje' | 'Esta semana' | 'Fim de semana';

interface FilterState {
  type: TypeFilter;
  characteristic: string;
  distance: number;
  availability: AvailabilityFilter;
  verifiedOnly: boolean;
}

const TYPES: TypeFilter[] = ['Todos', 'Usuários', 'Espaços', 'Eventos', 'Obras'];
const AVAILABILITY: AvailabilityFilter[] = ['Qualquer', 'Hoje', 'Esta semana', 'Fim de semana'];

const initialFilters: FilterState = {
  type: 'Todos',
  characteristic: 'Todas',
  distance: 20,
  availability: 'Qualquer',
  verifiedOnly: false,
};

function matchesType(listing: Listing, type: TypeFilter): boolean {
  switch (type) {
    case 'Usuários':
      return listing.type === ListingType.ARTIST;
    case 'Espaços':
      return listing.type === ListingType.SPACE;
    case 'Eventos':
      return listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE;
    case 'Obras':
      return listing.type === ListingType.WORK;
    default:
      return true;
  }
}

function matchesAvailability(listing: Listing, availability: AvailabilityFilter): boolean {
  if (availability === 'Qualquer') return true;
  const iso = listing.meta?.startsAt;
  if (!iso) return false;

  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return false;

  const now = new Date();
  const days = Math.floor((start.getTime() - now.getTime()) / 86_400_000);

  if (availability === 'Hoje') return start.toDateString() === now.toDateString();
  if (availability === 'Esta semana') return days >= 0 && days <= 7;
  const weekday = start.getDay();
  return days >= 0 && days <= 14 && (weekday === 0 || weekday === 5 || weekday === 6);
}

function isVerified(listing: Listing): boolean {
  return listing.tags.some(tag => /verificad/i.test(tag)) || Boolean(listing.sponsored);
}

export const SearchSwipePage: React.FC = () => {
  const { data: listings = [], isLoading } = useListings('all', 'all');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const characteristics = useMemo(() => {
    const tags = new Set<string>();
    listings.forEach(l => l.tags.slice(0, 4).forEach(tag => tags.add(tag)));
    return ['Todas', ...Array.from(tags).sort((a, b) => a.localeCompare(b, 'pt-BR')).slice(0, 24)];
  }, [listings]);

  const deck = useMemo(() => {
    return listings.filter(listing => {
      if (!matchesType(listing, filters.type)) return false;
      if (filters.characteristic !== 'Todas' && !listing.tags.includes(filters.characteristic)) {
        return false;
      }
      if (!matchesAvailability(listing, filters.availability)) return false;
      if (filters.verifiedOnly && !isVerified(listing)) return false;
      if (listing.coordinates) {
        return haversineKm(DEFAULT_CENTER, listing.coordinates) <= filters.distance;
      }
      return true;
    });
  }, [listings, filters]);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const selectClass =
    'mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500';

  const filterPanel = (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
      <button
        type="button"
        onClick={() => setFiltersOpen(prev => !prev)}
        className="mb-1 flex w-full items-center justify-between lg:hidden"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="text-brand-500" size={20} />
          <h2 className="text-lg font-black text-white">Filtros rápidos</h2>
        </div>
        <span className="text-xl leading-none text-zinc-500">{filtersOpen ? '−' : '+'}</span>
      </button>
      <div className="mb-4 hidden items-center gap-3 lg:flex">
        <SlidersHorizontal className="text-brand-500" size={20} />
        <h2 className="text-lg font-black text-white">Filtros rápidos</h2>
      </div>

      <div className={`space-y-4 ${filtersOpen ? 'mt-4' : 'hidden lg:block'}`}>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tipo</span>
          <select
            value={filters.type}
            onChange={e => update('type', e.target.value as TypeFilter)}
            className={selectClass}
          >
            {TYPES.map(type => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Característica</span>
          <select
            value={filters.characteristic}
            onChange={e => update('characteristic', e.target.value)}
            className={selectClass}
          >
            {characteristics.map(tag => (
              <option key={tag}>{tag}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
            <span>Distância</span>
            <span>{filters.distance} km</span>
          </span>
          <input
            type="range"
            min={2}
            max={50}
            value={filters.distance}
            onChange={e => update('distance', Number(e.target.value))}
            className="mt-3 w-full accent-brand-500"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Disponibilidade</span>
          <select
            value={filters.availability}
            onChange={e => update('availability', e.target.value as AvailabilityFilter)}
            className={selectClass}
          >
            {AVAILABILITY.map(option => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => update('verifiedOnly', !filters.verifiedOnly)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
            filters.verifiedOnly
              ? 'border-brand-500 bg-brand-500/10 text-brand-400'
              : 'border-zinc-800 bg-zinc-950 text-zinc-300'
          }`}
        >
          Apenas verificados
          <BadgeCheck size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-44 text-zinc-100 sm:px-6 md:pt-36 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
              <Sparkles size={14} />
              Buscar
            </div>
            <h1 className="max-w-4xl text-2xl font-black uppercase leading-snug tracking-tight text-white sm:text-3xl md:text-4xl">
              Busca com filtro, card por card.
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Filtre tipo, característica, distância e disponibilidade — e avance como um feed de matches.
            </p>
          </div>
          <Link
            to="/descobrir"
            className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-700 bg-zinc-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-500"
          >
            <LayoutGrid size={16} />
            Ver em lista
          </Link>
        </div>

        <SwipeDeck
          listings={deck}
          loading={isLoading}
          aside={filterPanel}
          emptyHint="Abra a distância ou remova filtros para continuar descobrindo."
        />
      </section>
    </main>
  );
};
