import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, Check, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AgendaItem } from '../../domain/agenda';
import { addAgendaItem } from '../../services/agenda';
import { recordInteraction } from '../../services/interactions';
import {
  downloadIcs,
  googleCalendarUrl,
  type CalendarEventInput,
} from '../../lib/calendarLinks';

export function agendaItemToCalendarEvent(item: AgendaItem): CalendarEventInput {
  return {
    id: item.id,
    title: item.customTitle || 'Evento CAOS',
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    location: item.customLocation,
    description: item.notes || null,
    url: item.eventId
      ? `${typeof window === 'undefined' ? '' : window.location.origin}/evento/${item.eventId}`
      : null,
  };
}

interface AgendaItemActionsProps {
  item: AgendaItem;
  /** Exibe "Salvar na minha agenda" — usado na agenda pública de outra pessoa (estudo p. 14). */
  allowSaveToMine?: boolean;
  className?: string;
}

const BTN =
  'inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-500';

export const AgendaItemActions: React.FC<AgendaItemActionsProps> = ({
  item,
  allowSaveToMine = false,
  className = '',
}) => {
  const { user, openLogin } = useAuth();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const calendarEvent = agendaItemToCalendarEvent(item);
  const gcalUrl = googleCalendarUrl(calendarEvent);

  const saveToMine = async () => {
    if (!user) {
      openLogin();
      return;
    }
    const now = new Date().toISOString();
    await addAgendaItem(user.id, {
      agendaId: `personal_${user.id}`,
      addedByUserId: user.id,
      eventId: item.eventId,
      customTitle: item.customTitle,
      customLocation: item.customLocation,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      status: 'interested',
      notes: '',
      reminderMinutesBefore: null,
      createdAt: now,
      updatedAt: now,
    });
    if (item.eventId) await recordInteraction(user.id, 'save', 'event', item.eventId);
    qc.invalidateQueries({ queryKey: ['agenda', user.id] });
    setSaved(true);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {gcalUrl && (
        <a href={gcalUrl} target="_blank" rel="noreferrer" className={BTN}>
          <ExternalLink size={13} />
          Adicionar ao Google Calendar
        </a>
      )}
      <button
        type="button"
        onClick={() => downloadIcs([calendarEvent], `${item.id}.ics`)}
        className={BTN}
      >
        <Download size={13} />
        .ics
      </button>
      {allowSaveToMine && (
        <button
          type="button"
          onClick={saveToMine}
          disabled={saved}
          className={`${BTN} ${saved ? 'border-brand-500 text-brand-500' : ''}`}
        >
          {saved ? <Check size={13} /> : <CalendarPlus size={13} />}
          {saved ? 'Na sua agenda' : 'Salvar na agenda'}
        </button>
      )}
    </div>
  );
};
