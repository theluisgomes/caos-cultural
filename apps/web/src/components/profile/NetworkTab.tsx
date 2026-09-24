import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import {
  CONNECTION_RELATION_LABEL,
  type ConnectionBucket,
} from '../../domain/connection';
import { fetchNetwork } from '../../services/connections';
import { useListings } from '../../hooks/useListings';
import type { Listing } from '../../types';

/**
 * Aba Rede do perfil (estudo p. 15):
 * Contatos · Colaborações · Seguindo · Seguidores, com rótulo de relação.
 */

const BUCKETS: Array<{ id: ConnectionBucket; label: string }> = [
  { id: 'contatos', label: 'Contatos' },
  { id: 'colaboracoes', label: 'Colaborações' },
  { id: 'seguindo', label: 'Seguindo' },
  { id: 'seguidores', label: 'Seguidores' },
];

interface NetworkTabProps {
  userId: string;
  myListings: Listing[];
}

export const NetworkTab: React.FC<NetworkTabProps> = ({ userId, myListings }) => {
  const { data: listings = [] } = useListings('all', 'all');
  const [bucket, setBucket] = useState<ConnectionBucket>('contatos');

  const ownedIds = useMemo(() => myListings.map(l => l.id), [myListings]);
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['network', userId, listings.length, ownedIds.length],
    queryFn: () => fetchNetwork(userId, listings, ownedIds),
    enabled: Boolean(userId) && listings.length > 0,
  });

  const visible = connections.filter(c => c.bucket === bucket);
  const counts = BUCKETS.map(b => ({
    ...b,
    count: connections.filter(c => c.bucket === b.id).length,
  }));

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Rede</p>
        <h3 className="mt-1 text-2xl font-black text-white">Quem caminha com você</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Contatos, colaborações e o grafo de quem você segue no CAOS.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {counts.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBucket(b.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              bucket === b.id
                ? 'bg-brand-600 text-white'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {b.label} ({b.count})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-zinc-600">Carregando rede...</p>
      ) : visible.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(connection => (
            <Link
              key={connection.id}
              to={connection.targetType === 'space' ? `/espaco/${connection.targetId}` : `/agente/${connection.targetId}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-brand-500"
            >
              {connection.avatarUrl ? (
                <img src={connection.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-600">
                  <Users size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-bold text-white">{connection.displayName}</h4>
                <p className="truncate text-xs text-zinc-500">{connection.subtitle}</p>
                <span className="mt-1 inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-400">
                  {CONNECTION_RELATION_LABEL[connection.relation]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
          Nada em {BUCKETS.find(b => b.id === bucket)?.label.toLowerCase()} ainda. Siga perfis e publique
          projetos para construir sua rede.
        </p>
      )}
    </section>
  );
};
