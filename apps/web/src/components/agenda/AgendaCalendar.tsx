import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgendaItem } from '../../domain/agenda';

/**
 * Calendário navegável real (plano, fase 3.1/3.2): grade de mês, semana e dia,
 * com dias marcados e lista do dia selecionado.
 */

export type CalendarView = 'day' | 'week' | 'month';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const longDayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const weekday = start.getDay();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return start;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  return next;
}

interface AgendaCalendarProps {
  items: AgendaItem[];
  /** Renderiza cada item do dia selecionado (botões de ação ficam por conta da página). */
  renderItem: (item: AgendaItem) => React.ReactNode;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ items, renderItem }) => {
  const [view, setView] = useState<CalendarView>('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));

  const itemsByDay = useMemo(() => {
    return items.reduce<Record<string, AgendaItem[]>>((acc, item) => {
      const date = new Date(item.startsAt);
      if (Number.isNaN(date.getTime())) return acc;
      const key = toDateKey(date);
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [items]);

  const monthCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leading = (firstDay.getDay() + 6) % 7;
    const cells: Array<Date | null> = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= lastDay.getDate(); day += 1) cells.push(new Date(year, month, day));
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const step = (direction: 1 | -1) => {
    if (view === 'month') setCursor(prev => addMonths(prev, direction));
    else if (view === 'week') setCursor(prev => addDays(prev, direction * 7));
    else {
      setCursor(prev => {
        const next = addDays(prev, direction);
        setSelectedKey(toDateKey(next));
        return next;
      });
    }
  };

  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedKey]);

  const selectedItems = (itemsByDay[selectedKey] ?? []).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  const rangeLabel =
    view === 'month'
      ? monthFormatter.format(cursor)
      : view === 'week'
        ? `${weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
        : longDayFormatter.format(cursor);

  const dayCell = (date: Date | null, index: number) => {
    if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
    const key = toDateKey(date);
    const count = itemsByDay[key]?.length ?? 0;
    const isSelected = key === selectedKey;
    const isToday = key === toDateKey(new Date());

    return (
      <button
        key={key}
        type="button"
        onClick={() => setSelectedKey(key)}
        className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-bold transition-all ${
          isSelected
            ? 'border-brand-400 bg-brand-600 text-white shadow-[0_0_18px_rgba(225,29,72,0.35)]'
            : count
              ? 'border-brand-500/40 bg-brand-500/10 text-white hover:border-brand-500'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-500 hover:border-zinc-600'
        } ${isToday && !isSelected ? 'ring-1 ring-zinc-500' : ''}`}
        aria-pressed={isSelected}
        aria-label={`${date.toLocaleDateString('pt-BR')} — ${count} evento(s)`}
      >
        {date.getDate()}
        {count > 0 && (
          <span
            className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`}
          />
        )}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            className="rounded-full border border-zinc-800 p-2 text-zinc-400 hover:border-brand-500 hover:text-brand-500"
            aria-label="Período anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="min-w-40 text-center text-lg font-black capitalize text-white">{rangeLabel}</h2>
          <button
            type="button"
            onClick={() => step(1)}
            className="rounded-full border border-zinc-800 p-2 text-zinc-400 hover:border-brand-500 hover:text-brand-500"
            aria-label="Próximo período"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1">
          {([
            ['day', 'Dia'],
            ['week', 'Semana'],
            ['month', 'Mês'],
          ] as Array<[CalendarView, string]>).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                view === id ? 'bg-brand-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view !== 'day' && (
        <div className="mt-5">
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {view === 'month'
              ? monthCells.map(dayCell)
              : weekDays.map((date, index) => dayCell(date, index))}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-zinc-800 pt-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
          <CalendarDays size={14} className="text-brand-500" />
          {longDayFormatter.format(selectedDate)}
        </div>
        {selectedItems.length ? (
          <div className="space-y-3">
            {selectedItems.map(item => (
              <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-500">
                  {timeFormatter.format(new Date(item.startsAt))}
                </p>
                {renderItem(item)}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            Nenhum evento neste dia. Salve eventos pelo CAOS para preencher sua agenda.
          </p>
        )}
      </div>
    </div>
  );
};
