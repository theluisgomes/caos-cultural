import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import type { EndorsementTargetType } from '../../domain/endorsement';
import { resolveEndorsements } from '../../services/endorsements';
import { useListings } from '../../hooks/useListings';
import type { Listing } from '../../types';

/**
 * Chancela institucional (estudo p. 13/15): selo concedido por uma
 * instituição verificada a um perfil ou obra.
 */

interface EndorsementBadgesProps {
  target: Listing;
  targetType: EndorsementTargetType;
  className?: string;
}

export const EndorsementBadges: React.FC<EndorsementBadgesProps> = ({
  target,
  targetType,
  className = '',
}) => {
  const { data: listings = [] } = useListings('all', 'all');
  const { data: endorsements = [] } = useQuery({
    queryKey: ['endorsements', targetType, target.id, listings.length],
    queryFn: () => resolveEndorsements(listings, target, targetType),
    enabled: listings.length > 0,
    staleTime: 60_000,
  });

  if (!endorsements.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {endorsements.map(endorsement => (
        <span
          key={endorsement.id}
          title={endorsement.note}
          className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300"
        >
          <ShieldCheck size={14} />
          {endorsement.issuerName}
          <span className="font-normal text-emerald-400/70">· {endorsement.label}</span>
        </span>
      ))}
    </div>
  );
};
