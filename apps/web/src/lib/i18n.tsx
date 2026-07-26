import React, { createContext, useContext } from 'react';

type Locale = 'pt-BR' | 'en-US';

const messages: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    explore: 'Descobrir',
    events: 'Eventos',
    agents: 'Usuários',
    spaces: 'Espaços',
    caos: 'CAOS',
    feed: 'Feed',
    search: 'Buscar',
    agenda: 'Agenda',
    profile: 'Perfil',
  },
  'en-US': {
    explore: 'Discover',
    events: 'Events',
    agents: 'Users',
    spaces: 'Spaces',
    caos: 'CAOS',
    feed: 'Feed',
    search: 'Search',
    agenda: 'Agenda',
    profile: 'Profile',
  },
};

const I18nContext = createContext({ locale: 'pt-BR' as Locale, t: (k: string) => messages['pt-BR'][k] ?? k });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const locale: Locale = 'pt-BR';
  const t = (key: string) => messages[locale][key] ?? key;
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
