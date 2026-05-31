import React from 'react';
import { FeedPage } from '../components/feed/FeedPage';

export const ObrasPage: React.FC = () => (
  <FeedPage journey="works" title="Obras" subtitle="Arte para explorar, salvar e adquirir." showCategoryBar={false} />
);
