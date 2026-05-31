import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';

export const EspacosPage: React.FC = () => (
  <FeedPage journey="spaces" title="Espaços Culturais" subtitle="Galerias, bares, museus e estúdios da cidade." showCategoryBar={false} />
);
