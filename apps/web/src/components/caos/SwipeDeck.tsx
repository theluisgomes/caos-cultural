import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Heart, Layers, MapPin, RotateCcw, Search, Star, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { heroBackgroundUrl } from '../../lib/contextualImage';
import { recordInteraction } from '../../services/interactions';
import { CardActions } from '../interactions/CardActions';
import { Listing, ListingType } from '../../types';

/**
 * Deck de descoberta (CAOS): um card por vez, curtir / passar / super.
 * Consome `Listing[]` reais (eventos, espaços, usuários e obras) e alimenta
 * `recordInteraction`, que treina o ranking em `services/algorithm.ts`.
 */

export const TYPE_LABEL: Record<string, string> = {
  [ListingType.EVENT]: 'Evento',
  [ListingType.SPACE]: 'Espaço',
  [ListingType.ARTIST]: 'Usuário',
  [ListingType.WORK]: 'Obra',
  [ListingType.EXPERIENCE]: 'Experiência',
};

interface SwipeDeckProps {
  listings: Listing[];
  loading?: boolean;
  /** Filtros ou controles extras — faixa compacta acima do card. */
  aside?: React.ReactNode;
  emptyHint?: string;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  listings,
  loading = false,
  aside,
  emptyHint = 'Abra a distância ou remova filtros para continuar descobrindo.',
}) => {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [listings.length]);

  useEffect(() => {
    if (!queueOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQueueOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [queueOpen]);

  const deck = useMemo(() => listings.filter(l => !passed.includes(l.id)), [listings, passed]);
  const active = deck[index % Math.max(deck.length, 1)];
  const upcoming = deck.slice(index + 1, index + 6);

  const move = async (action: 'pass' | 'like' | 'super') => {
    if (!active) return;
    if (!user) {
      openLogin();
      return;
    }

    if (action === 'pass') {
      setPassed(prev => [...prev, active.id]);
      setMessage(`Você passou ${active.title}.`);
      await recordInteraction(user.id, 'ignore', targetTypeOf(active), active.id);
    } else {
      setLiked(prev => [...prev, active.id]);
      setMessage(
        action === 'super' ? `Super match enviado para ${active.title}.` : `Você curtiu ${active.title}.`
      );
      await recordInteraction(user.id, 'like', targetTypeOf(active), active.id);
      setIndex(prev => prev + 1);
      return;
    }
    setIndex(prev => prev);
  };

  const openDetails = (listing: Listing) => {
    setQueueOpen(false);
    if (listing.type === ListingType.WORK) {
      navigate(`/obra/${listing.id}`, { state: { listing } });
      return;
    }
    if (listing.type === ListingType.SPACE) {
      navigate(`/espaco/${listing.id}`, { state: { listing } });
      return;
    }
    if (listing.type === ListingType.EVENT || listing.type === ListingType.EXPERIENCE) {
      navigate(`/evento/${listing.id}`, { state: { listing } });
      return;
    }
    navigate(`/listing/${listing.id}`, { state: { listing } });
  };

  const reset = () => {
    setIndex(0);
    setLiked([]);
    setPassed([]);
    setMessage('Deck reiniciado.');
    setQueueOpen(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center sm:max-w-md">
      {aside && <div className="mb-3 w-full min-w-0">{aside}</div>}

      <div className="mb-2 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 sm:mb-3 sm:text-[11px]">
        <span>
          <span className="text-white">{deck.length}</span> no deck
        </span>
        <span>
          <span className="text-brand-500">{liked.length}</span> curtidos
        </span>
        <span>
          <span className="text-zinc-300">{passed.length}</span> passados
        </span>
      </div>

      {loading ? (
        <div className="h-[min(50dvh,22rem)] w-full animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
      ) : active ? (
        <div className="relative flex w-full min-w-0 flex-col">
          <article
            className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
            onTouchStart={e => {
              (e.currentTarget as HTMLElement).dataset.tx = String(e.touches[0].clientX);
            }}
            onTouchEnd={e => {
              const startX = Number((e.currentTarget as HTMLElement).dataset.tx);
              const dx = e.changedTouches[0].clientX - startX;
              if (dx < -60) move('pass');
              else if (dx > 60) move('like');
            }}
          >
            <button
              type="button"
              onClick={() => openDetails(active)}
              className="block w-full min-w-0 text-left"
              aria-label={`Abrir ${active.title}`}
            >
              <div className="relative h-[min(46dvh,20rem)] w-full sm:h-[min(50dvh,24rem)]">
                <img
                  src={heroBackgroundUrl(active.imageUrl)}
                  alt={active.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                  {Math.round((active.rating / 5) * 100)}% match
                </div>
                <div className="absolute bottom-0 left-0 right-0 min-w-0 p-3 sm:p-4">
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                      {TYPE_LABEL[active.type] ?? 'Card'}
                    </span>
                    {active.sponsored && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                        <BadgeCheck size={12} /> Patrocinado
                      </span>
                    )}
                  </div>
                  <h2 className="line-clamp-2 break-words text-xl font-black leading-snug tracking-tight text-white sm:text-2xl">
                    {active.title}
                  </h2>
                  <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-300 sm:text-xs">
                    <MapPin size={12} className="shrink-0" />
                    <span className="min-w-0 truncate">
                      {active.subtitle}
                      {active.date ? ` • ${active.date}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <div className="min-w-0 space-y-2.5 p-3 sm:space-y-3 sm:p-4">
              <p className="line-clamp-2 break-words text-sm font-light leading-relaxed text-zinc-300">
                {active.description}
              </p>
              {active.tags.length > 0 && (
                <div className="flex min-w-0 gap-1.5 overflow-hidden">
                  {active.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="max-w-[9rem] truncate rounded-full border border-zinc-700 px-2.5 py-0.5 text-[11px] text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <CardActions listing={active} variant="inline" onDone={setMessage} />
            </div>
          </article>

          <div className="mt-3 flex items-center justify-center gap-2.5 sm:mt-4 sm:gap-3">
            <button
              onClick={() => move('pass')}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-red-500 hover:text-red-400 sm:h-14 sm:w-14"
              aria-label="Passar card"
            >
              <X size={22} />
            </button>
            <button
              onClick={() => move('super')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-purple-500/60 bg-purple-500/10 text-purple-300 hover:bg-purple-500 hover:text-white sm:h-12 sm:w-12"
              aria-label="Super match"
            >
              <Star size={18} />
            </button>
            <button
              onClick={() => move('like')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.45)] hover:bg-brand-500 sm:h-14 sm:w-14"
              aria-label="Curtir card"
            >
              <Heart size={22} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={() => setQueueOpen(true)}
              className="flex h-11 items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:border-brand-500 hover:text-brand-500 sm:h-12 sm:px-4 sm:text-xs"
              aria-label="Ver próximos cards"
            >
              <Layers size={15} />
              Fila
              {upcoming.length > 0 && (
                <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-400">{upcoming.length}</span>
              )}
            </button>
          </div>
          {message && <p className="mt-2 text-center text-xs text-zinc-400">{message}</p>}
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center sm:p-12">
          <Search className="mx-auto mb-4 text-zinc-700" size={40} />
          <h2 className="text-xl font-black text-white sm:text-2xl">Sem cards por aqui.</h2>
          <p className="mt-2 text-sm text-zinc-400">{emptyHint}</p>
        </div>
      )}

      {queueOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setQueueOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="swipe-queue-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="swipe-queue-title" className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
                Próximos cards
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="text-zinc-500 hover:text-brand-500"
                  aria-label="Reiniciar deck"
                >
                  <RotateCcw size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setQueueOpen(false)}
                  className="text-zinc-500 hover:text-white"
                  aria-label="Fechar fila"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {upcoming.length ? (
                upcoming.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openDetails(item)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
                  >
                    <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-bold text-white">{item.title}</h4>
                      <p className="truncate text-xs text-zinc-500">
                        {TYPE_LABEL[item.type] ?? ''} • {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-zinc-500">Não há mais cards na fila.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function targetTypeOf(listing: Listing) {
  if (listing.type === ListingType.SPACE) return 'space' as const;
  if (listing.type === ListingType.WORK) return 'work' as const;
  if (listing.type === ListingType.ARTIST) return 'agent' as const;
  return 'event' as const;
}
