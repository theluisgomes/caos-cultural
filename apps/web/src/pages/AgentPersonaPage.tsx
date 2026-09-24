import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useListing, useListings } from '../hooks/useListings';
import { followTarget, unfollowTarget, fetchFollowing } from '../services/social';
import { listingsToPublicAgenda } from '../services/agenda';
import { AgendaItemActions } from '../components/agenda/AgendaItemActions';
import { useAuth } from '../context/AuthContext';
import { ListingType } from '../types';

export const AgentPersonaPage: React.FC = () => {
  const { id } = useParams();
  const { data: listing } = useListing(id);
  const { data: allListings = [] } = useListings('all', 'all');
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchFollowing(user.id).then(ids => {
      if (id && ids.includes(id)) {
        setFollowing(true);
        setFollowDocId(`${user.id}_agent_${id}`);
      }
    });
  }, [user, id]);

  const relatedEventsAll = useMemo(
    () =>
      listing
        ? allListings.filter(
            l => l.type === ListingType.EVENT && l.tags.some(t => listing.tags.includes(t))
          )
        : [],
    [allListings, listing]
  );
  const publicAgenda = useMemo(
    () => listingsToPublicAgenda(relatedEventsAll, id ?? 'perfil').slice(0, 6),
    [relatedEventsAll, id]
  );

  if (!listing) return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Carregando persona...</div>;

  const relatedEvents = relatedEventsAll.slice(0, 4);
  const relatedSpaces = allListings.filter(l => l.type === ListingType.SPACE).slice(0, 3);
  const relatedWorks = allListings.filter(l => l.type === ListingType.WORK && l.authorId === id).slice(0, 6);

  const toggleFollow = async () => {
    if (!user || !id) return;
    if (following && followDocId) {
      await unfollowTarget(followDocId);
      setFollowing(false);
      return;
    }
    await followTarget(user.id, 'agent', id);
    setFollowing(true);
    setFollowDocId(`${user.id}_agent_${id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="h-64 bg-zinc-900 relative">
        <img src={listing.imageUrl} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative">
        <h1 className="text-4xl font-black text-white">{listing.title}</h1>
        <p className="text-zinc-400 mt-2">{listing.subtitle}</p>
        <p className="text-zinc-300 mt-6 leading-relaxed">{listing.description}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {listing.tags.map(tag => (
            <Link key={tag} to={`/eventos?tag=${tag}`} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:border-brand-500">
              #{tag}
            </Link>
          ))}
        </div>

        <section className="mt-12 border-t border-zinc-800 pt-8 space-y-8">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Shows e exposições recentes</h2>
            <div className="flex flex-wrap gap-2">
              {relatedEvents.map(e => (
                <Link key={e.id} to={`/listing/${e.id}`} className="px-3 py-2 bg-zinc-900 rounded border border-zinc-800 text-sm text-zinc-300 hover:border-brand-500">
                  {e.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Espaços que frequenta</h2>
            <div className="flex flex-wrap gap-2">
              {relatedSpaces.map(s => (
                <Link key={s.id} to={`/listing/${s.id}`} className="px-3 py-2 bg-zinc-900 rounded border border-zinc-800 text-sm text-zinc-300 hover:border-brand-500">
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
          {relatedWorks.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Portfólio — obras</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {relatedWorks.map(w => (
                  <Link key={w.id} to={`/obra/${w.id}`} className="aspect-square overflow-hidden rounded bg-zinc-900">
                    <img src={w.imageUrl} alt={w.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Agenda pública</h2>
            {publicAgenda.length ? (
              <div className="space-y-3">
                {publicAgenda.map(item => (
                  <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-500">
                      {new Date(item.startsAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <h3 className="mt-1 font-bold text-white">{item.customTitle}</h3>
                    {item.customLocation && <p className="text-sm text-zinc-500">{item.customLocation}</p>}
                    <AgendaItemActions item={item} allowSaveToMine className="mt-3" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                Este perfil ainda não publicou eventos na agenda.
              </p>
            )}
            <Link to="/agenda" className="mt-4 inline-block text-sm font-bold text-brand-500">
              Abrir minha agenda →
            </Link>
          </div>
        </section>

        {user && (
          <button
            type="button"
            onClick={toggleFollow}
            className={`mt-8 px-6 py-3 rounded-full font-bold ${following ? 'bg-zinc-800 text-white' : 'bg-brand-600 text-white'}`}
          >
            {following ? 'Seguindo' : 'Seguir'}
          </button>
        )}
      </div>
    </div>
  );
};
