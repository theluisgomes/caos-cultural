import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile, Listing, ListingType } from '../types';
import {
  Bookmark,
  CalendarDays,
  Clock,
  Copy,
  Grid,
  List,
  LogOut,
  Map as MapIcon,
  MapPin,
  Network,
  Plus,
  Settings,
  Share2,
} from 'lucide-react';
import { ListingCard } from './ListingCard';
import { MapVisualizer } from './MapVisualizer';
import { ReputationBadges } from './reputation/ReputationBadges';
import { EndorsementBadges } from './reputation/EndorsementBadges';
import { NetworkTab } from './profile/NetworkTab';
import { useLists } from '../hooks/useLists';
import { useAgenda } from '../hooks/useAgenda';

interface UserDashboardProps {
  user: UserProfile;
  myListings: Listing[];
  onEdit?: () => void;
  onLogout?: () => void | Promise<void>;
}

type ProfileTab = 'portfolio' | 'agenda' | 'lists' | 'map' | 'network';

const calendarDays = [
  { day: '18', week: 'SEG' },
  { day: '19', week: 'TER' },
  { day: '20', week: 'QUA' },
  { day: '21', week: 'QUI' },
  { day: '22', week: 'SEX' },
  { day: '23', week: 'SAB' },
  { day: '24', week: 'DOM' },
];

const calendarEvents = [
  {
    id: 'cal-1',
    day: '22',
    month: 'NOV',
    time: '20:00',
    title: 'Exposição: Sombras Digitais',
    place: 'Galeria Vermelho • Pinheiros',
    status: 'Confirmado',
    tone: 'brand',
  },
  {
    id: 'cal-2',
    day: '23',
    month: 'NOV',
    time: '16:30',
    title: 'Workshop: Mapping 101',
    place: 'Sesc Pompéia',
    status: 'Vai visitar',
    tone: 'zinc',
  },
  {
    id: 'cal-3',
    day: '24',
    month: 'NOV',
    time: '21:00',
    title: 'Neon Jazz Night',
    place: 'Underground Bunker',
    status: 'Convite enviado',
    tone: 'zinc',
  },
];

const personalMapPins = [
  {
    id: 'pin-1',
    type: 'Evento',
    title: 'Sombras Digitais',
    place: 'Galeria Vermelho',
    visits: 4,
    lastCheckIn: 'Hoje, 20:00',
    coordinates: { lat: -23.5614, lng: -46.6819 },
  },
  {
    id: 'pin-2',
    type: 'Locação',
    title: 'Bunker Studio',
    place: 'Vila Madalena',
    visits: 9,
    lastCheckIn: 'Visitante frequente',
    coordinates: { lat: -23.5538, lng: -46.6914 },
  },
  {
    id: 'pin-3',
    type: 'Evento',
    title: 'Rave Abstrata',
    place: 'Brás',
    visits: 2,
    lastCheckIn: 'Sáb, 29 Nov',
    coordinates: { lat: -23.5448, lng: -46.6168 },
  },
];

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, myListings, onEdit, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('portfolio');
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const { data: lists = [] } = useLists(user.id);
  const { data: agendaItems = [] } = useAgenda(user.id);
  const personalMapListings = useMemo<Listing[]>(() => {
    if (myListings.length) return myListings;
    return personalMapPins.map((pin, index) => ({
      id: pin.id,
      type: index === 1 ? ListingType.SPACE : ListingType.EVENT,
      title: pin.title,
      subtitle: pin.place,
      description: `${pin.visits} visita(s) registradas. Último check-in: ${pin.lastCheckIn}.`,
      imageUrl: `https://picsum.photos/seed/${pin.id}/600/400`,
      price: 'Grátis',
      rating: 4.8,
      reviews: pin.visits,
      date: pin.lastCheckIn,
      coordinates: pin.coordinates,
      tags: [pin.type, 'Mapa pessoal'],
    }));
  }, [myListings]);
  const profileSlug = user.handle.replace(/^@/, '') || user.id;
  const shareLinks = useMemo(() => {
    const baseUrl = typeof window === 'undefined' ? 'https://caos-cultural.web.app' : window.location.origin;
    return {
      portfolio: `${baseUrl}/profile/${profileSlug}`,
      calendar: `${baseUrl}/profile/${profileSlug}/calendar`,
      map: `${baseUrl}/profile/${profileSlug}/map`,
    };
  }, [profileSlug]);

  const shareProfileSection = async (label: string, url: string) => {
    await navigator.clipboard?.writeText(url);
    setShareMessage(`${label} copiado para compartilhar.`);
    window.setTimeout(() => setShareMessage(null), 2200);
  };

  const tabClass = (tab: ProfileTab) =>
    `pb-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${
      activeTab === tab ? 'text-brand-500 border-b-2 border-brand-500' : 'text-zinc-500 hover:text-zinc-300'
    }`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative group">
        <img 
          src={user.coverUrl} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950"></div>
        
        <button
          onClick={() => shareProfileSection('Portfólio', shareLinks.portfolio)}
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-black transition-all"
        >
            <Share2 size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
        <div className="flex flex-col md:flex-row items-end md:items-start gap-6 mb-8">
          
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-950 overflow-hidden shadow-2xl bg-zinc-800 shrink-0">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-2 md:pt-20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                  {user.name}
                  <span className="text-xs font-normal py-1 px-2 rounded border border-brand-500 text-brand-500 bg-brand-500/10 tracking-widest uppercase">
                    {user.role}
                  </span>
                </h1>
                <p className="text-zinc-400 font-medium">{user.handle}</p>
                <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                   <MapPin size={14} />
                   <span>{user.location}</span>
                   <span className="mx-1">•</span>
                   <span>{user.joinDate}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onLogout}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-2 rounded-full font-medium transition-colors text-sm flex items-center gap-2"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>
                <button
                    onClick={onEdit}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm flex items-center gap-2"
                >
                    <Settings size={16} />
                    <span>Editar Perfil</span>
                </button>
                <Link to="/create" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all text-sm flex items-center gap-2">
                    <Plus size={18} />
                    <span>Criar</span>
                </Link>
              </div>
            </div>

            {/* Stats — no topo, ao lado do avatar (estilo IG) */}
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { label: 'Seguidores', value: user.stats.followers },
                  { label: 'Criações', value: user.stats.projectsCreated },
                  { label: 'Eventos', value: user.stats.eventsAttended },
                  { label: 'Check-ins', value: personalMapPins.reduce((sum, pin) => sum + pin.visits, 0) },
                ].map(stat => (
                  <div key={stat.label} className="text-left">
                    <div className="text-2xl font-black leading-none text-white">{stat.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">{stat.label}</div>
                  </div>
                ))}
            </div>

            <p className="mt-6 text-zinc-300 max-w-2xl leading-relaxed font-light text-lg">
              {user.bio}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
                {user.disciplines.map(disc => (
                    <span key={disc} className="text-xs text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full hover:border-zinc-600 cursor-default">
                        {disc}
                    </span>
                ))}
            </div>

            <ReputationBadges eventsAttended={user.stats.eventsAttended} className="mt-6" />
            {myListings[0] && (
              <EndorsementBadges target={myListings[0]} targetType="agent" className="mt-3" />
            )}
          </div>
        </div>

        {/* Share Panel */}
        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Compartilhável</p>
            <h2 className="mt-1 text-xl font-black text-white">Seu mapa, calendário e portfólio em links separados</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Envie para amigos verem onde você marcou presença, o que vem na sua agenda e seus projetos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => shareProfileSection('Portfólio', shareLinks.portfolio)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 hover:border-brand-500 hover:text-brand-500"
            >
              Portfólio
            </button>
            <button
              onClick={() => shareProfileSection('Calendário', shareLinks.calendar)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 hover:border-brand-500 hover:text-brand-500"
            >
              Calendário
            </button>
            <button
              onClick={() => shareProfileSection('Mapa', shareLinks.map)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 hover:border-brand-500 hover:text-brand-500"
            >
              Mapa
            </button>
          </div>
          {shareMessage && (
            <div className="md:col-span-2 flex items-center gap-2 text-sm text-emerald-400">
              <Copy size={14} />
              {shareMessage}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-zinc-800 mb-8 overflow-x-auto hide-scrollbar">
            <button 
                onClick={() => setActiveTab('portfolio')}
                className={tabClass('portfolio')}
            >
                <Grid size={16} />
                Portfólio
            </button>
            <button 
                onClick={() => setActiveTab('agenda')}
                className={tabClass('agenda')}
            >
                <CalendarDays size={16} />
                Agenda
            </button>
            <button 
                onClick={() => setActiveTab('lists')}
                className={tabClass('lists')}
            >
                <List size={16} />
                Listas e salvos
            </button>
            <button
                onClick={() => setActiveTab('map')}
                className={tabClass('map')}
            >
                <MapIcon size={16} />
                Mapa pessoal
            </button>
            <button
                onClick={() => setActiveTab('network')}
                className={tabClass('network')}
            >
                <Network size={16} />
                Rede
            </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'portfolio' && (
                <section className="space-y-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Portfólio</p>
                        <h3 className="mt-1 text-2xl font-black text-white">Projetos, obras e publicações</h3>
                        <p className="mt-1 text-sm text-zinc-400">Tudo que você publica no CAOS fica reunido em um só lugar.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {myListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                        <Link to="/create" className="aspect-[4/5] border border-zinc-800 border-dashed rounded-sm flex flex-col items-center justify-center text-zinc-600 hover:text-brand-500 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer group">
                            <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold uppercase tracking-widest text-xs">Novo Projeto</span>
                        </Link>
                    </div>
                </section>
            )}

            {activeTab === 'agenda' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Novembro</p>
                                <h3 className="text-2xl font-black text-white">Calendário cultural</h3>
                            </div>
                            <button
                              onClick={() => shareProfileSection('Calendário', shareLinks.calendar)}
                              className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-600"
                            >
                              <Share2 size={14} />
                              Compartilhar
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map(day => {
                              const hasEvent = calendarEvents.some(event => event.day === day.day);
                              return (
                                <div
                                  key={day.day}
                                  className={`min-h-28 rounded-xl border p-3 ${
                                    hasEvent
                                      ? 'border-brand-500/50 bg-brand-500/10'
                                      : 'border-zinc-800 bg-zinc-950/60'
                                  }`}
                                >
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{day.week}</div>
                                  <div className="mt-1 text-2xl font-black text-white">{day.day}</div>
                                  {hasEvent && <div className="mt-5 h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_18px_rgba(225,29,72,0.9)]" />}
                                </div>
                              );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Agenda</p>
                          <h4 className="mt-1 text-xl font-black text-white">Eventos salvos</h4>
                          <p className="mt-1 text-sm text-zinc-400">Calendário e agenda agora vivem na mesma aba.</p>
                        </div>
                        {agendaItems.length ? agendaItems.map(item => (
                          <div key={item.id} className="rounded-2xl border-l-4 border-brand-500 bg-zinc-900 p-5">
                            <h4 className="font-bold text-white">{item.customTitle || 'Evento salvo'}</h4>
                            <p className="text-zinc-400 text-sm">{new Date(item.startsAt).toLocaleString('pt-BR')}</p>
                            {item.customLocation && <p className="mt-1 text-xs text-zinc-500">{item.customLocation}</p>}
                          </div>
                        )) : (
                          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-500">
                            Salve eventos para montar sua agenda.
                          </div>
                        )}
                        {calendarEvents.map(event => (
                          <div
                            key={event.id}
                            className={`rounded-2xl border p-5 ${
                              event.tone === 'brand'
                                ? 'border-brand-500/50 bg-brand-500/10'
                                : 'border-zinc-800 bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="rounded-xl bg-black px-3 py-2 text-center">
                                <div className="text-[10px] font-bold text-brand-500">{event.month}</div>
                                <div className="text-2xl font-black text-white">{event.day}</div>
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                  <Clock size={13} />
                                  {event.time}
                                </div>
                                <h4 className="text-lg font-black text-white">{event.title}</h4>
                                <p className="mt-1 text-sm text-zinc-400">{event.place}</p>
                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{event.status}</span>
                                  <button className="text-xs font-bold uppercase tracking-widest text-brand-500 hover:text-brand-400">
                                    Marcar no mapa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Link to="/agenda" className="inline-flex text-brand-500 text-sm font-bold">Abrir agenda completa →</Link>
                    </div>
                </div>
            )}

            {activeTab === 'lists' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="space-y-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Listas</p>
                            <h3 className="mt-1 text-2xl font-black text-white">Curadorias e coleções</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lists.length ? lists.map(list => (
                                <div key={list.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-white">{list.name}</h4>
                                    <p className="text-zinc-500 text-sm mt-1">{list.isPublic ? 'Pública' : 'Privada'} · {list.itemCount} itens</p>
                                </div>
                            )) : (
                                <div className="md:col-span-2 rounded-lg border border-dashed border-zinc-800 p-8 text-zinc-500">
                                    Crie listas para organizar artistas, espaços, eventos e obras.
                                </div>
                            )}
                        </div>
                    </section>
                    <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <Bookmark size={38} className="text-zinc-700 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Salvos</p>
                        <h3 className="mt-1 text-xl font-black text-white">Sua coleção de inspirações</h3>
                        <p className="mt-2 text-sm text-zinc-400">Itens salvos aparecem junto das listas para facilitar a organização.</p>
                        <Link to="/explorar" className="mt-5 inline-flex text-brand-500 text-sm font-bold hover:text-brand-400">Explorar o CAOS →</Link>
                    </aside>
                </div>
            )}

            {activeTab === 'network' && <NetworkTab userId={user.id} myListings={myListings} />}

            {activeTab === 'map' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="relative h-[560px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                        <MapVisualizer listings={personalMapListings} />
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Mapa pessoal</p>
                            <h3 className="mt-1 text-2xl font-black text-white">Seus rastros culturais</h3>
                            <p className="mt-2 text-sm text-zinc-400">Pins aparecem onde você publicou, salvou ou fez check-in.</p>
                          </div>
                          <button
                            onClick={() => shareProfileSection('Mapa', shareLinks.map)}
                            className="rounded-full bg-white p-2 text-black hover:bg-brand-500 hover:text-white"
                            title="Compartilhar mapa"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>
                      </div>
                      {personalMapPins.map(pin => (
                        <div key={pin.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">{pin.type}</p>
                              <h4 className="mt-1 text-lg font-black text-white">{pin.title}</h4>
                              <p className="mt-1 text-sm text-zinc-400">{pin.place}</p>
                            </div>
                            <div className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">{pin.visits}x</div>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                            <span className="text-xs text-zinc-500">{pin.lastCheckIn}</span>
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-500">
                              <MapPin size={13} />
                              Plotado
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};