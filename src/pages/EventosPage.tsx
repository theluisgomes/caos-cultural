import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';

export const EventosPage: React.FC = () => (
  <FeedPage journey="events" title="Eventos" subtitle="Descobrir ou buscar shows, exposições, peças e festivais." showCategoryBar />
);
