import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const steps = [
  { id: 'role', question: "Qual sua relação com a arte?", sub: "Isso define como você aparece no CAOS." },
  { id: 'identity', question: "Como devemos te chamar?", sub: "Seu nome artístico ou real." },
  { id: 'bio', question: "O que te move?", sub: "Uma bio curta e impactante." },
  { id: 'disciplines', question: "Quais suas disciplinas?", sub: "Selecione até 3 tags." }
];

const disciplinesList = ["Visual Arts", "Techno", "Performance", "Photography", "Theater", "Cinema", "Design", "Fashion", "Literature", "Code Art"];

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user.name || '',
    handle: user.handle || '',
    role: 'VISITOR',
    bio: '',
    disciplines: []
  });

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete({ ...user, ...formData } as UserProfile);
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
    } else {
      if (current.length < 3) {
        setFormData({ ...formData, disciplines: [...current, disc] });
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Noise */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-zinc-900 w-full">
        <div 
            className="h-full bg-brand-600 transition-all duration-500" 
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="mb-12">
           <span className="text-brand-500 font-mono text-sm mb-2 block">PASSO 0{stepIndex + 1}</span>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4 animate-in slide-in-from-bottom-4 duration-500 key={stepIndex}">
             {currentStep.question}
           </h1>
           <p className="text-zinc-500 text-lg font-light">{currentStep.sub}</p>
        </div>

        <div className="min-h-[200px]">
            {currentStep.id === 'role' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['ARTIST', 'ORGANIZER', 'VISITOR'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setFormData({ ...formData, role: role as any })}
                            className={`p-6 rounded border-2 transition-all text-left group ${
                                formData.role === role 
                                ? 'border-brand-500 bg-brand-500/10' 
                                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                            }`}
                        >
                            <div className={`font-bold text-xl mb-2 ${formData.role === role ? 'text-brand-500' : 'text-white'}`}>
                                {role === 'ARTIST' ? 'Artista' : role === 'ORGANIZER' ? 'Organizador' : 'Visitante'}
                            </div>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                {role === 'ARTIST' ? 'Busco divulgar meu trabalho e encontrar espaços.' : role === 'ORGANIZER' ? 'Gerencio um espaço ou produzo eventos.' : 'Quero descobrir o underground.'}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {currentStep.id === 'identity' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Nome de Exibição</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-transparent border-b-2 border-zinc-800 text-3xl md:text-5xl font-bold text-white focus:border-brand-500 focus:outline-none py-2 placeholder:text-zinc-800"
                            placeholder="Ex: DJ Void"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Handle (@)</label>
                        <input 
                            type="text" 
                            value={formData.handle}
                            onChange={(e) => setFormData({...formData, handle: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-4 text-xl text-white focus:border-brand-500 focus:outline-none min-h-[200px] placeholder:text-zinc-700"
                        placeholder="Conte sua história, manifesto ou vibe em poucas linhas..."
                        autoFocus
                    />
                    <div className="text-right text-zinc-600 text-sm mt-2">
                        {formData.bio?.length || 0}/240
                    </div>
                </div>
            )}

            {currentStep.id === 'disciplines' && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex flex-wrap gap-3">
                        {disciplinesList.map((disc) => {
                            const isSelected = formData.disciplines?.includes(disc);
                            return (
                                <button
                                    key={disc}
                                    onClick={() => toggleDiscipline(disc)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold border transition-all ${
                                        isSelected 
                                        ? 'bg-white text-black border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                                        : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                                    }`}
                                >
                                    {disc}
                                </button>
                            )
                        })}
                    </div>
                    <p className="mt-6 text-zinc-500 text-sm">Selecione até 3 tags que definem seu estilo.</p>
                </div>
            )}
        </div>

        <div className="mt-12 flex items-center justify-between">
            {stepIndex > 0 ? (
                <button onClick={handleBack} className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2">
                    <ChevronLeft size={20} />
                    Voltar
                </button>
            ) : <div></div>}

            <button 
                onClick={handleNext}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all flex items-center gap-2"
            >
                {isLastStep ? 'Finalizar' : 'Próximo'}
                {isLastStep ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
        </div>
      </div>
    </div>
  );
};