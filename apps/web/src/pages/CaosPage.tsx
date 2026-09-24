import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { SwipeDeck } from '../components/caos/SwipeDeck';
import { FeedControls } from '../components/algorithm/FeedControls';
import { MacroJourneyBar } from '../components/feed/MacroJourneyBar';
import { useListings } from '../hooks/useListings';
import { applyFeedRanking } from '../services/algorithm';
import { useAuth } from '../context/AuthContext';
import { ListingType } from '../types';

type DeckFilter = 'all' | 'people' | 'spaces' | 'events';

const DECK_FILTERS: Array<{ id: DeckFilter; label: string }> = [
  { id: 'all', label: 'Tudo' },
  { id: 'people', label: 'Usuários' },
  { id: 'spaces', label: 'Espaços' },
  { id: 'events', label: 'Eventos' },
];

/**
 * Página inicial CAOS (estudo p. 2): descoberta algorítmica por swipe,
 * misturando usuários + espaços + eventos com dados reais.
 * O grid de descoberta continua disponível em /descobrir.
 */
export const CaosPage: React.FC = () => {
  const { user } = useAuth();
  const { data: listings = [], isLoading } = useListings('all', 'all');
  const [filter, setFilter] = useState<DeckFilter>('all');

  const deck = useMemo(() => {
    const byType = listings.filter(l => {
      if (filter === 'people') return l.type === ListingType.ARTIST;
      if (filter === 'spaces') return l.type === ListingType.SPACE;
      if (filter === 'events') return l.type === ListingType.EVENT || l.type === ListingType.EXPERIENCE;
      return l.type !== ListingType.WORK;
    });
    return applyFeedRanking(byType, user?.id);
  }, [listings, filter, user?.id]);

  return (
    <>
      <section className="mx-auto max-w-7xl border-b border-zinc-800 px-4 pb-6 pt-44 sm:px-6 md:pt-36 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
              <Sparkles size={14} />
              CAOS
            </div>
            <h1 className="max-w-3xl text-2xl font-black uppercase leading-snug tracking-tight text-white sm:text-4xl md:text-5xl">
              Descoberta por química cultural.
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Um card por vez — usuários, espaços e eventos misturados. Curta, passe e salve: o algoritmo aprende
              com cada gesto.
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

        <div className="mt-6 flex flex-wrap gap-2">
          {DECK_FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.id
                  ? 'bg-brand-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)]'
                  : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <MacroJourneyBar />

      <main className="mx-auto min-h-[50vh] max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <SwipeDeck
          listings={deck}
          loading={isLoading}
          aside={<FeedControls />}
          emptyHint="Troque o filtro do deck ou volte mais tarde — novos cards entram conforme a cena publica."
        />
      </main>
    </>
  );
};
