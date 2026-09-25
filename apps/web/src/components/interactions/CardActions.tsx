import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, CalendarPlus, Check, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFollowing } from '../../hooks/useFollowing';
import { useLists } from '../../hooks/useLists';
import {
  actionsForListing,
  saveListingToAgenda,
  saveListingToList,
  saveListingToMap,
  toggleFollowListing,
  type CardActionKind,
} from '../../services/cardActions';
import type { Listing } from '../../types';

interface CardActionsProps {
  listing: Listing;
  /** `overlay` = pílulas escuras sobre a imagem; `inline` = botões em bloco. */
  variant?: 'overlay' | 'inline';
  className?: string;
  onDone?: (message: string) => void;
}

const OVERLAY_BTN =
  'flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition-colors hover:bg-brand-600 disabled:opacity-60';
const INLINE_BTN =
  'inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-500 disabled:opacity-60 sm:px-3 sm:py-2 sm:text-[11px]';

export const CardActions: React.FC<CardActionsProps> = ({
  listing,
  variant = 'overlay',
  className = '',
  onDone,
}) => {
  const { user, openLogin } = useAuth();
  const qc = useQueryClient();
  const { data: following = [] } = useFollowing(user?.id);
  const { data: lists = [] } = useLists(user?.id);
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [done, setDone] = useState<Record<CardActionKind, boolean>>({
    follow: false,
    save_list: false,
    save_agenda: false,
    save_map: false,
  });
  const [busy, setBusy] = useState(false);

  const isFollowing = done.follow || following.includes(listing.id);
  const btnClass = variant === 'overlay' ? OVERLAY_BTN : INLINE_BTN;

  const requireUser = () => {
    if (user) return true;
    openLogin();
    return false;
  };

  const finish = (kind: CardActionKind, message: string) => {
    setDone(prev => ({ ...prev, [kind]: true }));
    onDone?.(message);
  };

  const handleFollow = async () => {
    if (!requireUser() || !user) return;
    setBusy(true);
    try {
      const next = await toggleFollowListing(user.id, listing, isFollowing);
      setDone(prev => ({ ...prev, follow: next }));
      qc.invalidateQueries({ queryKey: ['following', user.id] });
      onDone?.(next ? `Seguindo ${listing.title}.` : `Deixou de seguir ${listing.title}.`);
    } finally {
      setBusy(false);
    }
  };

  const handleAgenda = async () => {
    if (!requireUser() || !user) return;
    setBusy(true);
    try {
      await saveListingToAgenda(user.id, listing);
      qc.invalidateQueries({ queryKey: ['agenda', user.id] });
      finish('save_agenda', `${listing.title} salvo na sua agenda.`);
    } finally {
      setBusy(false);
    }
  };

  const handleMap = async () => {
    if (!requireUser() || !user) return;
    setBusy(true);
    try {
      const ok = await saveListingToMap(user.id, listing);
      if (!ok) {
        onDone?.('Este item ainda não tem localização no mapa.');
        return;
      }
      qc.invalidateQueries({ queryKey: ['mapPins', user.id] });
      finish('save_map', `${listing.title} salvo no seu mapa.`);
    } finally {
      setBusy(false);
    }
  };

  const handlePickList = async (listId: string, listName: string) => {
    if (!requireUser() || !user) return;
    setBusy(true);
    try {
      await saveListingToList(user.id, listing, listId);
      qc.invalidateQueries({ queryKey: ['listItems', listId] });
      setListPickerOpen(false);
      finish('save_list', `${listing.title} salvo em "${listName}".`);
    } finally {
      setBusy(false);
    }
  };

  const renderAction = (kind: CardActionKind) => {
    switch (kind) {
      case 'follow':
        return (
          <button
            key={kind}
            type="button"
            disabled={busy}
            onClick={e => {
              e.stopPropagation();
              handleFollow();
            }}
            className={`${btnClass} ${isFollowing ? 'text-brand-400' : ''}`}
            aria-pressed={isFollowing}
          >
            {isFollowing ? <Check size={14} /> : <UserPlus size={14} />}
            <span>{isFollowing ? 'Seguindo' : 'Seguir'}</span>
          </button>
        );
      case 'save_agenda':
        return (
          <button
            key={kind}
            type="button"
            disabled={busy}
            onClick={e => {
              e.stopPropagation();
              handleAgenda();
            }}
            className={`${btnClass} ${done.save_agenda ? 'text-brand-400' : ''}`}
          >
            {done.save_agenda ? <Check size={14} /> : <CalendarPlus size={14} />}
            <span className="sm:hidden">{done.save_agenda ? 'Agenda' : 'Agenda'}</span>
            <span className="hidden sm:inline">{done.save_agenda ? 'Na agenda' : 'Salvar em Agenda'}</span>
          </button>
        );
      case 'save_map':
        return (
          <button
            key={kind}
            type="button"
            disabled={busy}
            onClick={e => {
              e.stopPropagation();
              handleMap();
            }}
            className={`${btnClass} ${done.save_map ? 'text-brand-400' : ''}`}
          >
            {done.save_map ? <Check size={14} /> : <MapPin size={14} />}
            <span className="sm:hidden">{done.save_map ? 'Mapa' : 'Mapa'}</span>
            <span className="hidden sm:inline">{done.save_map ? 'No mapa' : 'Salvar no mapa'}</span>
          </button>
        );
      case 'save_list':
        return (
          <div key={kind} className="relative">
            <button
              type="button"
              disabled={busy}
              onClick={e => {
                e.stopPropagation();
                if (!requireUser()) return;
                setListPickerOpen(prev => !prev);
              }}
              className={`${btnClass} ${done.save_list ? 'text-brand-400' : ''}`}
              aria-expanded={listPickerOpen}
            >
              {done.save_list ? <Check size={14} /> : <BookmarkPlus size={14} />}
              <span className="sm:hidden">{done.save_list ? 'Salvo' : 'Listas'}</span>
              <span className="hidden sm:inline">{done.save_list ? 'Salvo' : 'Salvar em Listas'}</span>
            </button>
            {listPickerOpen && (
              <div
                className="absolute bottom-full left-0 z-30 mb-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/70"
                onClick={e => e.stopPropagation()}
              >
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Escolha a lista
                </p>
                {lists.length ? (
                  lists.map(list => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handlePickList(list.id, list.name)}
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                    >
                      {list.name}
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-2 text-xs text-zinc-500">Carregando listas...</p>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} onClick={e => e.stopPropagation()}>
      {actionsForListing(listing).map(renderAction)}
    </div>
  );
};
