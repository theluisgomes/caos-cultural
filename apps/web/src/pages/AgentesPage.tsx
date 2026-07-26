import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';

export const AgentesPage: React.FC = () => (
  <FeedPage journey="agents" title="Agentes Culturais" subtitle="Encontre artistas, curadores e produtores com intenção." showCategoryBar={false} />
);
