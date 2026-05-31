import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, X, LogIn, PlusCircle, Info, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../lib/i18n';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, openLogin, logout } = useAuth();
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const go = (path: string) => {
    navigate(path);
    close();
  };

  const handleProfileClick = () => {
    if (user) setUserMenuOpen(prev => !prev);
    else { openLogin(); close(); }
  };

  const handleLoginClick = () => {
    openLogin();
    close();
  };

  const handleLogout = async () => {
    await logout();
    go('/');
  };

  const navBtn = (label: string, icon: React.ReactNode, onClick: () => void) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium text-left"
    >
      {icon}
      {label}
    </button>
  );

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center cursor-pointer group" onClick={() => go('/')}>
          <div className="text-white font-black text-3xl tracking-tighter group-hover:text-brand-500 transition-colors">CAOS</div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-zinc-300">
          <Link to="/eventos" className="font-medium text-sm hover:bg-zinc-800 px-3 py-2 rounded-full">{t('events')}</Link>
          <Link to="/agentes" className="font-medium text-sm hover:bg-zinc-800 px-3 py-2 rounded-full">{t('agents')}</Link>
          <Link to="/espacos" className="font-medium text-sm hover:bg-zinc-800 px-3 py-2 rounded-full">{t('spaces')}</Link>
          <Link to="/agenda" className="font-medium text-sm hover:bg-zinc-800 px-3 py-2 rounded-full">Agenda</Link>
          <button
            onClick={() => go('/about')}
            className="font-medium text-sm hover:bg-zinc-800 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            Sobre o CAOS
          </button>
          <button
            onClick={() => go('/faq')}
            className="font-medium text-sm hover:bg-zinc-800 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            FAQ
          </button>
          <button
            onClick={() => go('/create')}
            className="font-medium text-sm bg-zinc-900 border border-zinc-700 hover:border-brand-500 hover:text-brand-500 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            + Criar projeto
          </button>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 border border-zinc-700 bg-zinc-900 rounded-full p-1 pl-3 hover:border-zinc-500 transition-colors cursor-pointer"
              aria-label={user ? 'Abrir menu do usuário' : 'Entrar'}
              aria-expanded={user ? userMenuOpen : undefined}
            >
              <Menu size={18} />
              <div className="bg-zinc-700 text-white rounded-full p-1 overflow-hidden w-8 h-8 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User size={18} fill="currentColor" className="text-zinc-400" />
                )}
              </div>
            </button>

            {user && userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 p-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {navBtn(user.name || 'Meu perfil', <User size={16} className="text-zinc-400" />, () => go('/profile'))}
                {navBtn('Sair', <LogOut size={16} className="text-brand-500" />, handleLogout)}
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-3 relative" ref={menuRef}>
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="flex items-center gap-2 border border-zinc-700 bg-zinc-900 rounded-full p-2 hover:border-zinc-500 transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-zinc-300" />}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full right-4 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 p-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {navBtn('Sobre o CAOS', <Info size={16} className="text-brand-500" />, () => go('/about'))}
              {navBtn('FAQ', <HelpCircle size={16} className="text-purple-400" />, () => go('/faq'))}
              {navBtn('+ Criar projeto', <PlusCircle size={16} className="text-emerald-400" />, () => go('/create'))}
              <div className="border-t border-zinc-800 my-2" />
              {user ? (
                <>
                  {navBtn(user.name || 'Meu perfil', <User size={16} className="text-zinc-400" />, () => go('/profile'))}
                  {navBtn('Sair', <LogOut size={16} className="text-brand-500" />, handleLogout)}
                </>
              ) : (
                navBtn('Entrar / Cadastrar', <LogIn size={16} className="text-brand-500" />, handleLoginClick)
              )}
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden px-4 pb-3 mt-2">
        <button
          onClick={() => go('/search')}
          className="flex w-full items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 gap-3 shadow-sm text-left"
        >
          <Search size={20} className="text-zinc-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-200">Para onde vamos?</span>
            <span className="text-xs text-zinc-500">Eventos • Espaços • Artistas</span>
          </div>
        </button>
      </div>
    </header>
  );
};
