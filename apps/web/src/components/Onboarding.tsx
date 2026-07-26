import React, { useState } from 'react';
import { UserProfile } from '../types';
import type { AgentKind } from '../domain/agent';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void | Promise<void>;
}

const steps = [
  { id: 'role', question: 'Qual sua relação com a arte?', sub: 'Isso define sua persona no CAOS.' },
  { id: 'identity', question: 'Como devemos te chamar?', sub: 'Seu nome artístico ou real.' },
  { id: 'bio', question: 'O que te move?', sub: 'Uma bio curta e impactante.' },
  { id: 'disciplines', question: 'Quais suas disciplinas?', sub: 'Selecione até 3 tags.' },
];

const disciplinesList = [
  'Visual Arts',
  'Techno',
  'Performance',
  'Photography',
  'Theater',
  'Cinema',
  'Design',
  'Fashion',
  'Literature',
  'Code Art',
];

const PERSONA_OPTIONS: { kind: AgentKind; label: string; sub: string; uiRole: UserProfile['role'] }[] = [
  { kind: 'artist', label: 'Artista', sub: 'Divulgar trabalho e ser encontrado.', uiRole: 'ARTIST' },
  { kind: 'producer', label: 'Produtor / Organizador', sub: 'Eventos, produção e curadoria.', uiRole: 'ORGANIZER' },
  { kind: 'curator', label: 'Curador', sub: 'Montar mostras e programações.', uiRole: 'ORGANIZER' },
  { kind: 'collective', label: 'Coletivo / Banda / Projeto', sub: 'Perfil de grupo ou projeto cultural.', uiRole: 'ORGANIZER' },
  { kind: 'collector', label: 'Colecionador', sub: 'Descobrir e adquirir obras.', uiRole: 'VISITOR' },
  { kind: 'designer', label: 'Designer', sub: 'Referências visuais e colaborações.', uiRole: 'VISITOR' },
  { kind: 'space_manager', label: 'Gestor de espaço', sub: 'Programação e operação de locais.', uiRole: 'ORGANIZER' },
  { kind: 'public', label: 'Público geral', sub: 'Explorar a cena cultural.', uiRole: 'VISITOR' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedKind, setSelectedKind] = useState<AgentKind>('artist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user.name || '',
    handle: user.handle || '',
    role: 'ARTIST' as UserProfile['role'],
    bio: '',
    disciplines: [] as string[],
    agentKind: 'artist' as AgentKind,
  });

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = async () => {
    if (isSubmitting) return;
    setSubmitError(null);

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await onComplete({
          ...user,
          name: formData.name,
          handle: formData.handle,
          role: formData.role,
          bio: formData.bio,
          disciplines: formData.disciplines,
          agentKind: formData.agentKind,
          platformRole: user.platformRole ?? 'member',
        });
      } catch (err) {
        console.error('Failed to complete onboarding:', err);
        setSubmitError('Não foi possível finalizar agora. Tente novamente em alguns segundos.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(prev => prev - 1);
  };

  const toggleDiscipline = (disc: string) => {
    const current = formData.disciplines || [];
    if (current.includes(disc)) {
      setFormData({ ...formData, disciplines: current.filter(d => d !== disc) });
    } else if (current.length < 3) {
      setFormData({ ...formData, disciplines: [...current, disc] });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="absolute top-0 left-0 h-1 bg-zinc-900 w-full">
        <div
          className="h-full bg-brand-600 transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="mb-12">
          <span className="text-brand-500 font-mono text-sm mb-2 block">PASSO 0{stepIndex + 1}</span>
          <h1
            key={stepIndex}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4 animate-in slide-in-from-bottom-4 duration-500"
          >
            {currentStep.question}
          </h1>
          <p className="text-zinc-500 text-lg font-light">{currentStep.sub}</p>
        </div>

        <div className="min-h-[200px]">
          {currentStep.id === 'role' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PERSONA_OPTIONS.map(({ kind, label, sub, uiRole }) => (
                <button
                  key={label}
                  onClick={() => {
                    setSelectedKind(kind);
                    setFormData({ ...formData, agentKind: kind, role: uiRole });
                  }}
                  className={`p-5 rounded border-2 transition-all text-left ${
                    selectedKind === kind
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                  }`}
                  type="button"
                >
                  <div
                    className={`font-bold text-lg mb-1 ${
                      selectedKind === kind ? 'text-brand-500' : 'text-white'
                    }`}
                  >
                    {label}
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed">{sub}</p>
                </button>
              ))}
            </div>
          )}

          {currentStep.id === 'identity' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-zinc-800 text-3xl md:text-5xl font-bold text-white focus:border-brand-500 focus:outline-none py-2 placeholder:text-zinc-800"
                  placeholder="Ex: DJ Void"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                  Handle (@)
                </label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={e => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-zinc-800 text-xl md:text-2xl font-mono text-zinc-400 focus:border-brand-500 focus:text-brand-500 focus:outline-none py-2 placeholder:text-zinc-800"
                  placeholder="@void_sp"
                />
              </div>
            </div>
          )}

          {currentStep.id === 'bio' && (
            <div className="animate-in fade-in duration-500">
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-4 text-xl text-white focus:border-brand-500 focus:outline-none min-h-[200px] placeholder:text-zinc-700"
                placeholder="Conte sua história, manifesto ou vibe em poucas linhas..."
                autoFocus
              />
              <div className="text-right text-zinc-600 text-sm mt-2">{formData.bio?.length || 0}/240</div>
            </div>
          )}

          {currentStep.id === 'disciplines' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-wrap gap-3">
                {disciplinesList.map(disc => {
                  const isSelected = formData.disciplines?.includes(disc);
                  return (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => toggleDiscipline(disc)}
                      className={`px-6 py-3 rounded-full text-sm font-bold border transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                          : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {disc}
                    </button>
                  );
                })}
              </div>
              <p className="mt-6 text-zinc-500 text-sm">Selecione até 3 tags que definem seu estilo.</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2"
            >
              <ChevronLeft size={20} />
              Voltar
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-brand-600 hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Finalizando...' : isLastStep ? 'Finalizar' : 'Próximo'}
            {isLastStep ? <Check size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
        {submitError && (
          <p className="mt-4 text-right text-sm font-medium text-red-400">{submitError}</p>
        )}
      </div>
    </div>
  );
};
