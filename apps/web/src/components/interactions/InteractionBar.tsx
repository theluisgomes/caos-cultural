import React, { useState } from 'react';
import { Heart, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recordInteraction, toggleSave } from '../../services/interactions';
import { addAgendaItem } from '../../services/agenda';
import type { InteractionTargetType } from '../../domain/interaction';

interface InteractionBarProps {
  targetType: InteractionTargetType;
  targetId: string;
  targetTitle?: string;
  targetStartsAt?: string;
  targetLocation?: string;
  className?: string;
}

export const InteractionBar: React.FC<InteractionBarProps> = ({
  targetType,
  targetId,
  targetTitle,
  targetStartsAt,
  targetLocation,
  className = '',
}) => {
  const { user, openLogin } = useAuth();
  const [saved, setSaved] = useState(false);

  const act = async (kind: 'like' | 'ignore' | 'save') => {
    if (!user) {
      openLogin();
      return;
    }
    if (kind === 'save') {
      const next = await toggleSave(user.id, targetType, targetId, saved);
      setSaved(next);
      if (next && targetType === 'event') {
        const now = new Date().toISOString();
        await addAgendaItem(user.id, {
          agendaId: `personal_${user.id}`,
          addedByUserId: user.id,
          eventId: targetId,
          customTitle: targetTitle ?? null,
          customLocation: targetLocation ?? null,
          startsAt: targetStartsAt ?? now,
          endsAt: null,
          status: 'interested',
          notes: '',
          reminderMinutesBefore: null,
          createdAt: now,
          updatedAt: now,
        });
      }
      return;
    }
    await recordInteraction(user.id, kind, targetType, targetId);
  };

  return (
    <div className={`flex gap-2 ${className}`} onClick={e => e.stopPropagation()}>
      <button type="button" onClick={() => act('like')} className="p-2 rounded-full bg-black/50 text-white hover:bg-brand-600" aria-label="Curtir">
        <ThumbsUp size={16} />
      </button>
      <button type="button" onClick={() => act('save')} className={`p-2 rounded-full bg-black/50 hover:bg-brand-600 ${saved ? 'text-brand-500' : 'text-white'}`} aria-label="Salvar">
        <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button type="button" onClick={() => act('ignore')} className="p-2 rounded-full bg-black/50 text-white hover:bg-zinc-700" aria-label="Ignorar">
        <ThumbsDown size={16} />
      </button>
    </div>
  );
};
