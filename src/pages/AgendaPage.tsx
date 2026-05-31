import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Flame, Plus, Snowflake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAgenda } from '../hooks/useAgenda';
import type { AgendaItem } from '../domain/agenda';

type DatedAgendaItem = AgendaItem & { parsedStart: Date };

const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);
  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function heatClass(count: number, max: number) {
  if (count === 0 || max === 0) return 'border-zinc-800 bg-zinc-900 text-zinc-600';
  const ratio = count / max;
  if (ratio >= 0.75) return 'border-brand-400 bg-brand-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.32)]';
  if (ratio >= 0.5) return 'border-orange-500/70 bg-orange-500/70 text-white';
  if (ratio >= 0.25) return 'border-amber-500/50 bg-amber-500/40 text-amber-50';
  return 'border-sky-500/30 bg-sky-500/15 text-sky-100';
}

function getDatedItems(items: AgendaItem[]): DatedAgendaItem[] {
  return items
    .map(item => ({ ...item, parsedStart: new Date(item.startsAt) }))
    .filter(item => !Number.isNaN(item.parsedStart.getTime()))
    .sort((a, b) => a.parsedStart.getTime() - b.parsedStart.getTime());
}

interface AgendaHeatmapProps {
  items: AgendaItem[];
}

const AgendaHeatmap: React.FC<AgendaHeatmapProps> = ({ items }) => {
  const datedItems = useMemo(() => getDatedItems(items), [items]);
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthKey(new Date()));

  const dayCounts = useMemo(() => {
    return datedItems.reduce<Record<string, number>>((acc, item) => {
      const key = toDateKey(item.parsedStart);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [datedItems]);

  const monthBuckets = useMemo(() => {
    if (!datedItems.length) return [{ key: toMonthKey(new Date()), label: monthFormatter.format(new Date()), count: 0 }];

    const first = new Date(datedItems[0].parsedStart.getFullYear(), datedItems[0].parsedStart.getMonth(), 1);
    const lastItem = datedItems[datedItems.length - 1];
    const last = new Date(lastItem.parsedStart.getFullYear(), lastItem.parsedStart.getMonth(), 1);
    const counts = datedItems.reduce<Record<string, number>>((acc, item) => {
      const key = toMonthKey(item.parsedStart);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const buckets: Array<{ key: string; label: string; count: number }> = [];
    for (let cursor = first; cursor <= last; cursor = addMonths(cursor, 1)) {
      const key = toMonthKey(cursor);
      buckets.push({ key, label: monthFormatter.format(cursor), count: counts[key] || 0 });
    }
    return buckets;
  }, [datedItems]);

  useEffect(() => {
    if (monthBuckets.length && !monthBuckets.some(month => month.key === selectedMonth)) {
      setSelectedMonth(monthBuckets[0].key);
    }
  }, [monthBuckets, selectedMonth]);

  const selectedMonthDate = parseMonthKey(selectedMonth);
  const selectedMonthLabel = monthFormatter.format(selectedMonthDate);
  const maxMonthCount = Math.max(...monthBuckets.map(month => month.count), 0);

  const monthDays = useMemo(() => {
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
    const days: Array<Date | null> = Array.from({ length: leadingEmptyDays }, () => null);

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [selectedMonthDate]);

  const maxDayCount = Math.max(...monthDays.map(day => (day ? dayCounts[toDateKey(day)] || 0 : 0)), 0);

  const weekBuckets = useMemo(() => {
    const firstDay = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1);
    const lastDay = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0);
    const buckets: Array<{ key: string; label: string; count: number }> = [];

    for (let cursor = startOfWeek(firstDay); cursor <= lastDay; cursor = addDays(cursor, 7)) {
      const end = addDays(cursor, 6);
      let count = 0;
      for (let day = new Date(cursor); day <= end; day = addDays(day, 1)) {
        if (day.getMonth() === selectedMonthDate.getMonth()) {
          count += dayCounts[toDateKey(day)] || 0;
        }
      }
      buckets.push({
        key: toDateKey(cursor),
        label: `${dayFormatter.format(cursor)} - ${dayFormatter.format(end)}`,
        count,
      });
    }

    return buckets;
  }, [dayCounts, selectedMonthDate]);

  const maxWeekCount = Math.max(...weekBuckets.map(week => week.count), 0);
  const hottestMonth = monthBuckets.reduce((best, month) => (month.count > best.count ? month : best), monthBuckets[0]);
  const coldestWeek = weekBuckets.reduce((best, week) => (week.count < best.count ? week : best), weekBuckets[0]);

  return (
    <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-500">Heatmap</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Movimento da agenda</h2>
          <p className="mt-2 text-sm text-zinc-500">Meses, semanas e dias mais quentes a partir dos eventos salvos.</p>
        </div>
        <Flame className="mt-1 shrink-0 text-brand-500" size={24} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <Flame size={13} className="text-brand-500" /> Mês quente
          </div>
          <p className="mt-2 text-sm font-bold text-white">{hottestMonth?.label ?? 'Sem dados'}</p>
          <p className="text-xs text-zinc-500">{hottestMonth?.count ?? 0} evento(s)</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <Snowflake size={13} className="text-sky-300" /> Semana fria
          </div>
          <p className="mt-2 text-sm font-bold text-white">{coldestWeek?.label ?? 'Sem dados'}</p>
          <p className="text-xs text-zinc-500">{coldestWeek?.count ?? 0} evento(s)</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Meses</h3>
        <div className="grid grid-cols-2 gap-2">
          {monthBuckets.map(month => (
            <button
              key={month.key}
              type="button"
              onClick={() => setSelectedMonth(month.key)}
              className={`rounded-xl border px-3 py-2 text-left transition-all ${heatClass(month.count, maxMonthCount)} ${
                selectedMonth === month.key ? 'ring-2 ring-white/70' : 'hover:border-zinc-500'
              }`}
            >
              <span className="block text-xs font-bold capitalize">{month.label}</span>
              <span className="text-[11px] opacity-80">{month.count} evento(s)</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Semanas</h3>
          <span className="text-xs font-bold capitalize text-zinc-400">{selectedMonthLabel}</span>
        </div>
        <div className="space-y-2">
          {weekBuckets.map(week => (
            <div key={week.key} className="grid grid-cols-[112px_1fr_24px] items-center gap-2 text-xs">
              <span className="truncate text-zinc-500">{week.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${week.count ? 'bg-brand-500' : 'bg-zinc-700'}`}
                  style={{ width: `${maxWeekCount ? Math.max(10, (week.count / maxWeekCount) * 100) : 0}%` }}
                />
              </div>
              <span className="text-right font-bold text-zinc-400">{week.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Dias</h3>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dayLabels.map(day => (
            <div key={day} className="text-[10px] font-black uppercase text-zinc-600">
              {day}
            </div>
          ))}
          {monthDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
            const count = dayCounts[toDateKey(day)] || 0;
            return (
              <div
                key={toDateKey(day)}
                title={`${day.toLocaleDateString('pt-BR')}: ${count} evento(s)`}
                className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-bold ${heatClass(count, maxDayCount)}`}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Frio</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <span key={level} className={`h-3 w-6 rounded-sm border ${heatClass(level, 4)}`} />
            ))}
          </div>
          <span>Quente</span>
        </div>
      </div>
    </aside>
  );
};

export const AgendaPage: React.FC = () => {
  const { user } = useAuth();
  const { data: items = [], isLoading } = useAgenda(user?.id);

  if (!user) return <Navigate to="/" replace />;

  const groupedDays = getDatedItems(items).reduce<Array<{ key: string; label: string; items: DatedAgendaItem[] }>>((acc, item) => {
    const key = toDateKey(item.parsedStart);
    const existing = acc.find(day => day.key === key);
    if (existing) {
      existing.items.push(item);
      return acc;
    }
    acc.push({ key, label: item.parsedStart.toLocaleDateString('pt-BR'), items: [item] });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pt-28 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tighter text-white">
            <Calendar className="text-brand-500" /> Agenda Cultural
          </h1>
          <button type="button" className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white">
            <Plus size={16} /> Compartilhar
          </button>
        </div>
        <p className="mb-8 text-zinc-500">Organize roles, convide amigos e publique sua agenda cultural.</p>
        {isLoading ? (
          <p className="text-zinc-600">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-lg border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
              Salve eventos nos cards para montar sua agenda.
            </div>
            <AgendaHeatmap items={items} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <section className="space-y-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-500">Eventos salvos</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{items.length} item(ns) na sua agenda</h2>
              </div>
              {groupedDays.map(day => (
                <div key={day.key}>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-600">{day.label}</h3>
                  <div className="space-y-4">
                    {day.items.map(item => (
                      <div key={item.id} className="rounded-sm border-l-4 border-brand-500 bg-zinc-900 p-4">
                        <div className="text-xs font-bold uppercase text-brand-500">{item.status}</div>
                        <h4 className="text-lg font-bold text-white">{item.customTitle || 'Evento'}</h4>
                        <p className="text-sm text-zinc-400">{dateTimeFormatter.format(item.parsedStart)}</p>
                        {item.customLocation && <p className="text-sm text-zinc-500">{item.customLocation}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
            <div className="lg:sticky lg:top-28">
              <AgendaHeatmap items={items} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
