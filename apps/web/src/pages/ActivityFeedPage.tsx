import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../hooks/useListings';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { filterActivity } from '../services/activityFeed';
import type { ActivityFilter } from '../domain/activity';

/**
 * Feed de atividades — "Feed ≠ CAOS" (estudo p. 5).
 * Mostra o que rolou com quem você segue, com filtros Tudo/Pessoas/Espaços/Eventos.
 */

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: 'all', label: 'Tudo' },
  { id: 'people', label: 'Pessoas' },
  { id: 'spaces', label: 'Espaços' },
  { id: 'events', label: 'Eventos' },
];

const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (Math.abs(days) >= 1) return relativeFormatter.format(days, 'day');
  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) >= 1) return relativeFormatter.format(hours, 'hour');
  return relativeFormatter.format(Math.round(diffMs / 60_000), 'minute');
}

export const ActivityFeedPage: React.FC = () => {
  const { user } = useAuth();
  const { data: listings = [] } = useListings('all', 'all');
  const { data: activity = [], isLoading } = useActivityFeed(user?.id, listings);
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const items = useMemo(() => filterActivity(activity, filter).slice(0, 60), [activity, filter]);
  const followingCount = activity.filter(item => item.fromFollowing).length;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-8 pt-16 text-zinc-100 sm:px-6 md:pt-36 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-400 md:mb-3 md:px-4 md:py-2 md:text-xs md:tracking-[0.3em]">
          <Newspaper size={14} />
          Feed
        </div>
        <h1 className="text-xl font-black uppercase leading-snug tracking-tight text-white sm:text-5xl">
          O que rolou na sua rede.
        </h1>
        <p className="mt-3 text-sm font-light text-zinc-400 sm:text-base">
          Atualizações de quem você segue — perfis, espaços e eventos. Para descobrir gente nova, vá para o{' '}
          <Link to="/" className="font-bold text-brand-500">
            CAOS
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map(f => (
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

        {user && followingCount === 0 && !isLoading && (
          <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
            Você ainda não segue ninguém — o feed mostra a cena inteira por enquanto. Siga perfis e espaços
            no CAOS para personalizar.
          </p>
        )}

        <div className="mt-8 space-y-3">
          {isLoading && <p className="text-zinc-600">Carregando feed...</p>}
          {!isLoading && items.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
              Nada por aqui ainda. Siga perfis e espaços para encher seu feed.
            </p>
          )}
          {items.map(item => (
            <Link
              key={item.id}
              to={item.targetHref}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-brand-500"
            >
              {item.targetImageUrl ? (
                <img src={item.targetImageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-600">
                  <Sparkles size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500">
                  <span className="font-bold text-zinc-300">{item.actorName}</span> {item.message} ·{' '}
                  {relativeTime(item.createdAt)}
                  {item.fromFollowing && (
                    <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      Seguindo
                    </span>
                  )}
                </p>
                <h2 className="truncate text-lg font-bold text-white">{item.targetTitle}</h2>
                <p className="truncate text-sm text-zinc-500">{item.targetSubtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};
