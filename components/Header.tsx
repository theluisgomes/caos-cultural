import React, { useState, useEffect } from 'react';
import { Search, Menu, User, Globe } from 'lucide-react';

interface HeaderProps {
  onProfileClick?: () => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfileClick, onLogoClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center cursor-pointer group" onClick={onLogoClick}>
          <div className="text-white font-black text-3xl tracking-tighter group-hover:text-brand-500 transition-colors">CAOS</div>
        </div>

        {/* Search Bar (Desktop) */}
        <div className={`hidden md:flex items-center bg-zinc-900 border ${isScrolled ? 'border-zinc-700' : 'border-zinc-800'} rounded-full shadow-lg divide-x divide-zinc-700 cursor-pointer text-sm transition-all hover:bg-zinc-800`}>
          <div className="px-5 py-2.5 font-medium text-zinc-300 hover:text-white transition-colors pl-6">
            Explorar
          </div>
          <div className="px-5 py-2.5 font-medium text-zinc-300 hover:text-white transition-colors">
            Qualquer lugar
          </div>
          <div className="px-5 py-2.5 text-zinc-400 font-normal flex items-center gap-3 pr-2">
            <span className="group-hover:text-zinc-200">Adicionar datas</span>
            <div className="bg-brand-500 text-white p-2 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              <Search size={14} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4 text-zinc-300">
          <div className="hidden md:block font-medium text-sm hover:bg-zinc-800 px-4 py-2 rounded-full cursor-pointer transition-colors">
            Seja um criador
          </div>
          <div className="hover:bg-zinc-800 p-2 rounded-full cursor-pointer transition-colors">
            <Globe size={18} />
          </div>
          <div 
            onClick={onProfileClick}
            className="flex items-center gap-2 border border-zinc-700 bg-zinc-900 rounded-full p-1 pl-3 hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <Menu size={18} />
            <div className="bg-zinc-700 text-white rounded-full p-1">
              <User size={18} fill="currentColor" className="text-zinc-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search (Visible only on mobile) */}
      <div className="md:hidden px-4 pb-3 mt-2">
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 gap-3 shadow-sm">
          <Search size={20} className="text-zinc-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-200">Para onde vamos?</span>
            <span className="text-xs text-zinc-500">Eventos • Espaços • Artistas</span>
          </div>
        </div>
      </div>
    </header>
  );
};