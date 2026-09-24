import React from 'react';

interface SponsoredBadgeProps {
  className?: string;
}

export const SponsoredBadge: React.FC<SponsoredBadgeProps> = ({
  className = 'absolute top-3 right-3',
}) => (
  <span
    className={`${className} bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded`}
  >
    Patrocinado
  </span>
);
