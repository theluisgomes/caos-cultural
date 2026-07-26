import React from 'react';
import { SearchFilters } from '../../domain/feed';
import type { JourneyKind } from '../../services/mappers';

interface SearchFilterPanelProps {
  journey: JourneyKind;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ journey, filters, onChange }) => {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div>
        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Busca</label>
        <input
          value={filters.query}
          onChange={e => set({ query: e.target.value })}
          placeholder="Ex: pintoras pretas Zona Norte"
          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Cidade</label>
        <input
          value={filters.city ?? ''}
          onChange={e => set({ city: e.target.value || null })}
          placeholder="São Paulo"
          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Raio (km)</label>
        <input
          type="number"
          value={filters.radiusKm ?? ''}
          onChange={e => set({ radiusKm: e.target.value ? Number(e.target.value) : null })}
          placeholder="5"
          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
        />
      </div>
      {journey === 'agents' && (
        <>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Disciplina</label>
            <input
              value={filters.disciplines[0] ?? ''}
              onChange={e => set({ disciplines: e.target.value ? [e.target.value] : [] })}
              placeholder="Pintura"
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Faixa etária</label>
            <select
              value={filters.ageRanges[0] ?? ''}
              onChange={e => set({ ageRanges: e.target.value ? [e.target.value] : [] })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
            >
              <option value="">Qualquer</option>
              <option value="18_24">18–24</option>
              <option value="25_34">25–34</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};
