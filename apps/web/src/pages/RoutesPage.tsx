import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Map as MapIcon,
  Plus,
  Route as RouteIcon,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../hooks/useListings';
import { useCulturalRoutes } from '../hooks/useCulturalRoutes';
import { useAgenda } from '../hooks/useAgenda';
import { estimateDurationLabel, type RouteStop } from '../domain/culturalRoute';
import {
  deleteRoute,
  listingToStop,
  routeShareUrl,
  saveRoute,
} from '../services/culturalRoutes';
import { fetchSavedPlaces } from '../services/mapSavedPlaces';
import { useQuery } from '@tanstack/react-query';
import { ListingType, type Listing } from '../types';

/**
 * Roteiros culturais (plano, fase 6): montar roteiro com lugares/eventos
 * salvos, ordenar paradas, salvar com nome, ver no mapa e compartilhar link.
 */

export const RoutesPage: React.FC = () => {
  const { user, openLogin } = useAuth();
  const qc = useQueryClient();
  const { data: listings = [] } = useListings('all', 'all');
  const { data: routes = [], isLoading } = useCulturalRoutes(user?.id);
  const { data: agendaItems = [] } = useAgenda(user?.id);
  const { data: savedPlaces = [] } = useQuery({
    queryKey: ['mapPins', user?.id],
    queryFn: () => (user ? fetchSavedPlaces(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  const [name, setName] = useState('');
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /** Candidatos: o que o usuário salvou (mapa + agenda) e, como apoio, a cena publicada. */
  const candidates = useMemo(() => {
    const savedIds = new Set([
      ...savedPlaces.map(p => p.targetId),
      ...agendaItems.map(item => item.eventId).filter(Boolean),
    ]);
    const saved = listings.filter(l => savedIds.has(l.id));
    const rest = listings.filter(
      l =>
        !savedIds.has(l.id) &&
        (l.type === ListingType.SPACE || l.type === ListingType.EVENT) &&
        Boolean(l.coordinates)
    );
    return { saved, rest: rest.slice(0, 12) };
  }, [listings, savedPlaces, agendaItems]);

  const addStop = (listing: Listing) => {
    setStops(prev =>
      prev.some(s => s.targetId === listing.id) ? prev : [...prev, listingToStop(listing, prev.length)]
    );
  };

  const removeStop = (targetId: string) => {
    setStops(prev => prev.filter(s => s.targetId !== targetId));
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    setStops(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((stop, i) => ({ ...stop, orderIndex: i }));
    });
  };

  const resetForm = () => {
    setName('');
    setStops([]);
    setEditingId(null);
  };

  const handleSave = async (isPublic: boolean) => {
    if (!user) {
      openLogin();
      return;
    }
    if (!name.trim() || !stops.length) {
      setMessage('Dê um nome ao roteiro e adicione ao menos uma parada.');
      return;
    }
    const saved = await saveRoute({
      id: editingId ?? undefined,
      ownerUserId: user.id,
      name: name.trim(),
      stops,
      isPublic,
    });
    qc.invalidateQueries({ queryKey: ['culturalRoutes', user.id] });
    resetForm();
    setMessage(
      isPublic ? `Roteiro "${saved.name}" salvo e publicado.` : `Roteiro "${saved.name}" salvo.`
    );
  };

  const handleShare = async (routeId: string) => {
    await navigator.clipboard?.writeText(routeShareUrl(routeId));
    setMessage('Link do roteiro copiado.');
  };

  const handleDelete = async (routeId: string) => {
    await deleteRoute(routeId);
    qc.invalidateQueries({ queryKey: ['culturalRoutes', user?.id] });
    setMessage('Roteiro removido.');
  };

  const startEdit = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    setEditingId(route.id);
    setName(route.name);
    setStops(route.stops);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-zinc-950 px-4 pb-8 pt-16 sm:px-6 md:pb-24 md:pt-28 lg:px-8">
      <h1 className="mb-2 flex items-center gap-3 text-4xl font-black tracking-tighter text-white">
        <RouteIcon className="text-brand-500" /> Rotas culturais
      </h1>
      <p className="mb-8 text-zinc-500">
        Monte o roteiro do dia ou do fim de semana com o que você salvou, ordene as paradas e compartilhe.
      </p>

      {message && (
        <p className="mb-6 rounded-xl border border-brand-500/40 bg-brand-500/10 p-4 text-sm text-brand-300">
          {message}
        </p>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
          {editingId ? 'Editando roteiro' : 'Novo roteiro'}
        </h2>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do roteiro — ex.: Sábado em Pinheiros"
          className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-brand-500"
        />

        <div className="mt-5">
          <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-500">
            Paradas ({stops.length}) · {estimateDurationLabel(stops.length)}
          </h3>
          {stops.length ? (
            <ol className="space-y-2">
              {stops.map((stop, index) => (
                <li
                  key={stop.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{stop.label}</p>
                    <p className="truncate text-xs text-zinc-500">{stop.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => moveStop(index, -1)}
                    className="p-1 text-zinc-500 hover:text-white"
                    aria-label="Subir parada"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStop(index, 1)}
                    className="p-1 text-zinc-500 hover:text-white"
                    aria-label="Descer parada"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStop(stop.targetId)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                    aria-label="Remover parada"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
              Escolha lugares e eventos abaixo para montar o trajeto.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-500"
          >
            <Check size={14} /> Salvar roteiro
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:border-brand-500 hover:text-brand-500"
          >
            <Share2 size={14} /> Salvar e publicar
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-zinc-800 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
          Seus salvos
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(candidates.saved.length ? candidates.saved : candidates.rest).map(listing => (
            <button
              key={listing.id}
              type="button"
              onClick={() => addStop(listing)}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-left hover:border-brand-500"
            >
              <img src={listing.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{listing.title}</p>
                <p className="truncate text-xs text-zinc-500">{listing.subtitle}</p>
              </div>
              <Plus size={16} className="shrink-0 text-brand-500" />
            </button>
          ))}
          {!candidates.saved.length && !candidates.rest.length && (
            <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500 sm:col-span-2">
              Salve espaços no mapa e eventos na agenda para montar roteiros.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Meus roteiros</h2>
        {isLoading ? (
          <p className="text-zinc-600">Carregando...</p>
        ) : routes.length ? (
          <div className="space-y-3">
            {routes.map(route => (
              <div key={route.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{route.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {route.stops.length} paradas · {estimateDurationLabel(route.stops.length)} ·{' '}
                      {route.isPublic ? 'pública' : 'privada'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/mapa?rota=${route.id}`}
                      className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:border-brand-500 hover:text-brand-500"
                    >
                      <MapIcon size={13} /> Ver no mapa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleShare(route.id)}
                      className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:border-brand-500 hover:text-brand-500"
                    >
                      <Share2 size={13} /> Compartilhar
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(route.id)}
                      className="rounded-full border border-zinc-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:border-brand-500 hover:text-brand-500"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(route.id)}
                      className="rounded-full border border-zinc-800 p-1.5 text-zinc-500 hover:border-red-500 hover:text-red-400"
                      aria-label="Excluir roteiro"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {route.stops.map(stop => (
                    <span
                      key={stop.id}
                      className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-500"
                    >
                      {stop.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            {user ? 'Nenhum roteiro salvo ainda.' : 'Entre para montar e salvar seus roteiros.'}
          </p>
        )}
      </section>
    </div>
  );
};
