import React from 'react';
import { Music, Palette, Camera, Video, Mic, Brush, Theater, Landmark, GlassWater } from 'lucide-react';

interface CategoryBarProps {
  selected: string;
  onSelect: (id: string) => void;
}

const categories = [
  { id: 'all', label: 'Todos', icon: null },
  { id: 'music', label: 'Música', icon: Music },
  { id: 'visual', label: 'Artes Visuais', icon: Palette },
  { id: 'photo', label: 'Fotografia', icon: Camera },
  { id: 'theater', label: 'Teatro', icon: Theater },
  { id: 'cinema', label: 'Cinema', icon: Video },
  { id: 'workshops', label: 'Oficinas', icon: Brush },
  { id: 'talks', label: 'Palestras', icon: Mic },
  { id: 'spaces', label: 'Espaços', icon: Landmark },
  { id: 'social', label: 'Social', icon: GlassWater },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full bg-zinc-950 sticky top-0 z-40 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar py-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selected === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group transition-all ${
                  isSelected ? 'text-white opacity-100' : 'text-zinc-500 hover:text-zinc-300 opacity-60 hover:opacity-100'
                }`}
              >
                {Icon ? (
                  <Icon 
                    size={26} 
                    strokeWidth={isSelected ? 2 : 1.5} 
                    className={isSelected ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}
                  />
                ) : (
                  <div className={`h-6 w-6 flex items-center justify-center font-bold text-xl ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`}>∞</div>
                )}
                <span className={`text-[11px] uppercase tracking-widest whitespace-nowrap ${isSelected ? 'font-bold' : 'font-medium'}`}>
                  {cat.label}
                </span>
                {/* Active Indicator */}
                <div className={`h-0.5 w-full bg-white rounded-full transition-all duration-300 ${isSelected ? 'opacity-100 max-w-[20px]' : 'opacity-0 max-w-0'}`}></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};