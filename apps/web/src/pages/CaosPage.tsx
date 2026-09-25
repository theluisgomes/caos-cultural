import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, LayoutGrid, Layers, Users } from 'lucide-react';
import { SwipeDeck } from '../components/caos/SwipeDeck';
import { FeedControls } from '../components/algorithm/FeedControls';
import { MacroJourneyBar } from '../components/feed/MacroJourneyBar';
import { useListings } from '../hooks/useListings';
import { applyFeedRanking } from '../services/algorithm';
import { useAuth } from '../context/AuthContext';
import { ListingType } from '../types';

type DeckFilter = 'all' | 'people' | 'spaces' | 'events';

const DECK_FILTERS: Array<{
  id: DeckFilter;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { id: 'all', label: 'Tudo', Icon: Layers },
  { id: 'people', label: 'Usuários', Icon: Users },
  { id: 'spaces', label: 'Espaços', Icon: Building2 },
  { id: 'events', label: 'Eventos', Icon: CalendarDays },
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
  const [deckInFocus, setDeckInFocus] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const deck = useMemo(() => {
    const byType = listings.filter(l => {
      if (filter === 'people') return l.type === ListingType.ARTIST;
      if (filter === 'spaces') return l.type === ListingType.SPACE;
      if (filter === 'events') return l.type === ListingType.EVENT || l.type === ListingType.EXPERIENCE;
      return l.type !== ListingType.WORK;
    });
    return applyFeedRanking(byType, user?.id);
  }, [listings, filter, user?.id]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          setDeckInFocus(true);
        }
      },
      { threshold: [0.35, 0.5] }
    );

    observer.observe(main);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        className={`mx-auto max-w-7xl border-b border-zinc-800 px-4 sm:px-6 lg:px-8 transition-[padding] duration-500 ${
          deckInFocus ? 'pb-3 pt-16 lg:pb-6 lg:pt-36' : 'pb-4 pt-16 lg:pb-6 lg:pt-36'
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div>
            <h1
              className={`max-w-xl overflow-hidden text-sm font-medium uppercase leading-relaxed tracking-[0.18em] text-zinc-400 transition-all duration-500 lg:max-h-none lg:text-base lg:leading-loose lg:opacity-100 ${
                deckInFocus
                  ? 'pointer-events-none mb-0 max-h-0 opacity-0 lg:pointer-events-auto lg:mb-0'
                  : 'max-h-40 opacity-100'
              }`}
            >
              Descoberta por química cultural.
            </h1>
            <p className="mt-2 hidden max-w-2xl text-sm font-light leading-relaxed text-zinc-400 lg:mt-5 lg:block lg:text-base">
              Um card por vez — usuários, espaços e eventos misturados. Curta, passe e salve: o algoritmo aprende
              com cada gesto.
            </p>
          </div>
          <Link
            to="/descobrir"
            className="hidden items-center gap-2 self-start rounded-full border border-zinc-700 bg-zinc-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-500 lg:inline-flex"
          >
            <LayoutGrid size={16} />
            Ver em lista
          </Link>
        </div>

        <div className={`flex flex-wrap gap-2 ${deckInFocus ? 'mt-0 lg:mt-6' : 'mt-4 lg:mt-6'}`}>
          {DECK_FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-label={f.label}
                title={f.label}
                aria-pressed={active}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)]'
                    : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <f.Icon size={18} strokeWidth={2.25} />
              </button>
            );
          })}
        </div>
      </section>

      <MacroJourneyBar />

      <main
        ref={mainRef}
        tabIndex={-1}
        onPointerDown={() => setDeckInFocus(true)}
        onFocusCapture={() => setDeckInFocus(true)}
        className="mx-auto min-h-0 max-w-7xl px-3 pb-6 pt-3 outline-none sm:px-6 sm:pb-8 sm:pt-6 lg:px-8"
      >
        <SwipeDeck
          listings={deck}
          loading={isLoading}
          emptyHint="Troque o filtro do deck ou volte mais tarde — novos cards entram conforme a cena publica."
        />
      </main>

      <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-6 lg:px-8">
        <FeedControls className="justify-center" />
      </div>
    </>
  );
};
