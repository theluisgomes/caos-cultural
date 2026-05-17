import React, { useState } from 'react';
import { ArrowLeft, Zap, Building2, Users, Sparkles, Upload, ArrowRight, Check } from 'lucide-react';
import { ListingType, UserProfile } from '../types';

interface CreateListingProps {
  user: UserProfile | null;
  onBack: () => void;
  onLoginRequired: () => void;
}

type Step = 'type' | 'details' | 'media' | 'publish';

const TYPE_OPTIONS = [
  {
    type: ListingType.EVENT,
    label: 'Evento',
    sub: 'Show, exposição, festival, performance',
    icon: Zap,
    color: 'brand',
  },
  {
    type: ListingType.SPACE,
    label: 'Espaço',
    sub: 'Galeria, estúdio, teatro, residência',
    icon: Building2,
    color: 'purple',
  },
  {
    type: ListingType.ARTIST,
    label: 'Artista',
    sub: 'Divulgue seu trabalho e serviços',
    icon: Users,
    color: 'emerald',
  },
  {
    type: ListingType.EXPERIENCE,
    label: 'Experiência',
    sub: 'Workshop, tour, masterclass',
    icon: Sparkles,
    color: 'amber',
  },
];

const STEPS: { id: Step; label: string }[] = [
  { id: 'type', label: 'Tipo' },
  { id: 'details', label: 'Detalhes' },
  { id: 'media', label: 'Mídia' },
  { id: 'publish', label: 'Publicar' },
];

export const CreateListing: React.FC<CreateListingProps> = ({ user, onBack, onLoginRequired }) => {
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<ListingType | null>(null);
  const [details, setDetails] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    date: '',
    location: '',
    tags: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const handleTypeNext = () => {
    if (!user) { onLoginRequired(); return; }
    if (selectedType) setStep('details');
  };

  const handleDetailsNext = () => {
    if (details.title && details.description) setStep('media');
  };

  const handleMediaNext = () => setStep('publish');

  const handlePublish = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-brand-500 flex items-center justify-center mb-8">
          <Check size={36} className="text-brand-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">Publicado!</h1>
        <p className="text-zinc-400 text-lg max-w-sm mb-10">
          Seu projeto está vivo no CAOS. Em breve ele aparecerá para a comunidade.
        </p>
        <button
          onClick={onBack}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)]"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 animate-in fade-in duration-300">
      {/* Nav */}
      <div className="border-b border-zinc-900 px-4 py-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <span className="font-black text-white tracking-tighter text-xl">CRIAR PROJETO</span>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-0">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = s.id === step;
              return (
                <div key={s.id} className="flex-1 relative">
                  <div className={`h-1 transition-all ${done || active ? 'bg-brand-500' : 'bg-zinc-900'}`} />
                  <div className={`text-[10px] font-bold uppercase tracking-wider pt-2 pb-3 transition-colors ${active ? 'text-brand-500' : done ? 'text-zinc-500' : 'text-zinc-800'}`}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">

        {/* STEP: TYPE */}
        {step === 'type' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 01</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">O que você quer criar?</h1>
            <p className="text-zinc-500 mb-10">Escolha o tipo de projeto para o CAOS Cultural.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {TYPE_OPTIONS.map(({ type, label, sub, icon: Icon }) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`text-left p-6 rounded-lg border-2 transition-all group ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    <Icon size={28} className={isSelected ? 'text-brand-500 mb-3' : 'text-zinc-600 mb-3 group-hover:text-zinc-400'} />
                    <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-brand-500' : 'text-white'}`}>{label}</div>
                    <p className="text-zinc-500 text-sm">{sub}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleTypeNext}
                disabled={!selectedType}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)]"
              >
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: DETAILS */}
        {step === 'details' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 02</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Sobre o projeto</h1>
            <p className="text-zinc-500 mb-10">Preencha os detalhes para que a comunidade te encontre.</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Título *</label>
                <input
                  type="text"
                  value={details.title}
                  onChange={e => setDetails({ ...details, title: e.target.value })}
                  placeholder="Um nome que marca"
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white text-xl font-bold focus:border-brand-500 focus:outline-none placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Subtítulo / Localização</label>
                <input
                  type="text"
                  value={details.subtitle}
                  onChange={e => setDetails({ ...details, subtitle: e.target.value })}
                  placeholder={selectedType === ListingType.ARTIST ? 'Sua profissão ou especialidade' : 'Endereço ou bairro'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Descrição *</label>
                <textarea
                  rows={5}
                  value={details.description}
                  onChange={e => setDetails({ ...details, description: e.target.value })}
                  placeholder="Descreva o projeto, o que as pessoas podem esperar, o que faz ele único..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none placeholder:text-zinc-700 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Preço</label>
                  <input
                    type="text"
                    value={details.price}
                    onChange={e => setDetails({ ...details, price: e.target.value })}
                    placeholder="R$ 50 ou Grátis"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none placeholder:text-zinc-700"
                  />
                </div>
                {selectedType !== ListingType.ARTIST && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Data</label>
                    <input
                      type="text"
                      value={details.date}
                      onChange={e => setDetails({ ...details, date: e.target.value })}
                      placeholder="Ex: Sáb, 15 Mar"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none placeholder:text-zinc-700"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={details.tags}
                  onChange={e => setDetails({ ...details, tags: e.target.value })}
                  placeholder="Ex: Techno, Experimental, Live"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep('type')} className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2">
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                onClick={handleDetailsNext}
                disabled={!details.title || !details.description}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)]"
              >
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: MEDIA */}
        {step === 'media' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 03</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Adicione imagens</h1>
            <p className="text-zinc-500 mb-10">A primeira impressão é visual. Use fotos de alta qualidade.</p>

            <div className="border-2 border-dashed border-zinc-800 rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group mb-4">
              <Upload size={40} className="text-zinc-700 group-hover:text-brand-500 mb-4 transition-colors" />
              <p className="font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">Arraste fotos ou clique para selecionar</p>
              <p className="text-zinc-700 text-sm mt-2">JPG, PNG ou WebP • Máx 10MB por arquivo</p>
            </div>

            <p className="text-zinc-600 text-sm text-center mb-10">Dica: A foto capa será exibida nos cards de listagem. Proporção ideal: 4:5.</p>

            <div className="flex justify-between">
              <button onClick={() => setStep('details')} className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2">
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                onClick={handleMediaNext}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)]"
              >
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: PUBLISH */}
        {step === 'publish' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 04</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Tudo pronto?</h1>
            <p className="text-zinc-500 mb-10">Revise as informações antes de publicar.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 mb-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">
                    {selectedType}
                  </div>
                  <h3 className="text-2xl font-black text-white">{details.title || 'Sem título'}</h3>
                  {details.subtitle && <p className="text-zinc-400 mt-1">{details.subtitle}</p>}
                </div>
                {details.price && (
                  <div className="font-bold text-white text-lg">{details.price}</div>
                )}
              </div>
              {details.description && (
                <p className="text-zinc-500 text-sm leading-relaxed border-t border-zinc-800 pt-4">
                  {details.description}
                </p>
              )}
              {details.tags && (
                <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                  {details.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-10 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
              <p className="text-zinc-500 text-sm">
                Ao publicar, você confirma que as informações são verídicas e que possui os direitos sobre o conteúdo publicado. Leia nossos <span className="text-brand-500 cursor-pointer hover:underline">Termos de Uso</span>.
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('media')} className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2">
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black px-10 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)] text-lg"
              >
                PUBLICAR <Zap size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
