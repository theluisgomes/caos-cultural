import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Layers,
  MapPin,
  Share2,
  Ticket,
  Users,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useListing, useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import { CardActions } from '../components/interactions/CardActions';
import { AgendaItemActions } from '../components/agenda/AgendaItemActions';
import { recordInteraction } from '../services/interactions';
import { saveListingToAgenda } from '../services/cardActions';
import { deriveCulturalProfile, seriesKeyOf } from '../services/culturalProfiles';
import { ListingType, type Listing } from '../types';
import type { AgendaItem } from '../domain/agenda';
import { heroBackgroundUrl } from '../lib/contextualImage';
import { parseLocationParts } from '../lib/locationParts';

/**
 * Página de Evento — ocorrência datada (estudo p. 19).
 * "Quero ir / Salvar / Compartilhar", contagem de interessados, line-up com
 * ícone de calendário (não relógio), local com mini-mapa e link para o
 * Perfil Cultural permanente (série do evento).
 */

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

function toAgendaItem(listing: Listing): AgendaItem | null {
  const startsAt = listing.meta?.startsAt;
  if (!startsAt) return null;
  return {
    id: `event_${listing.id}`,
    agendaId: 'event_page',
    addedByUserId: '',
    eventId: listing.id,
    customTitle: listing.title,
    customLocation: listing.subtitle || null,
    startsAt,
    endsAt: null,
    status: 'interested',
    notes: '',
    reminderMinutesBefore: null,
    createdAt: startsAt,
    updatedAt: startsAt,
  };
}

export const EventProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, openLogin } = useAuth();
  const { data: event, isLoading } = useListing(id);
  const { data: allListings = [] } = useListings('all', 'all');
  const [going, setGoing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const series = useMemo(() => {
    if (!event) return null;
    return deriveCulturalProfile(allListings, seriesKeyOf(event.title));
  }, [allListings, event]);

  const lineUp = useMemo(() => {
    if (!event) return [];
    return allListings
      .filter(l => l.type === ListingType.ARTIST && l.tags.some(tag => event.tags.includes(tag)))
      .slice(0, 6);
  }, [allListings, event]);

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Carregando evento...</div>;
  }
  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">
        Evento não encontrado.{' '}
        <Link to="/eventos" className="text-brand-500">
          Ver todos os eventos
        </Link>
      </div>
    );
  }

  const agendaItem = toAgendaItem(event);
  // Base estável de interessados enquanto os contadores reais não são agregados.
  const interested = event.reviews + (going ? 1 : 0);
  const heroSrc = heroBackgroundUrl(
    event.imageUrl,
    parseLocationParts({
      location: event.subtitle,
      neighborhood: event.meta?.neighborhood,
      city: event.meta?.city,
    }),
  );

  const handleGoing = async () => {
    if (!user) {
      openLogin();
      return;
    }
    await recordInteraction(user.id, 'rsvp_going', 'event', event.id);
    await saveListingToAgenda(user.id, event);
    qc.invalidateQueries({ queryKey: ['agenda', user.id] });
    setGoing(true);
    setMessage('Você marcou presença — o evento entrou na sua agenda.');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        /* usuário cancelou — cai no clipboard */
      }
    }
    await navigator.clipboard?.writeText(url);
    setMessage('Link copiado para compartilhar.');
    if (user) await recordInteraction(user.id, 'share', 'event', event.id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      <div className="relative h-52 md:h-96">
        <img src={heroSrc} alt="" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md md:top-28"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="mx-auto -mt-8 max-w-5xl px-4 sm:px-6 md:-mt-20 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-brand-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Evento
          </span>
          {series && series.occurrences.length > 1 && (
            <Link
              to={`/perfil-cultural/${series.profile.id}`}
              className="flex items-center gap-1.5 rounded border border-zinc-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-brand-500 hover:text-brand-500"
            >
              <Layers size={12} /> {series.profile.name}
            </Link>
          )}
        </div>

        <h1 className="mt-3 max-w-4xl text-2xl font-black leading-snug tracking-tight text-white sm:text-3xl md:text-4xl">
          {event.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-400">
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-brand-500" />
            {event.meta?.startsAt ? dateFormatter.format(new Date(event.meta.startsAt)) : event.date || 'Data a confirmar'}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-brand-500" />
            {event.subtitle}
          </span>
          <span className="flex items-center gap-2">
            <Ticket size={16} className="text-brand-500" />
            {event.price}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGoing}
            disabled={going}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              going
                ? 'bg-zinc-800 text-brand-400'
                : 'bg-brand-600 text-white shadow-[0_0_24px_rgba(225,29,72,0.4)] hover:bg-brand-500'
            }`}
          >
            {going ? <Check size={16} /> : <Users size={16} />}
            {going ? 'Você vai' : 'Quero ir'}
          </button>
          <CardActions listing={event} variant="inline" onDone={setMessage} />
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:border-brand-500 hover:text-brand-500"
          >
            <Share2 size={14} /> Compartilhar
          </button>
        </div>

        <p className="mt-3 text-sm text-zinc-500">
          <strong className="text-white">{interested}</strong> pessoas demonstraram interesse.
        </p>
        {message && <p className="mt-2 text-sm text-brand-400">{message}</p>}

        {agendaItem && <AgendaItemActions item={agendaItem} className="mt-4" />}

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Sobre o evento</h2>
              <p className="text-lg font-light leading-relaxed text-zinc-300">{event.description}</p>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                <CalendarDays size={14} className="text-brand-500" /> Line-up
              </h2>
              {lineUp.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {lineUp.map(agent => (
                    <Link
                      key={agent.id}
                      to={`/agente/${agent.id}`}
                      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-brand-500"
                    >
                      <img src={agent.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-white">{agent.title}</h3>
                        <p className="truncate text-xs text-zinc-500">{agent.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                  Line-up ainda não anunciado.
                </p>
              )}
            </div>

            {series && series.occurrences.length > 1 && (
              <div>
                <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
                  Outras edições
                </h2>
                <div className="flex flex-wrap gap-2">
                  {series.occurrences
                    .filter(o => o.id !== event.id)
                    .map(o => (
                      <Link
                        key={o.id}
                        to={`/evento/${o.id}`}
                        state={{ listing: o }}
                        className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:border-brand-500"
                      >
                        {o.title}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                <MapPin size={14} className="text-brand-500" /> Local
              </h3>
              <p className="font-bold text-white">{event.subtitle}</p>
              {event.coordinates ? (
                <>
                  <div
                    className="mt-3 h-32 rounded-lg border border-zinc-800 bg-zinc-950"
                    style={{
                      backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                    }}
                    aria-hidden
                  />
                  <Link
                    to="/mapa"
                    className="mt-3 inline-flex text-xs font-bold uppercase tracking-wider text-brand-500"
                  >
                    Abrir no mapa →
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">Endereço a confirmar.</p>
              )}
            </div>

            {event.authorId && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-500">Organização</h3>
                <Link to={`/agente/${event.authorId}`} className="font-bold text-white hover:text-brand-500">
                  Ver perfil do organizador →
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};
