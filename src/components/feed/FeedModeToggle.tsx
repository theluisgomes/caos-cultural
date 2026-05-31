import React from 'react';
import { Search, Sparkles } from 'lucide-react';

export type FeedMode = 'discover' | 'search';

interface FeedModeToggleProps {
  mode: FeedMode;
  onChange: (mode: FeedMode) => void;
}

export const FeedModeToggle: React.FC<FeedModeToggleProps> = ({ mode, onChange }) => (
  <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-full w-fit">
    <button
      type="button"
      onClick={() => onChange('discover')}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
        mode === 'discover' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
      }`}
    >
      <Sparkles size={14} />
      Descobrir
    </button>
    <button
      type="button"
      onClick={() => onChange('search')}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
        mode === 'search' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
      }`}
    >
      <Search size={14} />
      Buscar
    </button>
  </div>
);
