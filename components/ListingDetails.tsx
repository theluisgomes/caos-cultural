import React from 'react';
import { Listing, ListingType } from '../types';
import { ArrowLeft, Calendar, MapPin, Clock, Share2, Star, CreditCard, Info, ExternalLink } from 'lucide-react';

interface ListingDetailsProps {
  listing: Listing;
  onBack: () => void;
}

export const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onBack }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 animate-in slide-in-from-right duration-300">
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div className="flex gap-4">
           <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
             <Share2 size={20} className="text-zinc-400 hover:text-white" />
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Column: Image (Sticky on Desktop) */}
            <div className="relative h-[50vh] lg:h-[calc(100vh-73px)] lg:sticky lg:top-[73px]">
                <img 
                    src={listing.imageUrl} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent lg:hidden"></div>
                
                <div className="absolute bottom-6 left-6 right-6 lg:hidden">
                     <div className="inline-block bg-brand-600 text-white text-xs font-bold px-2 py-1 mb-2 uppercase tracking-widest">
                        {listing.type}
                    </div>
                    <h1 className="text-3xl font-black leading-tight mb-1">{listing.title}</h1>
                    <p className="text-zinc-300 font-medium">{listing.subtitle}</p>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="px-4 py-8 lg:p-12 flex flex-col gap-8">
                
                {/* Desktop Header */}
                <div className="hidden lg:block border-b border-zinc-800 pb-8">
                    <div className="inline-block bg-brand-600 text-white text-xs font-bold px-3 py-1 mb-4 uppercase tracking-widest rounded-sm">
                        {listing.type === ListingType.EVENT ? 'Evento Cultural' : 
                         listing.type === ListingType.SPACE ? 'Espaço Criativo' : 
                         listing.type === ListingType.ARTIST ? 'Perfil de Artista' : 'Experiência'}
                    </div>
                    <h1 className="text-5xl font-black leading-none tracking-tight mb-2 text-white">{listing.title}</h1>
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xl text-zinc-400 font-light">{listing.subtitle}</p>
                        <div className="flex items-center gap-1 text-brand-500 font-bold">
                            <Star size={18} fill="currentColor" />
                            <span>{listing.rating}</span>
                            <span className="text-zinc-600 font-normal text-sm ml-1">({listing.reviews} avaliações)</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 flex items-start gap-3">
                        <Calendar className="text-brand-500 shrink-0" size={20} />
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Data</h3>
                            <p className="font-medium text-white">{listing.date || 'Disponível sob consulta'}</p>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 flex items-start gap-3">
                        <Clock className="text-brand-500 shrink-0" size={20} />
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Horário</h3>
                            <p className="font-medium text-white">20:00 - 04:00</p>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 flex items-start gap-3 sm:col-span-2">
                        <MapPin className="text-brand-500 shrink-0" size={20} />
                        <div className="w-full">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Localização</h3>
                            <p className="font-medium text-white">{listing.subtitle}</p>
                            <div className="w-full h-32 bg-zinc-800 mt-3 rounded overflow-hidden relative opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                 {/* Fake Map Preview */}
                                 <div className="absolute inset-0" style={{
                                     backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
                                     backgroundSize: '10px 10px'
                                 }}></div>
                                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-zinc-400 flex flex-col items-center">
                                    <MapPin size={24} />
                                    <span className="text-xs mt-1 font-bold">VER NO MAPA</span>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Info size={20} />
                        Sobre
                    </h3>
                    <p className="text-zinc-300 leading-relaxed text-lg font-light">
                        {listing.description} 
                        <br/><br/>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {listing.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 uppercase tracking-wider">
                            #{tag}
                        </span>
                    ))}
                </div>

            </div>
        </div>

        {/* Bottom Action Bar (Mobile) */}
        <div className="fixed bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800 p-4 lg:hidden flex justify-between items-center gap-4 z-40">
             <div className="flex flex-col">
                 <span className="text-xs text-zinc-500 uppercase">Preço</span>
                 <span className="font-bold text-xl text-white">{listing.price || 'Grátis'}</span>
             </div>
             <button className="flex-1 bg-brand-600 text-white font-bold py-3 rounded shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                 GARANTIR VAGA
             </button>
        </div>

        {/* Floating Action Bar (Desktop) */}
        <div className="hidden lg:block fixed bottom-8 right-8 z-40">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-2xl w-80">
                 <div className="flex justify-between items-end mb-6">
                     <div>
                        <p className="text-sm text-zinc-500">Valor por pessoa</p>
                        <h3 className="text-3xl font-bold text-white">{listing.price || 'Grátis'}</h3>
                     </div>
                     <div className="text-right">
                        <div className="flex items-center gap-1 text-brand-500 text-sm font-bold">
                            <Star size={14} fill="currentColor" />
                            {listing.rating}
                        </div>
                     </div>
                 </div>
                 <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all flex justify-center items-center gap-2">
                     <CreditCard size={18} />
                     {listing.type === ListingType.EVENT ? 'COMPRAR INGRESSO' : 'RESERVAR AGORA'}
                 </button>
                 <p className="text-center text-xs text-zinc-600 mt-4">
                    Pagamento seguro processado pelo CAOS.
                 </p>
            </div>
        </div>

    </div>
  );
};