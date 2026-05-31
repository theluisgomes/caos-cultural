import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';
import { CreativePrompts } from '../components/gamification/CreativePrompts';
import { EventsHighlightCarousel } from '../components/home/EventsHighlightCarousel';

export const ExplorarPage: React.FC = () => (
  <>
    <EventsHighlightCarousel />
    <FeedPage
      journey="all"
      title="Explorar"
      subtitle="Descoberta ampla — eventos, agentes, espaços e obras em um só feed."
      compactHero
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <CreativePrompts />
    </div>
  </>
);

export const HomePage: React.FC = () => <ExplorarPage />;
