import React from 'react';
import { Award, Flame, MapPin } from 'lucide-react';

interface ReputationBadgesProps {
  eventsAttended?: number;
  className?: string;
}

export const ReputationBadges: React.FC<ReputationBadgesProps> = ({ eventsAttended = 0, className = '' }) => {
  const score = Math.min(100, eventsAttended * 3 + 12);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold">
        <Flame size={12} /> Movimentação {score}
      </span>
      {eventsAttended >= 5 && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs">
          <MapPin size={12} /> 5+ eventos
        </span>
      )}
      {eventsAttended >= 10 && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs">
          <Award size={12} /> Embaixador local
        </span>
      )}
    </div>
  );
};
