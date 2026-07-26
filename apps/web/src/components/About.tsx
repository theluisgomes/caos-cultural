import React from 'react';
import { ArrowLeft, Zap, Users, Globe, Heart } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
  onJoin: () => void;
}

const MANIFESTO = [
  { number: '01', title: 'Arte sem gatekeepers.', body: 'Qualquer criador pode entrar. Não existe curadoria de guardiões — só a curadoria do coletivo.' },
  { number: '02', title: 'O mapa é o território.', body: 'A cidade é o palco. Mapeamos cada vão, cada galpão, cada galeria clandestina que pulsa cultura.' },
  { number: '03', title: 'Conectar antes de monetizar.', body: 'Primeiro, criamos pontes entre artistas, espaços e público. O dinheiro é consequência, nunca o motor.' },
  { number: '04', title: 'Caos é sistema.', body: 'Não somos aleatórios — somos não-lineares. A ordem emerge do encontro de energias não planejadas.' },
];

const TEAM = [
  { name: 'João Ramil', role: 'Fundador & Produto', avatar: 'https://picsum.photos/seed/joaoramil/80/80' },
  { name: 'Luis Gomes', role: 'Fundador & Tecnologia', avatar: 'https://picsum.photos/seed/luisgomes/80/80' },
];

const NUMBERS = [
  { label: 'Artistas', value: '2.4K+' },
  { label: 'Eventos Mapeados', value: '8.1K' },
  { label: 'Cidades', value: '14' },
  { label: 'Comunidade', value: '32K' },
];

export const About: React.FC<AboutProps> = ({ onBack, onJoin }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 animate-in fade-in duration-300">
      {/* Nav */}
      <div className="border-b border-zinc-900 px-4 py-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <span className="font-black text-white tracking-tighter text-xl">CAOS</span>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 border-b border-zinc-900">
        <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-6">Manifesto</p>
        <h1 className="text-[12vw] md:text-[9vw] font-black leading-none tracking-tighter text-white mb-8">
          O CAOS<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">
            é intencional.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-light leading-relaxed">
          Nascemos da crença de que a cultura underground merece infraestrutura. Que cada artista, coletivo e espaço independente precisa de uma plataforma que os leve a sério.
        </p>
      </section>

      {/* Numbers */}
      <section className="border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {NUMBERS.map(n => (
            <div key={n.label} className="text-center md:text-left">
              <div className="text-4xl md:text-5xl font-black text-white mb-1">{n.value}</div>
              <div className="text-zinc-600 text-xs uppercase tracking-widest">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-zinc-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-16">O que acreditamos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MANIFESTO.map(item => (
            <div key={item.number} className="group p-8 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all">
              <div className="text-6xl font-black text-zinc-900 group-hover:text-zinc-800 transition-colors mb-4 leading-none">
                {item.number}
              </div>
              <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-zinc-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-16">Como operamos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-10 h-10 flex items-center justify-center bg-brand-500/10 rounded-lg">
              <Zap size={20} className="text-brand-500" />
            </div>
            <h3 className="font-bold text-white text-lg">Velocidade radical</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Da ideia ao evento publicado em menos de 5 minutos. Sem aprovações desnecessárias, sem burocracia.</p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 rounded-lg">
              <Users size={20} className="text-purple-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Comunidade primeiro</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Decisões de produto são guiadas pela comunidade. Fórum aberto, roadmap público, feedback real.</p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-lg">
              <Globe size={20} className="text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Acesso universal</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Ferramentas de ponta acessíveis ao coletivo de vizinhança e ao artista solo tanto quanto à grande produtora.</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-zinc-900">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-16">Quem faz</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {TEAM.map(member => (
            <div key={member.name} className="text-center group">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-zinc-900 group-hover:border-brand-500/50 transition-all">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-white text-sm">{member.name}</h3>
              <p className="text-zinc-600 text-xs mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Heart size={40} className="mx-auto text-brand-500 mb-6" />
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
          Faça parte do caos.
        </h2>
        <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
          Seja você artista, organizador ou apenas alguém que acredita que a arte muda coisas.
        </p>
        <button
          onClick={onJoin}
          className="bg-brand-600 hover:bg-brand-700 text-white font-black px-10 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_50px_rgba(225,29,72,0.6)] transition-all"
        >
          ENTRAR NO CAOS
        </button>
      </section>
    </div>
  );
};
