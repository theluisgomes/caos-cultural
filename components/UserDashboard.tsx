import React, { useState } from 'react';
import { UserProfile, Listing, ListingType } from '../types';
import { Settings, Share2, MapPin, Calendar, Grid, Bookmark, Plus } from 'lucide-react';
import { ListingCard } from './ListingCard';

interface UserDashboardProps {
  user: UserProfile;
  myListings: Listing[];
  onEdit?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, myListings, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'schedule' | 'saved'>('portfolio');

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
        
        <button className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-black transition-all">
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
                    onClick={onEdit}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm flex items-center gap-2"
                >
                    <Settings size={16} />
                    <span>Editar Perfil</span>
                </button>
                <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all text-sm flex items-center gap-2">
                    <Plus size={18} />
                    <span>Criar</span>
                </button>
              </div>
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

            {/* Stats */}
            <div className="flex gap-8 mt-8 py-6 border-y border-zinc-900">
                <div className="text-center md:text-left">
                    <div className="text-2xl font-black text-white">{user.stats.followers}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Seguidores</div>
                </div>
                <div className="text-center md:text-left">
                    <div className="text-2xl font-black text-white">{user.stats.projectsCreated}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Criações</div>
                </div>
                <div className="text-center md:text-left">
                    <div className="text-2xl font-black text-white">{user.stats.eventsAttended}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Eventos</div>
                </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-zinc-800 mb-8 overflow-x-auto hide-scrollbar">
            <button 
                onClick={() => setActiveTab('portfolio')}
                className={`pb-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'portfolio' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Grid size={16} />
                Portfólio
            </button>
            <button 
                onClick={() => setActiveTab('schedule')}
                className={`pb-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'schedule' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Calendar size={16} />
                Agenda
            </button>
            <button 
                onClick={() => setActiveTab('saved')}
                className={`pb-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'saved' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <Bookmark size={16} />
                Salvos
            </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'portfolio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {myListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                    {/* Add new card placeholder */}
                    <div className="aspect-[4/5] border border-zinc-800 border-dashed rounded-sm flex flex-col items-center justify-center text-zinc-600 hover:text-brand-500 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer group">
                        <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">Novo Projeto</span>
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="flex flex-col gap-4">
                    <div className="bg-zinc-900 p-6 rounded-sm border-l-4 border-brand-500 flex justify-between items-center hover:bg-zinc-800 transition-colors cursor-pointer">
                        <div>
                            <div className="text-brand-500 font-bold text-xs uppercase tracking-widest mb-1">Hoje, 20:00</div>
                            <h3 className="text-white font-bold text-xl">Exposição: Sombras Digitais</h3>
                            <p className="text-zinc-400 text-sm mt-1">Galeria Vermelho • Pinheiros</p>
                        </div>
                        <div className="bg-black px-4 py-2 rounded text-xs font-bold text-white border border-zinc-800">INGRESSO: QR-293</div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-sm border-l-4 border-zinc-700 flex justify-between items-center hover:bg-zinc-800 transition-colors cursor-pointer opacity-75 hover:opacity-100">
                        <div>
                            <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Sábado, 22 Nov</div>
                            <h3 className="text-white font-bold text-xl">Workshop: Mapping 101</h3>
                            <p className="text-zinc-400 text-sm mt-1">Sesc Pompéia</p>
                        </div>
                        <div className="text-zinc-500 text-sm">Confirmado</div>
                    </div>
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="text-center py-20">
                    <Bookmark size={48} className="mx-auto text-zinc-800 mb-4" />
                    <h3 className="text-zinc-500 font-medium">Sua coleção de inspirações está vazia.</h3>
                    <button className="mt-4 text-brand-500 text-sm hover:underline">Explorar o CAOS</button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};