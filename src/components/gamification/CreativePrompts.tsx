import React from 'react';
import { Sparkles } from 'lucide-react';

const CHALLENGES = [
  { id: 'c1', title: 'Pinte com o tema "cidade noturna"', sponsor: 'CAOS' },
  { id: 'c2', title: 'Visite 3 galerias em Pinheiros', sponsor: 'Galeria Vermelho' },
];

export const CreativePrompts: React.FC = () => (
  <section className="mt-12 border-t border-zinc-800 pt-8">
    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
      <Sparkles size={14} /> Desafios criativos
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {CHALLENGES.map(c => (
        <div key={c.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <p className="text-white font-medium text-sm">{c.title}</p>
          <p className="text-zinc-500 text-xs mt-1">Patrocínio: {c.sponsor}</p>
        </div>
      ))}
    </div>
  </section>
);
