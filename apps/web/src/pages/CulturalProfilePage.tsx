import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Layers } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { deriveCulturalProfile } from '../services/culturalProfiles';

/**
 * Perfil Cultural — nível permanente do evento em dois níveis (estudo p. 18).
 * Ex.: "Festival Afluentes" reunindo as ocorrências "Afluentes 2025/2026".
 */

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export const CulturalProfilePage: React.FC = () => {
  const { id } = useParams();
  const { data: listings = [], isLoading } = useListings('all', 'all');

  const derived = useMemo(
    () => (id ? deriveCulturalProfile(listings, id) : null),
    [listings, id]
  );

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Carregando perfil cultural...</div>;
  }
  if (!derived) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">
        Perfil cultural não encontrado.{' '}
        <Link to="/eventos" className="text-brand-500">
          Ver eventos
        </Link>
      </div>
    );
  }

  const { profile, occurrences } = derived;
  const now = Date.now();

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <div className="relative h-64 md:h-80">
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-500">
          <Layers size={12} /> Perfil cultural
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tighter text-white md:text-5xl">{profile.name}</h1>
        <p className="mt-2 text-zinc-400">{profile.tagline}</p>
        <p className="mt-6 max-w-3xl text-lg font-light leading-relaxed text-zinc-300">
          {profile.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.tags.map(tag => (
            <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
              {tag}
            </span>
          ))}
        </div>

        <section className="mt-12 border-t border-zinc-800 pt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
            <CalendarDays size={14} className="text-brand-500" /> Edições ({occurrences.length})
          </h2>
          <div className="space-y-3">
            {occurrences.map(occurrence => {
              const startsAt = occurrence.meta?.startsAt;
              const time = startsAt ? new Date(startsAt).getTime() : 0;
              const isPast = time > 0 && time < now;
              return (
                <Link
                  key={occurrence.id}
                  to={`/evento/${occurrence.id}`}
                  state={{ listing: occurrence }}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-brand-500 ${
                    isPast ? 'border-zinc-800 bg-zinc-900/40 opacity-70' : 'border-zinc-800 bg-zinc-900/70'
                  }`}
                >
                  <img src={occurrence.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-500">
                      {startsAt ? dateFormatter.format(new Date(startsAt)) : 'Data a confirmar'}
                      {isPast ? ' · edição passada' : ''}
                    </p>
                    <h3 className="truncate font-bold text-white">{occurrence.title}</h3>
                    <p className="truncate text-sm text-zinc-500">{occurrence.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
