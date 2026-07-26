import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Heart,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';

type SwipeUser = {
  id: string;
  name: string;
  handle: string;
  role: 'Artista' | 'Organizador' | 'Visitante' | 'Espaço';
  city: string;
  distanceKm: number;
  imageUrl: string;
  matchScore: number;
  verified: boolean;
  availability: 'Hoje' | 'Esta semana' | 'Fim de semana' | 'Agenda aberta';
  vibe: string;
  disciplines: string[];
  interests: string[];
  lookingFor: string;
};

type FilterState = {
  role: string;
  discipline: string;
  distance: number;
  availability: string;
  verifiedOnly: boolean;
};

const swipeUsers: SwipeUser[] = [
  {
    id: 'u1',
    name: 'Lua Voss',
    handle: '@luavoss',
    role: 'Artista',
    city: 'Pinheiros',
    distanceKm: 3,
    imageUrl: 'https://picsum.photos/seed/lua-voss-swipe/900/1200',
    matchScore: 96,
    verified: true,
    availability: 'Hoje',
    vibe: 'Arte digital, instalações imersivas e club culture.',
    disciplines: ['Artes visuais', 'Mapping', 'Performance'],
    interests: ['Exposição', 'Colab', 'Residência'],
    lookingFor: 'Quer encontrar espaços para uma instalação audiovisual.',
  },
  {
    id: 'u2',
    name: 'Coletivo NOITE',
    handle: '@coletivonoite',
    role: 'Organizador',
    city: 'Barra Funda',
    distanceKm: 7,
    imageUrl: 'https://picsum.photos/seed/coletivo-noite-swipe/900/1200',
    matchScore: 91,
    verified: true,
    availability: 'Fim de semana',
    vibe: 'Festas independentes, performances e curadoria noturna.',
    disciplines: ['Música', 'Performance', 'Produção'],
    interests: ['DJs', 'Espaços', 'Patrocínio'],
    lookingFor: 'Busca artistas para ocupar uma noite experimental.',
  },
  {
    id: 'u3',
    name: 'Bunker Studio',
    handle: '@bunkerstudio',
    role: 'Espaço',
    city: 'Vila Madalena',
    distanceKm: 5,
    imageUrl: 'https://picsum.photos/seed/bunker-studio-swipe/900/1200',
    matchScore: 88,
    verified: false,
    availability: 'Esta semana',
    vibe: 'Sala crua, acústica seca e visual subterrâneo.',
    disciplines: ['Locação', 'Música', 'Cinema'],
    interests: ['Ensaios', 'Gravação', 'Evento privado'],
    lookingFor: 'Disponível para ensaios, sets filmados e pequenos eventos.',
  },
  {
    id: 'u4',
    name: 'Maya Cortez',
    handle: '@mayacortez',
    role: 'Artista',
    city: 'Centro',
    distanceKm: 2,
    imageUrl: 'https://picsum.photos/seed/maya-cortez-swipe/900/1200',
    matchScore: 84,
    verified: true,
    availability: 'Agenda aberta',
    vibe: 'Fotografia urbana, retratos e documentação de cena.',
    disciplines: ['Fotografia', 'Direção criativa', 'Editorial'],
    interests: ['Portfólio', 'Shows', 'Backstage'],
    lookingFor: 'Procura artistas e eventos para registrar nos próximos meses.',
  },
];

const initialFilters: FilterState = {
  role: 'Todos',
  discipline: 'Todas',
  distance: 10,
  availability: 'Qualquer',
  verifiedOnly: false,
};

const roles = ['Todos', 'Artista', 'Organizador', 'Visitante', 'Espaço'];
const disciplines = ['Todas', 'Música', 'Artes visuais', 'Fotografia', 'Performance', 'Mapping', 'Locação'];
const availabilityOptions = ['Qualquer', 'Hoje', 'Esta semana', 'Fim de semana', 'Agenda aberta'];

export const SearchSwipePage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return swipeUsers.filter(user => {
      const roleMatches = filters.role === 'Todos' || user.role === filters.role;
      const disciplineMatches =
        filters.discipline === 'Todas' || user.disciplines.includes(filters.discipline);
      const distanceMatches = user.distanceKm <= filters.distance;
      const availabilityMatches =
        filters.availability === 'Qualquer' || user.availability === filters.availability;
      const verifiedMatches = !filters.verifiedOnly || user.verified;
      return roleMatches && disciplineMatches && distanceMatches && availabilityMatches && verifiedMatches;
    });
  }, [filters]);

  const activeUser = filteredUsers[currentIndex % Math.max(filteredUsers.length, 1)];

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentIndex(0);
    setLastAction(null);
  };

  const moveNext = (action: 'pass' | 'like' | 'super') => {
    if (!activeUser) return;
    if (action === 'pass') {
      setPassedIds(prev => [...prev, activeUser.id]);
      setLastAction(`Você passou ${activeUser.name}.`);
    } else {
      setLikedIds(prev => [...prev, activeUser.id]);
      setLastAction(action === 'super' ? `Super match enviado para ${activeUser.name}.` : `Você curtiu ${activeUser.name}.`);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setLikedIds([]);
    setPassedIds([]);
    setLastAction('Deck reiniciado.');
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-44 md:pt-36 text-zinc-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
              <Sparkles size={14} />
              Swipe search
            </div>
            <h1 className="max-w-4xl text-3xl sm:text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
              Descubra pessoas por química cultural.
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base font-light leading-relaxed text-zinc-400">
              Filtre características, veja um card por vez e avance como um feed de matches.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
            <button
              type="button"
              onClick={() => setFiltersOpen(prev => !prev)}
              className="lg:hidden w-full flex items-center justify-between mb-1"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="text-brand-500" size={20} />
                <h2 className="text-lg font-black text-white">Filtros rápidos</h2>
              </div>
              <span className="text-zinc-500 text-xl leading-none">{filtersOpen ? '−' : '+'}</span>
            </button>
            <div className="hidden lg:flex items-center gap-3 mb-4">
              <SlidersHorizontal className="text-brand-500" size={20} />
              <h2 className="text-lg font-black text-white">Filtros rápidos</h2>
            </div>

            <div className={`space-y-4 ${filtersOpen ? 'mt-4' : 'hidden lg:block'}`}>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tipo de usuário</span>
                <select
                  value={filters.role}
                  onChange={e => updateFilter('role', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                >
                  {roles.map(role => <option key={role}>{role}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Característica</span>
                <select
                  value={filters.discipline}
                  onChange={e => updateFilter('discipline', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                >
                  {disciplines.map(discipline => <option key={discipline}>{discipline}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <span>Distância</span>
                  <span>{filters.distance} km</span>
                </span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={filters.distance}
                  onChange={e => updateFilter('distance', Number(e.target.value))}
                  className="mt-3 w-full accent-brand-500"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Disponibilidade</span>
                <select
                  value={filters.availability}
                  onChange={e => updateFilter('availability', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                >
                  {availabilityOptions.map(option => <option key={option}>{option}</option>)}
                </select>
              </label>

              <button
                onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                  filters.verifiedOnly
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300'
                }`}
              >
                Apenas verificados
                <BadgeCheck size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr_320px]">
          <aside className="order-2 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 lg:order-1">
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-zinc-500">Seu radar</h3>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-zinc-950 p-4">
                <div className="text-2xl font-black text-white">{filteredUsers.length}</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">perfis no deck</div>
              </div>
              <div className="rounded-2xl bg-zinc-950 p-4">
                <div className="text-2xl font-black text-brand-500">{likedIds.length}</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">curtidos</div>
              </div>
              <div className="rounded-2xl bg-zinc-950 p-4">
                <div className="text-2xl font-black text-zinc-300">{passedIds.length}</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">passados</div>
              </div>
            </div>
            {lastAction && <p className="mt-4 rounded-2xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">{lastAction}</p>}
          </aside>

          <section className="order-1 flex flex-col items-center lg:order-2">
            {activeUser ? (
              <div className="relative w-full max-w-xl px-1">
                <div className="absolute left-0 top-10 h-[78%] w-full rotate-[-4deg] rounded-[2rem] border border-zinc-800 bg-zinc-900/70" />
                <div className="absolute right-0 top-10 h-[78%] w-full rotate-[4deg] rounded-[2rem] border border-zinc-800 bg-zinc-900/70" />

                <article
                  className="relative overflow-hidden rounded-[2rem] border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
                  onTouchStart={e => { (e.currentTarget as HTMLElement).dataset.tx = String(e.touches[0].clientX); }}
                  onTouchEnd={e => {
                    const startX = Number((e.currentTarget as HTMLElement).dataset.tx);
                    const dx = e.changedTouches[0].clientX - startX;
                    if (dx < -60) moveNext('pass');
                    else if (dx > 60) moveNext('like');
                  }}
                >
                  <div className="relative aspect-[4/5]">
                    <img src={activeUser.imageUrl} alt={activeUser.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
                      {activeUser.matchScore}% match
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">{activeUser.role}</span>
                        {activeUser.verified && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                            <BadgeCheck size={13} />
                            Verificado
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">{activeUser.name}</h2>
                      <p className="mt-1 text-zinc-300">{activeUser.handle}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                        <MapPin size={16} />
                        {activeUser.city} • {activeUser.distanceKm} km • {activeUser.availability}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">
                    <p className="text-lg font-light leading-relaxed text-zinc-300">{activeUser.vibe}</p>
                    <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">{activeUser.lookingFor}</p>

                    <div>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">Características</h3>
                      <div className="flex flex-wrap gap-2">
                        {[...activeUser.disciplines, ...activeUser.interests].map(tag => (
                          <span key={tag} className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => moveNext('pass')}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-red-500 hover:text-red-400"
                    aria-label="Passar perfil"
                  >
                    <X size={28} />
                  </button>
                  <button
                    onClick={() => moveNext('super')}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/60 bg-purple-500/10 text-purple-300 hover:bg-purple-500 hover:text-white"
                    aria-label="Super match"
                  >
                    <Star size={24} />
                  </button>
                  <button
                    onClick={() => moveNext('like')}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.45)] hover:bg-brand-500"
                    aria-label="Curtir perfil"
                  >
                    <Heart size={29} fill="currentColor" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
                <Search className="mx-auto mb-4 text-zinc-700" size={48} />
                <h2 className="text-3xl font-black text-white">Sem cards para estes filtros.</h2>
                <p className="mt-2 text-zinc-400">Abra a distância ou remova filtros para continuar descobrindo.</p>
              </div>
            )}
          </section>

          <aside className="order-3 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">Próximos cards</h3>
              <button onClick={resetDeck} className="text-zinc-500 hover:text-brand-500" aria-label="Reiniciar deck">
                <RotateCcw size={17} />
              </button>
            </div>
            <div className="space-y-3">
              {filteredUsers.slice(currentIndex + 1, currentIndex + 4).map(user => (
                <div key={user.id} className="flex items-center gap-3 rounded-2xl bg-zinc-950 p-3">
                  <img src={user.imageUrl} alt={user.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-white">{user.name}</h4>
                    <p className="truncate text-xs text-zinc-500">{user.role} • {user.city}</p>
                  </div>
                  <div className="text-xs font-black text-brand-500">{user.matchScore}%</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-brand-500">
                <Users size={17} />
                <span className="text-xs font-bold uppercase tracking-widest">Como funciona</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-400">
                Passe quem não combina, curta perfis relevantes e use super match para sinalizar prioridade.
                Depois isso pode virar convites, mensagens e colaborações reais.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};
