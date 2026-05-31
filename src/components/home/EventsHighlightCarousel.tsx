import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { useListings } from '../../hooks/useListings';
import { buildEventHighlights, formatHighlightDate } from '../../lib/eventHighlights';
import { Listing } from '../../types';

const SPONSORED_CENTER = 2;
const DESKTOP_MQ = '(min-width: 1024px)';

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MQ).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

interface HighlightCardProps {
  listing: Listing;
  isCenter: boolean;
  isDesktop: boolean;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ listing, isCenter, isDesktop }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-2xl border bg-zinc-950 ${
        isCenter
          ? 'border-brand-500/40 shadow-[0_24px_60px_rgba(225,29,72,0.25)]'
          : 'border-zinc-800'
      } ${listing.sponsored && isCenter ? 'ring-2 ring-amber-500/60' : ''}`}
    >
      {/* Mobile: vertical | Desktop: horizontal */}
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div
          className={`relative shrink-0 overflow-hidden ${
            isCenter
              ? 'aspect-[3/4] lg:aspect-auto lg:w-[58%] lg:min-h-[220px] lg:max-h-[260px]'
              : 'aspect-[4/5] lg:aspect-auto lg:w-[42%] lg:min-h-[140px] lg:max-h-[160px]'
          }`}
        >
          <img
            src={listing.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading={isCenter ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/70 lg:via-black/25 lg:to-transparent" />
          {listing.sponsored && isCenter && (
            <span className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
              Patrocinado
            </span>
          )}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            {formatHighlightDate(listing)}
          </div>
        </div>

        <div
          className={`text-left flex flex-col justify-center ${
            isCenter ? 'p-4 lg:p-6 lg:w-[42%]' : 'p-3 lg:p-4 lg:w-[58%] bg-zinc-900/95 lg:bg-zinc-950'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 truncate">
            {listing.subtitle}
          </p>
          <h3
            className={`font-black text-white leading-tight mt-1 ${
              isCenter
                ? 'text-lg lg:text-2xl line-clamp-3'
                : 'text-sm lg:text-base line-clamp-2'
            }`}
          >
            {listing.title}
          </h3>
          {isCenter && (
            <>
              {isDesktop && (
                <p className="text-zinc-400 text-sm mt-2 line-clamp-2 hidden lg:block">{listing.description}</p>
              )}
              <p className="text-brand-500 text-sm font-bold mt-2 lg:mt-3">{listing.price ?? 'Consulte'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface EventsHighlightCarouselProps {
  onSearch?: (query: string) => void;
}

export const EventsHighlightCarousel: React.FC<EventsHighlightCarouselProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data: listings = [], isLoading } = useListings('all', 'all');
  const slides = useMemo(() => buildEventHighlights(listings), [listings]);
  const [activeIndex, setActiveIndex] = useState(SPONSORED_CENTER);
  const [query, setQuery] = useState('');
  const city = 'São Paulo';

  useEffect(() => {
    if (slides.length && activeIndex >= slides.length) {
      setActiveIndex(Math.min(SPONSORED_CENTER, slides.length - 1));
    }
  }, [slides.length, activeIndex]);

  const go = useCallback(
    (delta: number) => {
      if (!slides.length) return;
      setActiveIndex(prev => (prev + delta + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, go]);

  const openListing = (listing: Listing) => {
    navigate(`/listing/${listing.id}`, { state: { listing } });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
      return;
    }
    navigate(`/eventos${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  if (isLoading) {
    return (
      <section className="bg-zinc-950 border-b border-zinc-800 py-12">
        <div className="max-w-6xl mx-auto px-4 animate-pulse h-[420px] lg:h-[300px] bg-zinc-900 rounded-2xl" />
      </section>
    );
  }

  if (!slides.length) return null;

  const cardWidth = isDesktop ? { center: 720, side: 440 } : { center: 280, side: 260 };
  const stepPx = isDesktop ? 380 : 220;
  const maxOffset = isDesktop ? 1 : 2;

  return (
    <section className="bg-zinc-950 border-b border-zinc-800 pt-28 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-lg"
          >
            <Search className="ml-4 text-zinc-500 shrink-0" size={20} />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar experiências"
              className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder:text-zinc-500 focus:outline-none text-sm"
              aria-label="Buscar experiências"
            />
          </form>
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3.5 text-sm font-medium text-zinc-200 hover:border-zinc-600 min-w-[160px]"
          >
            <MapPin size={18} className="text-brand-500 shrink-0" />
            <span>{city}</span>
            <span className="text-zinc-600 text-xs">▾</span>
          </button>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500 mb-2">Em destaque</p>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">Próximos eventos</h2>

        <div className={`relative ${isDesktop ? '' : '[perspective:1400px]'}`}>
          <div
            className={`relative flex items-center justify-center ${
              isDesktop ? 'min-h-[280px]' : 'min-h-[340px] md:min-h-[400px]'
            }`}
          >
            {slides.map((listing, index) => {
              const offset = index - activeIndex;
              const abs = Math.abs(offset);
              if (abs > maxOffset) return null;

              const isCenter = offset === 0;
              const scale = isCenter ? 1 : isDesktop ? 0.88 - abs * 0.04 : 0.78 - abs * 0.06;
              const rotateY = isDesktop ? offset * -6 : offset * -14;
              const zIndex = 10 - abs;
              const translatePx = offset * stepPx;
              const widthPx = isCenter ? cardWidth.center : cardWidth.side;

              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => openListing(listing)}
                  className="absolute left-1/2 top-1/2 -translate-y-1/2 transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl max-w-[92vw]"
                  style={{
                    width: widthPx,
                    transform: `translateX(calc(-50% + ${translatePx}px)) translateY(-50%) scale(${scale}) rotateY(${rotateY}deg)`,
                    zIndex,
                    opacity: abs > 1 ? 0.5 : abs === 1 ? (isDesktop ? 0.65 : 0.82) : 1,
                    transformStyle: isDesktop ? undefined : 'preserve-3d',
                  }}
                  aria-label={listing.title}
                  aria-current={isCenter ? 'true' : undefined}
                >
                  <HighlightCard listing={listing} isCenter={isCenter} isDesktop={isDesktop} />
                </button>
              );
            })}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-0 lg:-left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 text-zinc-900 shadow-lg flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors"
                aria-label="Evento anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-0 lg:-right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 text-zinc-900 shadow-lg flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors"
                aria-label="Próximo evento"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-8 bg-brand-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
