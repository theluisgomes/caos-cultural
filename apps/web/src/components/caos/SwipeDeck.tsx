import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Heart, MapPin, RotateCcw, Search, Star, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  /** Painel lateral opcional (filtros, radar). */
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

  useEffect(() => {
    setIndex(0);
  }, [listings.length]);

  const deck = useMemo(() => listings.filter(l => !passed.includes(l.id)), [listings, passed]);
  const active = deck[index % Math.max(deck.length, 1)];

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
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr_320px]">
      <aside className="order-2 space-y-4 lg:order-1">
        {aside}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-zinc-500">Seu radar</h3>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <div className="rounded-2xl bg-zinc-950 p-4">
              <div className="text-2xl font-black text-white">{deck.length}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">no deck</div>
            </div>
            <div className="rounded-2xl bg-zinc-950 p-4">
              <div className="text-2xl font-black text-brand-500">{liked.length}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">curtidos</div>
            </div>
            <div className="rounded-2xl bg-zinc-950 p-4">
              <div className="text-2xl font-black text-zinc-300">{passed.length}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">passados</div>
            </div>
          </div>
          {message && (
            <p className="mt-4 rounded-2xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">
              {message}
            </p>
          )}
        </div>
      </aside>

      <section className="order-1 flex flex-col items-center lg:order-2">
        {loading ? (
          <div className="w-full animate-pulse rounded-[2rem] border border-zinc-800 bg-zinc-900/60 py-40" />
        ) : active ? (
          <div className="relative w-full max-w-xl px-1">
            <div className="absolute left-0 top-10 h-[78%] w-full rotate-[-4deg] rounded-[2rem] border border-zinc-800 bg-zinc-900/70" />
            <div className="absolute right-0 top-10 h-[78%] w-full rotate-[4deg] rounded-[2rem] border border-zinc-800 bg-zinc-900/70" />

            <article
              className="relative overflow-hidden rounded-[2rem] border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
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
                className="block w-full text-left"
                aria-label={`Abrir ${active.title}`}
              >
                <div className="relative aspect-[4/5]">
                  <img src={active.imageUrl} alt={active.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
                    {Math.round((active.rating / 5) * 100)}% match
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                        {TYPE_LABEL[active.type] ?? 'Card'}
                      </span>
                      {active.sponsored && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
                          <BadgeCheck size={13} /> Patrocinado
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">{active.title}</h2>
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                      <MapPin size={16} />
                      {active.subtitle}
                      {active.date ? ` • ${active.date}` : ''}
                    </div>
                  </div>
                </div>
              </button>

              <div className="space-y-5 p-6">
                <p className="line-clamp-4 text-lg font-light leading-relaxed text-zinc-300">
                  {active.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {active.tags.slice(0, 6).map(tag => (
                    <span key={tag} className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <CardActions listing={active} variant="inline" onDone={setMessage} />
              </div>
            </article>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => move('pass')}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-red-500 hover:text-red-400"
                aria-label="Passar card"
              >
                <X size={28} />
              </button>
              <button
                onClick={() => move('super')}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/60 bg-purple-500/10 text-purple-300 hover:bg-purple-500 hover:text-white"
                aria-label="Super match"
              >
                <Star size={24} />
              </button>
              <button
                onClick={() => move('like')}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.45)] hover:bg-brand-500"
                aria-label="Curtir card"
              >
                <Heart size={29} fill="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <Search className="mx-auto mb-4 text-zinc-700" size={48} />
            <h2 className="text-3xl font-black text-white">Sem cards por aqui.</h2>
            <p className="mt-2 text-zinc-400">{emptyHint}</p>
          </div>
        )}
      </section>

      <aside className="order-3 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">Próximos cards</h3>
          <button onClick={reset} className="text-zinc-500 hover:text-brand-500" aria-label="Reiniciar deck">
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="space-y-3">
          {deck.slice(index + 1, index + 5).map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => openDetails(item)}
              className="flex w-full items-center gap-3 rounded-2xl bg-zinc-950 p-3 text-left hover:bg-zinc-900"
            >
              <img src={item.imageUrl} alt={item.title} className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-bold text-white">{item.title}</h4>
                <p className="truncate text-xs text-zinc-500">
                  {TYPE_LABEL[item.type] ?? ''} • {item.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

function targetTypeOf(listing: Listing) {
  if (listing.type === ListingType.SPACE) return 'space' as const;
  if (listing.type === ListingType.WORK) return 'work' as const;
  if (listing.type === ListingType.ARTIST) return 'agent' as const;
  return 'event' as const;
}
