import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  History,
  Image as ImageIcon,
  Info,
  MapPin,
  Users,
} from 'lucide-react';
import { useListing, useListings } from '../hooks/useListings';
import { CardActions } from '../components/interactions/CardActions';
import { ListingType, type Listing } from '../types';
import { heroBackgroundUrl } from '../lib/contextualImage';
import { parseLocationParts } from '../lib/locationParts';

/**
 * Perfil de Espaço (estudo p. 10/21) com abas na ordem pedida:
 * Sobre (primeiro) · Programação · Galeria · Memória · Comunidade.
 */

type SpaceTab = 'about' | 'program' | 'gallery' | 'memory' | 'community';

const TABS: Array<{ id: SpaceTab; label: string; icon: typeof Info }> = [
  { id: 'about', label: 'Sobre', icon: Info },
  { id: 'program', label: 'Programação', icon: CalendarDays },
  { id: 'gallery', label: 'Galeria', icon: ImageIcon },
  { id: 'memory', label: 'Memória', icon: History },
  { id: 'community', label: 'Comunidade', icon: Users },
];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function startTime(listing: Listing): number {
  const iso = listing.meta?.startsAt;
  const time = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
}

/** Eventos do espaço: ligação por `spaceId` quando existir, senão por local/tags. */
function eventsOfSpace(listings: Listing[], space: Listing): Listing[] {
  const label = space.title.toLowerCase();
  const neighborhood = space.meta?.neighborhood?.toLowerCase();
  return listings.filter(l => {
    if (l.type !== ListingType.EVENT && l.type !== ListingType.EXPERIENCE) return false;
    const subtitle = l.subtitle?.toLowerCase() ?? '';
    if (subtitle.includes(label)) return true;
    if (neighborhood && subtitle.includes(neighborhood)) return true;
    return l.tags.some(tag => space.tags.includes(tag));
  });
}

export const SpaceProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: space, isLoading } = useListing(id);
  const { data: allListings = [] } = useListings('all', 'all');
  const [tab, setTab] = useState<SpaceTab>('about');

  const related = useMemo(
    () => (space ? eventsOfSpace(allListings, space) : []),
    [allListings, space]
  );
  const now = Date.now();
  const upcoming = related.filter(l => startTime(l) >= now).sort((a, b) => startTime(a) - startTime(b));
  const past = related.filter(l => startTime(l) < now).sort((a, b) => startTime(b) - startTime(a));

  const gallery = useMemo(() => {
    if (!space) return [];
    const fromEvents = related.map(l => l.imageUrl).filter(Boolean);
    return Array.from(new Set([space.imageUrl, ...fromEvents])).slice(0, 12);
  }, [space, related]);

  const community = useMemo(
    () =>
      allListings
        .filter(l => l.type === ListingType.ARTIST && l.tags.some(tag => space?.tags.includes(tag)))
        .slice(0, 8),
    [allListings, space]
  );

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Carregando espaço...</div>;
  }
  if (!space) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">
        Espaço não encontrado.{' '}
        <Link to="/espacos" className="text-brand-500">
          Ver todos os espaços
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <div className="relative h-72 md:h-96">
        <img
          src={heroBackgroundUrl(
            space.imageUrl,
            parseLocationParts({
              location: space.subtitle,
              neighborhood: space.meta?.neighborhood,
              city: space.meta?.city,
            }),
          )}
          alt=""
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-24 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md md:top-28"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="mx-auto -mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <span className="inline-block rounded bg-brand-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          Espaço
        </span>
        <h1 className="mt-3 max-w-4xl text-2xl font-black leading-snug tracking-tight text-white sm:text-3xl md:text-4xl">
          {space.title}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-zinc-400">
          <MapPin size={16} /> {space.subtitle}
        </p>

        <CardActions listing={space} variant="inline" className="mt-6" />

        <div className="mt-8 flex items-center gap-6 overflow-x-auto border-b border-zinc-800 hide-scrollbar">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setTab(tabId)}
              className={`flex items-center gap-2 whitespace-nowrap pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                tab === tabId
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {tab === 'about' && (
            <section className="space-y-6">
              <p className="max-w-3xl text-lg font-light leading-relaxed text-zinc-300">
                {space.description}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tipo</p>
                  <p className="mt-1 font-bold text-white">{space.meta?.spaceKind ?? 'Espaço cultural'}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cidade</p>
                  <p className="mt-1 font-bold text-white">{space.meta?.city ?? space.subtitle}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Valor</p>
                  <p className="mt-1 font-bold text-white">{space.price}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {space.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {tab === 'program' && (
            <section className="space-y-3">
              <h2 className="text-2xl font-black text-white">Programação</h2>
              {upcoming.length ? (
                upcoming.map(event => (
                  <Link
                    key={event.id}
                    to={`/evento/${event.id}`}
                    state={{ listing: event }}
                    className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-brand-500"
                  >
                    <img src={event.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-500">
                        {event.meta?.startsAt ? dateFormatter.format(new Date(event.meta.startsAt)) : 'Em breve'}
                      </p>
                      <h3 className="truncate font-bold text-white">{event.title}</h3>
                      <p className="truncate text-sm text-zinc-500">{event.subtitle}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                  Nenhum evento futuro publicado para este espaço.
                </p>
              )}
            </section>
          )}

          {tab === 'gallery' && (
            <section>
              <h2 className="mb-4 text-2xl font-black text-white">Galeria</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {gallery.map(url => (
                  <div key={url} className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
                    <img src={url} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'memory' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Memória</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  O que já rolou aqui — base para as fotos do público num próximo momento.
                </p>
              </div>
              {past.length ? (
                <div className="space-y-3">
                  {past.map(event => (
                    <div key={event.id} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                      <img src={event.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover opacity-70" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                          {event.meta?.startsAt ? dateFormatter.format(new Date(event.meta.startsAt)) : 'Arquivo'}
                        </p>
                        <h3 className="truncate font-bold text-white">{event.title}</h3>
                      </div>
                      <Link
                        to={`/evento/${event.id}`}
                        state={{ listing: event }}
                        className="text-xs font-bold uppercase tracking-wider text-brand-500"
                      >
                        Ver
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                  Ainda não há eventos passados registrados neste espaço.
                </p>
              )}
              {gallery.length > 1 && (
                <div>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
                    Registros
                  </h3>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                    {gallery.slice(1).map(url => (
                      <div key={url} className="aspect-square overflow-hidden rounded-lg bg-zinc-900">
                        <img src={url} alt="" className="h-full w-full object-cover opacity-80" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === 'community' && (
            <section>
              <h2 className="mb-4 text-2xl font-black text-white">Comunidade</h2>
              {community.length ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {community.map(agent => (
                    <Link
                      key={agent.id}
                      to={`/agente/${agent.id}`}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center hover:border-brand-500"
                    >
                      <img
                        src={agent.imageUrl}
                        alt={agent.title}
                        className="mx-auto h-16 w-16 rounded-full object-cover"
                      />
                      <h3 className="mt-3 truncate font-bold text-white">{agent.title}</h3>
                      <p className="truncate text-xs text-zinc-500">{agent.subtitle}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                  Ainda não mapeamos a comunidade deste espaço.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
