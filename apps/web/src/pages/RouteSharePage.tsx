import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Map as MapIcon, Route as RouteIcon } from 'lucide-react';
import { useCulturalRoute } from '../hooks/useCulturalRoutes';
import { estimateDurationLabel } from '../domain/culturalRoute';

/** Página pública do roteiro — link compartilhável ("tipo Strava", estudo p. 16). */
export const RouteSharePage: React.FC = () => {
  const { id } = useParams();
  const { data: route, isLoading } = useCulturalRoute(id);

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Carregando roteiro...</div>;
  }
  if (!route) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">
        Roteiro não encontrado.{' '}
        <Link to="/rotas" className="text-brand-500">
          Ver rotas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-zinc-950 px-4 pb-24 pt-28 sm:px-6">
      <span className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-500">
        <RouteIcon size={12} /> Roteiro cultural
      </span>
      <h1 className="mt-3 text-4xl font-black tracking-tighter text-white">{route.name}</h1>
      <p className="mt-2 text-zinc-500">
        {route.stops.length} paradas · {estimateDurationLabel(route.stops.length)}
      </p>
      {route.description && <p className="mt-4 text-zinc-300">{route.description}</p>}

      <Link
        to={`/mapa?rota=${route.id}`}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-500"
      >
        <MapIcon size={14} /> Abrir no mapa
      </Link>

      <ol className="mt-8 space-y-3">
        {route.stops.map((stop, index) => (
          <li key={stop.id} className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
              {index + 1}
            </span>
            {stop.imageUrl && (
              <img src={stop.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold text-white">{stop.label}</h2>
              <p className="truncate text-sm text-zinc-500">{stop.subtitle}</p>
            </div>
            <Link
              to={
                stop.targetType === 'space'
                  ? `/espaco/${stop.targetId}`
                  : stop.targetType === 'event'
                    ? `/evento/${stop.targetId}`
                    : `/agente/${stop.targetId}`
              }
              className="text-xs font-bold uppercase tracking-wider text-brand-500"
            >
              Ver
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
};
