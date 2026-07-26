import React, { useState } from 'react';
import { RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { boostTag, resetFeed, suppressTag } from '../../services/algorithm';
import { useQueryClient } from '@tanstack/react-query';

interface FeedControlsProps {
  className?: string;
  sampleTag?: string;
}

export const FeedControls: React.FC<FeedControlsProps> = ({
  className = '',
  sampleTag = 'Visual Arts',
}) => {
  const { user, openLogin } = useAuth();
  const qc = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const act = (fn: () => void, msg: string) => {
    if (!user) {
      openLogin();
      return;
    }
    fn();
    qc.invalidateQueries({ queryKey: ['listings'] });
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => act(() => boostTag(user!.id, sampleTag), 'Mais conteúdo deste tipo')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-zinc-300 hover:border-brand-500"
        >
          <ThumbsUp size={12} /> Ver mais deste tipo
        </button>
        <button
          type="button"
          onClick={() => act(() => suppressTag(user!.id, sampleTag), 'Menos deste tipo no feed')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-zinc-300 hover:border-brand-500"
        >
          <ThumbsDown size={12} /> Menos disso
        </button>
        <button
          type="button"
          onClick={() => act(() => resetFeed(user!.id), 'Feed resetado')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-zinc-300 hover:border-brand-500"
        >
          <RefreshCw size={12} /> Resetar feed
        </button>
      </div>
      {message && <p className="text-xs text-brand-500 mt-2">{message}</p>}
    </div>
  );
};
