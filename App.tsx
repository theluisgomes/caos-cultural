import React, { useState, useEffect } from 'react';
import { Map, ArrowDown } from 'lucide-react';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ListingCard } from './components/ListingCard';
import { MapVisualizer } from './components/MapVisualizer';
import { Footer } from './components/Footer';
import { fetchCulturalListings } from './services/geminiService';
import { Listing } from './types';

const App: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchCulturalListings(category);
      setListings(data);
      setLoading(false);
    };
    loadData();
  }, [category]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-brand-500 selection:text-white">
      <Header />
      
      {/* Hero Section - Artsy & Bold */}
      <section className="relative pt-40 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-zinc-800 mb-8">
        <div className="flex flex-col justify-end">
          <h1 className="text-[13vw] sm:text-[11vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter text-white uppercase break-words mix-blend-screen">
            <span className="block">Onde o</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-600">
              CAOS
            </span>
            <span className="block">vira Arte.</span>
          </h1>
          
          <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="text-xl md:text-2xl text-zinc-400 max-w-lg font-light leading-relaxed">
              Um ecossistema vivo para mapear, conectar e descobrir eventos, espaços e criadores.
            </p>
            <div className="hidden md:flex items-center gap-2 text-brand-500 font-mono text-sm animate-bounce">
              <ArrowDown size={20} />
              <span>EXPLORE O INEXPLORADO</span>
            </div>
          </div>
        </div>
      </section>

      <CategoryBar selected={category} onSelect={setCategory} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 min-h-[60vh]">
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="animate-pulse flex flex-col gap-3">
                 <div className="bg-zinc-800 aspect-[4/5] rounded-sm"></div>
                 <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                 <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
               </div>
             ))}
          </div>
        ) : (
          <>
            {listings.length === 0 ? (
              <div className="text-center py-20 border border-zinc-800 rounded-lg border-dashed">
                <h2 className="text-3xl font-bold text-white mb-2">Vazio.</h2>
                <p className="text-zinc-500">Ainda não há arte nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Map Toggle Button */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40">
        <button 
          onClick={() => setShowMap(true)}
          className="bg-white text-black px-6 py-3.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2 font-bold text-sm tracking-wide"
        >
          <span>MAPA</span>
          <Map size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Full Screen Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[60] bg-zinc-950 animate-in fade-in duration-300">
            <div className="h-full w-full relative">
                <MapVisualizer listings={listings} onClose={() => setShowMap(false)} />
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default App;