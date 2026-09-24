import React, { useEffect, useRef } from 'react';
import { Bookmark, Eye, Heart, Share2 } from 'lucide-react';
import type { InteractionTargetType } from '../../domain/interaction';
import { useTargetMetrics } from '../../hooks/useTargetMetrics';
import { useAuth } from '../../context/AuthContext';
import { recordInteraction } from '../../services/interactions';

/**
 * Métricas por projeto/obra (estudo: visualizações, curtidas, compartilhamentos),
 * agregadas de `interactions`. Registra a visualização uma vez por montagem.
 */

interface ProjectMetricsProps {
  targetType: InteractionTargetType;
  targetId: string;
  className?: string;
  /** Registra `visit` ao abrir — deixe falso em listas. */
  trackView?: boolean;
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({
  targetType,
  targetId,
  className = '',
  trackView = true,
}) => {
  const { user } = useAuth();
  const { data: metrics } = useTargetMetrics(targetType, targetId);
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!trackView || !user || tracked.current === targetId) return;
    tracked.current = targetId;
    recordInteraction(user.id, 'visit', targetType, targetId).catch(() => {
      /* métrica é best-effort */
    });
  }, [trackView, user, targetType, targetId]);

  const cells = [
    { label: 'Visualizações', value: metrics?.views ?? 0, icon: Eye },
    { label: 'Curtidas', value: metrics?.likes ?? 0, icon: Heart },
    { label: 'Salvamentos', value: metrics?.saves ?? 0, icon: Bookmark },
    { label: 'Compartilhamentos', value: metrics?.shares ?? 0, icon: Share2 },
  ];

  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}>
      {cells.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <Icon size={16} className="text-brand-500" />
          <div className="mt-2 text-2xl font-black leading-none text-white">{value}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</div>
        </div>
      ))}
    </div>
  );
};
