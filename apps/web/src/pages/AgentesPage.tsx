import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';

export const AgentesPage: React.FC = () => (
  <FeedPage journey="agents" title="Usuários" subtitle="Encontre artistas, curadores e produtores com intenção." showCategoryBar={false} />
);
