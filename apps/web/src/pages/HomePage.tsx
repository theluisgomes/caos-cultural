import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';
import { CreativePrompts } from '../components/gamification/CreativePrompts';
import { EventsHighlightCarousel } from '../components/home/EventsHighlightCarousel';

/**
 * Grid de descoberta — antigo "Explorar", renomeado para "Descobrir" (estudo p. 3).
 * A página inicial (`/`) agora é o CAOS (deck por swipe), em `pages/CaosPage`.
 */
export const DescobrirPage: React.FC = () => (
  <>
    <EventsHighlightCarousel />
    <FeedPage
      journey="all"
      title="Descobrir"
      subtitle="Descoberta ampla — eventos, usuários, espaços e obras em um só feed."
      compactHero
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <CreativePrompts />
    </div>
  </>
);

/** @deprecated Alias mantido para a rota legada `/explorar`. */
export const ExplorarPage = DescobrirPage;
