import React, { useState } from 'react';
import { ChevronDown, ArrowLeft, MessageCircle, Mail } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    title: 'Sobre o CAOS',
    items: [
      {
        q: 'O que é o CAOS Cultural?',
        a: 'CAOS (Cultural Artistic Organization System) é uma plataforma para mapear, conectar e descobrir eventos culturais, espaços criativos e artistas. Um ecossistema vivo para a cena underground e independente.',
      },
      {
        q: 'O CAOS é gratuito?',
        a: 'Descobrir e explorar o CAOS é completamente gratuito. Criar e listar projetos também é gratuito. Cobramos apenas uma pequena taxa de processamento em transações de ingressos e reservas.',
      },
      {
        q: 'Em quais cidades o CAOS está disponível?',
        a: 'Atualmente focamos em São Paulo, Rio de Janeiro e Belo Horizonte. Mas qualquer pessoa pode se cadastrar e listar projetos de qualquer cidade — a expansão acontece organicamente.',
      },
    ],
  },
  {
    title: 'Para Artistas',
    items: [
      {
        q: 'Como crio meu perfil de artista?',
        a: 'Faça seu cadastro, escolha o papel "Artista" no onboarding, preencha sua bio e disciplinas. Seu perfil estará visível na seção de Artistas imediatamente.',
      },
      {
        q: 'Posso divulgar meu trabalho gratuitamente?',
        a: 'Sim! Você pode criar quantos projetos quiser sem pagar nada. Apenas a venda de ingressos ou a reserva de espaços envolvem taxas de processamento.',
      },
      {
        q: 'O CAOS me ajuda a encontrar espaços para trabalhar?',
        a: 'Sim. Na seção "Espaços" você encontra galerias, estúdios, teatros e outros espaços disponíveis para reserva ou parceria.',
      },
    ],
  },
  {
    title: 'Para Organizadores',
    items: [
      {
        q: 'Como anuncio um evento?',
        a: 'Cadastre-se, escolha o papel "Organizador" e acesse seu dashboard. Clique em "Criar Projeto" e preencha os detalhes do evento: título, descrição, datas, localização e preço.',
      },
      {
        q: 'Posso vender ingressos pelo CAOS?',
        a: 'Sim! Integre a venda de ingressos diretamente na listagem. Aceitamos cartão de crédito, débito e Pix. A taxa é de 3% por transação.',
      },
      {
        q: 'Como faço para listar um espaço para aluguel?',
        a: 'No seu dashboard, clique em "Criar Projeto" e selecione o tipo "Espaço". Preencha capacidade, equipamentos disponíveis, preço por hora ou por sessão.',
      },
    ],
  },
  {
    title: 'Para Visitantes',
    items: [
      {
        q: 'Preciso criar conta para descobrir eventos?',
        a: 'Não! Você pode explorar todos os eventos, espaços e artistas sem criar uma conta. Mas para favoritar, comprar ingressos ou seguir criadores, você precisará de um cadastro.',
      },
      {
        q: 'Como funciona o mapa cultural?',
        a: 'O mapa visual mostra a localização de todos os eventos e espaços cadastrados. Clique nos marcadores para ver detalhes e se conectar diretamente com o criador.',
      },
      {
        q: 'Como encontro eventos próximos a mim?',
        a: 'Ative a geolocalização no mapa ou filtre por bairro na busca. A plataforma aprende suas preferências com o tempo e personaliza as recomendações.',
      },
    ],
  },
  {
    title: 'Técnico & Segurança',
    items: [
      {
        q: 'Meus dados estão seguros?',
        a: 'Sim. Usamos criptografia em todas as transmissões e nunca vendemos dados de usuários. Leia nossa Política de Privacidade para mais detalhes.',
      },
      {
        q: 'O CAOS tem aplicativo mobile?',
        a: 'No momento, o CAOS é uma progressive web app (PWA) totalmente responsiva. Você pode adicionar à sua tela inicial para uma experiência nativa. Apps para iOS e Android estão em nosso roadmap.',
      },
      {
        q: 'Como reporto conteúdo impróprio?',
        a: 'Em qualquer listagem, clique no ícone de compartilhamento e selecione "Reportar". Nossa equipe analisa todos os reportes em até 24 horas.',
      },
      {
        q: 'Posso cancelar minha inscrição em um evento?',
        a: 'Cada evento tem sua própria política de cancelamento definida pelo organizador. Em geral, cancelamentos com mais de 48h de antecedência garantem reembolso total. Consulte os termos do evento específico.',
      },
    ],
  },
];

interface FAQProps {
  onBack: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-zinc-900 px-4 py-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
            FAQ
          </h1>
          <p className="text-zinc-400 text-xl max-w-lg font-light leading-relaxed">
            Tudo que você precisa saber sobre o CAOS Cultural. Não encontrou sua resposta?{' '}
            <button className="text-brand-500 hover:underline">Fale com a gente.</button>
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-14">
          {FAQ_DATA.map(section => (
            <div key={section.title}>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-5 flex items-center gap-3">
                <span className="flex-1 h-px bg-zinc-900" />
                {section.title}
                <span className="flex-1 h-px bg-zinc-900" />
              </h2>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`;
                  const isOpen = openItems.has(key);
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg overflow-hidden transition-colors ${isOpen ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-900 hover:border-zinc-800'}`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full text-left flex justify-between items-start gap-4 p-5"
                      >
                        <span className="font-semibold text-zinc-200 text-base leading-snug">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-zinc-600 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4 animate-in slide-in-from-top duration-200 text-sm">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <MessageCircle size={36} className="text-zinc-600" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Ainda com dúvidas?</h3>
          <p className="text-zinc-500 mb-6 text-sm">Nossa equipe responde em até 24 horas.</p>
          <a
            href="mailto:contato@caoscultural.com.br"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)]"
          >
            <Mail size={16} />
            Enviar mensagem
          </a>
        </div>
      </div>
    </div>
  );
};
