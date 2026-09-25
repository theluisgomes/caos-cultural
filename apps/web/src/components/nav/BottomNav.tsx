import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, Newspaper, Search, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Navegação inferior mobile (estudo p. 6):
 * Buscar · Feed · CAOS (central) · Agenda · Perfil.
 * Some no desktop, onde o Header cobre a navegação.
 */

const itemClass = (active: boolean) =>
  `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
    active ? 'text-brand-500' : 'text-zinc-500 hover:text-zinc-300'
  }`;

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();

  const goProfile = () => {
    if (user) navigate('/profile');
    else openLogin();
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md lg:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-end px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink to="/search" className={({ isActive }) => itemClass(isActive)}>
          <Search size={20} />
          Buscar
        </NavLink>
        <NavLink to="/feed" className={({ isActive }) => itemClass(isActive)}>
          <Newspaper size={20} />
          Feed
        </NavLink>

        <NavLink to="/" className="flex flex-1 flex-col items-center gap-1 py-1">
          {({ isActive }) => (
            <>
              <span
                className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-zinc-950 transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-[0_0_24px_rgba(225,29,72,0.6)]'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <Sparkles size={24} />
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isActive ? 'text-brand-500' : 'text-zinc-500'
                }`}
              >
                CAOS
              </span>
            </>
          )}
        </NavLink>

        <NavLink to="/agenda" className={({ isActive }) => itemClass(isActive)}>
          <CalendarDays size={20} />
          Agenda
        </NavLink>
        <button type="button" onClick={goProfile} className={itemClass(false)}>
          <User size={20} />
          Perfil
        </button>
      </div>
    </nav>
  );
};
