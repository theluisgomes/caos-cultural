import React, { useMemo, useState } from 'react';
import { ArrowLeft, Zap, Building2, Users, Upload, ArrowRight, Check } from 'lucide-react';
import { ListingType, UserProfile } from '../types';
import {
  publishAgentListing,
  publishEventListing,
  publishSpaceListing,
} from '../services/publishListing';
import { isFirebaseConfigured } from '../lib/firebase';

interface CreateListingProps {
  user: UserProfile | null;
  onBack: () => void;
  onLoginRequired: () => void;
}

type Step = 'type' | 'details' | 'media' | 'publish';
type EntityType = ListingType.EVENT | ListingType.SPACE | ListingType.ARTIST;

type PersonForm = {
  nome: string;
  handle: string;
  nomeArtistico: string;
  dataNascimento: string;
  cidade: string;
  estado: string;
  bairro: string;
  email: string;
  telefone: string;
  genero: string;
  raca: string;
  cor: string;
  orientacaoSexual: string;
  biografia: string;
  site: string;
  instagram: string;
  linkedin: string;
  cpf: string;
  profissao: string;
  linguagemArtistica: string;
  tecnica: string;
};

type SpaceForm = {
  nomeRepresentante: string;
  nomeEspaco: string;
  handle: string;
  categoria: string;
  descricao: string;
  email: string;
  telefone: string;
  site: string;
  instagram: string;
  endereco: string;
  numero: string;
  complemento: string;
  cep: string;
  cnpj: string;
  acessibilidade: string;
  horarioFuncionamento: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
  perfilPublico: string;
  cardapio: string;
  maiorIdade: boolean;
  petFriendly: boolean;
};

type EventForm = {
  nomeRepresentante: string;
  nomeEvento: string;
  handle: string;
  categoria: string;
  descricao: string;
  email: string;
  telefone: string;
  site: string;
  instagram: string;
  endereco: string;
  cidade: string;
  cnpjResponsavel: string;
  acessibilidade: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
  perfilPublico: string;
  classificacaoIndicativa: string;
};

const emptyPerson: PersonForm = {
  nome: '',
  handle: '',
  nomeArtistico: '',
  dataNascimento: '',
  cidade: '',
  estado: '',
  bairro: '',
  email: '',
  telefone: '',
  genero: '',
  raca: '',
  cor: '',
  orientacaoSexual: '',
  biografia: '',
  site: '',
  instagram: '',
  linkedin: '',
  cpf: '',
  profissao: '',
  linguagemArtistica: '',
  tecnica: '',
};

const emptySpace: SpaceForm = {
  nomeRepresentante: '',
  nomeEspaco: '',
  handle: '',
  categoria: '',
  descricao: '',
  email: '',
  telefone: '',
  site: '',
  instagram: '',
  endereco: '',
  numero: '',
  complemento: '',
  cep: '',
  cnpj: '',
  acessibilidade: '',
  horarioFuncionamento: '',
  cpfResponsavel: '',
  telefoneResponsavel: '',
  perfilPublico: '',
  cardapio: '',
  maiorIdade: false,
  petFriendly: false,
};

const emptyEvent: EventForm = {
  nomeRepresentante: '',
  nomeEvento: '',
  handle: '',
  categoria: '',
  descricao: '',
  email: '',
  telefone: '',
  site: '',
  instagram: '',
  endereco: '',
  cidade: '',
  cnpjResponsavel: '',
  acessibilidade: '',
  cpfResponsavel: '',
  telefoneResponsavel: '',
  perfilPublico: '',
  classificacaoIndicativa: '',
};

const TYPE_OPTIONS: {
  type: EntityType;
  label: string;
  sub: string;
  icon: typeof Users;
}[] = [
  {
    type: ListingType.ARTIST,
    label: 'Pessoa',
    sub: 'Artista, produtor, curador, coletivo e agentes culturais',
    icon: Users,
  },
  {
    type: ListingType.SPACE,
    label: 'Espaço',
    sub: 'Galeria, estúdio, teatro, bar, residência, casa de shows',
    icon: Building2,
  },
  {
    type: ListingType.EVENT,
    label: 'Evento',
    sub: 'Show, exposição, festival, performance, workshop',
    icon: Zap,
  },
];

const SPACE_CATEGORIES = [
  'Galeria',
  'Estúdio',
  'Teatro',
  'Bar / Live',
  'Museu',
  'Centro cultural',
  'Residência',
  'Cinema',
  'Espaço aberto',
  'Outro',
];

const EVENT_CATEGORIES = [
  'Show',
  'Exposição',
  'Peça',
  'Workshop',
  'Talk',
  'Festival',
  'Cinema',
  'Performance',
  'Festa',
  'Lançamento',
  'Outro',
];

const AGE_RATINGS = ['Livre', '12', '14', '16', '18'];

const STEPS: { id: Step; label: string }[] = [
  { id: 'type', label: 'Tipo' },
  { id: 'details', label: 'Cadastro' },
  { id: 'media', label: 'Mídia' },
  { id: 'publish', label: 'Publicar' },
];

const inputClass =
  'w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none placeholder:text-zinc-700';
const labelClass = 'text-xs font-bold uppercase text-zinc-500 tracking-wider';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass}>
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export const CreateListing: React.FC<CreateListingProps> = ({ user, onBack, onLoginRequired }) => {
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  const [person, setPerson] = useState<PersonForm>(emptyPerson);
  const [space, setSpace] = useState<SpaceForm>(emptySpace);
  const [event, setEvent] = useState<EventForm>(emptyEvent);
  const [submitted, setSubmitted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const summary = useMemo(() => {
    if (selectedType === ListingType.ARTIST) {
      return {
        title: person.nomeArtistico || person.nome || 'Sem nome',
        subtitle: [person.profissao, person.cidade].filter(Boolean).join(' · '),
        description: person.biografia,
        tags: [person.linguagemArtistica, person.tecnica].filter(Boolean),
        typeLabel: 'Pessoa',
      };
    }
    if (selectedType === ListingType.SPACE) {
      return {
        title: space.nomeEspaco || 'Sem nome',
        subtitle: [space.categoria, space.endereco].filter(Boolean).join(' · '),
        description: space.descricao,
        tags: [space.perfilPublico, space.acessibilidade].filter(Boolean),
        typeLabel: 'Espaço',
      };
    }
    return {
      title: event.nomeEvento || 'Sem nome',
      subtitle: [event.categoria, event.cidade].filter(Boolean).join(' · '),
      description: event.descricao,
      tags: [event.perfilPublico, event.classificacaoIndicativa].filter(Boolean),
      typeLabel: 'Evento',
    };
  }, [selectedType, person, space, event]);

  const detailsValid = useMemo(() => {
    if (selectedType === ListingType.ARTIST) {
      return Boolean(person.nome.trim() && person.handle.trim() && person.email.trim());
    }
    if (selectedType === ListingType.SPACE) {
      return Boolean(
        space.nomeRepresentante.trim() &&
          space.nomeEspaco.trim() &&
          space.handle.trim() &&
          space.categoria.trim() &&
          space.descricao.trim() &&
          space.email.trim(),
      );
    }
    if (selectedType === ListingType.EVENT) {
      return Boolean(
        event.nomeRepresentante.trim() &&
          event.nomeEvento.trim() &&
          event.handle.trim() &&
          event.categoria.trim() &&
          event.descricao.trim() &&
          event.email.trim(),
      );
    }
    return false;
  }, [selectedType, person, space, event]);

  const handleTypeNext = () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    if (selectedType) setStep('details');
  };

  const handleDetailsNext = () => {
    if (detailsValid) setStep('media');
  };

  const handleMediaNext = () => setStep('publish');

  const handlePublish = async () => {
    if (!user || !selectedType) return;
    setPublishError(null);
    setIsPublishing(true);
    try {
      if (!isFirebaseConfigured()) {
        await new Promise(r => setTimeout(r, 400));
        setSubmitted(true);
        return;
      }
      if (selectedType === ListingType.ARTIST) {
        await publishAgentListing({
          userId: user.id,
          displayName: person.nomeArtistico || person.nome,
          handle: person.handle,
          bio: person.biografia,
          city: person.cidade || null,
          state: person.estado || null,
          neighborhood: person.bairro || null,
          kind: 'artist',
          disciplines: [person.linguagemArtistica].filter(Boolean),
          techniques: [person.tecnica].filter(Boolean),
          professions: [person.profissao].filter(Boolean),
          avatarUrl: null,
          social: { instagram: person.instagram, website: person.site },
        });
      } else if (selectedType === ListingType.SPACE) {
        await publishSpaceListing({
          userId: user.id,
          name: space.nomeEspaco,
          handle: space.handle,
          category: space.categoria,
          description: space.descricao,
          city: 'São Paulo',
          street: space.endereco || null,
          number: space.numero || null,
          contactEmail: space.email || null,
          contactPhone: space.telefone || null,
          website: space.site || null,
        });
      } else {
        await publishEventListing({
          userId: user.id,
          title: event.nomeEvento,
          handle: event.handle,
          category: event.categoria,
          description: event.descricao,
          city: event.cidade,
          ageRating: event.classificacaoIndicativa || null,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setPublishError(err instanceof Error ? err.message : 'Falha ao publicar.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-brand-500 flex items-center justify-center mb-8">
          <Check size={36} className="text-brand-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">Publicado!</h1>
        <p className="text-zinc-400 text-lg max-w-sm mb-10">
          Seu cadastro está vivo no CAOS. Em breve ele aparecerá para a comunidade.
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
      <div className="border-b border-zinc-900 px-4 py-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <span className="font-black text-white tracking-tighter text-xl">CADASTRO</span>
        </div>
      </div>

      <div className="border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-0">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = s.id === step;
              return (
                <div key={s.id} className="flex-1 relative">
                  <div className={`h-1 transition-all ${done || active ? 'bg-brand-500' : 'bg-zinc-900'}`} />
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider pt-2 pb-3 transition-colors ${
                      active ? 'text-brand-500' : done ? 'text-zinc-500' : 'text-zinc-800'
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
        {step === 'type' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 01</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              O que você quer cadastrar?
            </h1>
            <p className="text-zinc-500 mb-10">Cada tipo tem um formulário próprio no CAOS Cultural.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
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
                    <Icon
                      size={28}
                      className={isSelected ? 'text-brand-500 mb-3' : 'text-zinc-600 mb-3 group-hover:text-zinc-400'}
                    />
                    <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-brand-500' : 'text-white'}`}>
                      {label}
                    </div>
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

        {step === 'details' && selectedType === ListingType.ARTIST && (
          <div className="animate-in slide-in-from-bottom-4 duration-400 space-y-10">
            <div>
              <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 02 · Pessoa</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Cadastro de pessoa</h1>
              <p className="text-zinc-500">Perfil público de agentes culturais.</p>
            </div>

            <Section title="Identidade">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome" required>
                  <input
                    className={inputClass}
                    value={person.nome}
                    onChange={e => setPerson({ ...person, nome: e.target.value })}
                    placeholder="Nome completo"
                    autoFocus
                  />
                </Field>
                <Field label="@ do Usuário" required>
                  <input
                    className={inputClass}
                    value={person.handle}
                    onChange={e => setPerson({ ...person, handle: e.target.value })}
                    placeholder="@seu_handle"
                  />
                </Field>
                <Field label="Nome Artístico">
                  <input
                    className={inputClass}
                    value={person.nomeArtistico}
                    onChange={e => setPerson({ ...person, nomeArtistico: e.target.value })}
                    placeholder="Como você aparece na cena"
                  />
                </Field>
                <Field label="Data de Nascimento">
                  <input
                    type="date"
                    className={inputClass}
                    value={person.dataNascimento}
                    onChange={e => setPerson({ ...person, dataNascimento: e.target.value })}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Localização">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Cidade">
                  <input
                    className={inputClass}
                    value={person.cidade}
                    onChange={e => setPerson({ ...person, cidade: e.target.value })}
                    placeholder="São Paulo"
                  />
                </Field>
                <Field label="Estado">
                  <input
                    className={inputClass}
                    value={person.estado}
                    onChange={e => setPerson({ ...person, estado: e.target.value })}
                    placeholder="SP"
                  />
                </Field>
                <Field label="Bairro">
                  <input
                    className={inputClass}
                    value={person.bairro}
                    onChange={e => setPerson({ ...person, bairro: e.target.value })}
                    placeholder="Centro"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Contato">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <input
                    type="email"
                    className={inputClass}
                    value={person.email}
                    onChange={e => setPerson({ ...person, email: e.target.value })}
                    placeholder="voce@email.com"
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    className={inputClass}
                    value={person.telefone}
                    onChange={e => setPerson({ ...person, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </Field>
                <Field label="Site">
                  <input
                    className={inputClass}
                    value={person.site}
                    onChange={e => setPerson({ ...person, site: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    className={inputClass}
                    value={person.instagram}
                    onChange={e => setPerson({ ...person, instagram: e.target.value })}
                    placeholder="@instagram"
                  />
                </Field>
                <Field label="LinkedIn">
                  <input
                    className={inputClass}
                    value={person.linkedin}
                    onChange={e => setPerson({ ...person, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/..."
                  />
                </Field>
                <Field label="CPF">
                  <input
                    className={inputClass}
                    value={person.cpf}
                    onChange={e => setPerson({ ...person, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Identidade sociocultural">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Gênero">
                  <input
                    className={inputClass}
                    value={person.genero}
                    onChange={e => setPerson({ ...person, genero: e.target.value })}
                    placeholder="Como você se identifica"
                  />
                </Field>
                <Field label="Raça">
                  <input
                    className={inputClass}
                    value={person.raca}
                    onChange={e => setPerson({ ...person, raca: e.target.value })}
                  />
                </Field>
                <Field label="Cor">
                  <input
                    className={inputClass}
                    value={person.cor}
                    onChange={e => setPerson({ ...person, cor: e.target.value })}
                  />
                </Field>
                <Field label="Orientação Sexual">
                  <input
                    className={inputClass}
                    value={person.orientacaoSexual}
                    onChange={e => setPerson({ ...person, orientacaoSexual: e.target.value })}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Prática artística">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Profissão">
                  <input
                    className={inputClass}
                    value={person.profissao}
                    onChange={e => setPerson({ ...person, profissao: e.target.value })}
                    placeholder="Artista visual, DJ, curador..."
                  />
                </Field>
                <Field label="Linguagem Artística">
                  <input
                    className={inputClass}
                    value={person.linguagemArtistica}
                    onChange={e => setPerson({ ...person, linguagemArtistica: e.target.value })}
                    placeholder="Performance, música, cinema..."
                  />
                </Field>
                <Field label="Técnica">
                  <input
                    className={inputClass}
                    value={person.tecnica}
                    onChange={e => setPerson({ ...person, tecnica: e.target.value })}
                    placeholder="Óleo, live coding, improvisação..."
                  />
                </Field>
              </div>
              <Field label="Biografia">
                <textarea
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={person.biografia}
                  onChange={e => setPerson({ ...person, biografia: e.target.value })}
                  placeholder="Conte sua trajetória, manifesto ou vibe..."
                />
              </Field>
            </Section>

            <FormNav onBack={() => setStep('type')} onNext={handleDetailsNext} nextDisabled={!detailsValid} />
          </div>
        )}

        {step === 'details' && selectedType === ListingType.SPACE && (
          <div className="animate-in slide-in-from-bottom-4 duration-400 space-y-10">
            <div>
              <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 02 · Espaço</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Cadastro de espaço</h1>
              <p className="text-zinc-500">Locais e venues da cena cultural.</p>
            </div>

            <Section title="Identidade do espaço">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome do Representante" required>
                  <input
                    className={inputClass}
                    value={space.nomeRepresentante}
                    onChange={e => setSpace({ ...space, nomeRepresentante: e.target.value })}
                    placeholder="Quem responde pelo espaço"
                    autoFocus
                  />
                </Field>
                <Field label="Nome do Espaço" required>
                  <input
                    className={inputClass}
                    value={space.nomeEspaco}
                    onChange={e => setSpace({ ...space, nomeEspaco: e.target.value })}
                    placeholder="Nome público do local"
                  />
                </Field>
                <Field label="@ do Usuário" required>
                  <input
                    className={inputClass}
                    value={space.handle}
                    onChange={e => setSpace({ ...space, handle: e.target.value })}
                    placeholder="@espaco"
                  />
                </Field>
                <Field label="Categoria" required>
                  <select
                    className={inputClass}
                    value={space.categoria}
                    onChange={e => setSpace({ ...space, categoria: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {SPACE_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Descrição" required>
                <textarea
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={space.descricao}
                  onChange={e => setSpace({ ...space, descricao: e.target.value })}
                  placeholder="Conte a proposta do espaço, programação e atmosfera..."
                />
              </Field>
            </Section>

            <Section title="Contato">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <input
                    type="email"
                    className={inputClass}
                    value={space.email}
                    onChange={e => setSpace({ ...space, email: e.target.value })}
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    className={inputClass}
                    value={space.telefone}
                    onChange={e => setSpace({ ...space, telefone: e.target.value })}
                  />
                </Field>
                <Field label="Site">
                  <input
                    className={inputClass}
                    value={space.site}
                    onChange={e => setSpace({ ...space, site: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    className={inputClass}
                    value={space.instagram}
                    onChange={e => setSpace({ ...space, instagram: e.target.value })}
                    placeholder="@instagram"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Endereço">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Endereço">
                    <input
                      className={inputClass}
                      value={space.endereco}
                      onChange={e => setSpace({ ...space, endereco: e.target.value })}
                      placeholder="Rua / Avenida"
                    />
                  </Field>
                </div>
                <Field label="Número">
                  <input
                    className={inputClass}
                    value={space.numero}
                    onChange={e => setSpace({ ...space, numero: e.target.value })}
                  />
                </Field>
                <Field label="CEP">
                  <input
                    className={inputClass}
                    value={space.cep}
                    onChange={e => setSpace({ ...space, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Complemento">
                    <input
                      className={inputClass}
                      value={space.complemento}
                      onChange={e => setSpace({ ...space, complemento: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Operação e responsável">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CNPJ">
                  <input
                    className={inputClass}
                    value={space.cnpj}
                    onChange={e => setSpace({ ...space, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </Field>
                <Field label="CPF do Responsável">
                  <input
                    className={inputClass}
                    value={space.cpfResponsavel}
                    onChange={e => setSpace({ ...space, cpfResponsavel: e.target.value })}
                  />
                </Field>
                <Field label="Telefone do Responsável">
                  <input
                    className={inputClass}
                    value={space.telefoneResponsavel}
                    onChange={e => setSpace({ ...space, telefoneResponsavel: e.target.value })}
                  />
                </Field>
                <Field label="Horário de Funcionamento">
                  <input
                    className={inputClass}
                    value={space.horarioFuncionamento}
                    onChange={e => setSpace({ ...space, horarioFuncionamento: e.target.value })}
                    placeholder="Ter–Sáb, 14h–22h"
                  />
                </Field>
                <Field label="Acessibilidade">
                  <input
                    className={inputClass}
                    value={space.acessibilidade}
                    onChange={e => setSpace({ ...space, acessibilidade: e.target.value })}
                    placeholder="Rampa, audiodescrição, libras..."
                  />
                </Field>
                <Field label="Perfil do Público">
                  <input
                    className={inputClass}
                    value={space.perfilPublico}
                    onChange={e => setSpace({ ...space, perfilPublico: e.target.value })}
                    placeholder="Quem frequenta o espaço"
                  />
                </Field>
                <Field label="Cardápio">
                  <input
                    className={inputClass}
                    value={space.cardapio}
                    onChange={e => setSpace({ ...space, cardapio: e.target.value })}
                    placeholder="Link ou descrição"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={space.maiorIdade}
                    onChange={e => setSpace({ ...space, maiorIdade: e.target.checked })}
                    className="size-4 rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500"
                  />
                  18+
                </label>
                <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={space.petFriendly}
                    onChange={e => setSpace({ ...space, petFriendly: e.target.checked })}
                    className="size-4 rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500"
                  />
                  Pet Friendly
                </label>
              </div>
            </Section>

            <FormNav onBack={() => setStep('type')} onNext={handleDetailsNext} nextDisabled={!detailsValid} />
          </div>
        )}

        {step === 'details' && selectedType === ListingType.EVENT && (
          <div className="animate-in slide-in-from-bottom-4 duration-400 space-y-10">
            <div>
              <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 02 · Evento</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Cadastro de evento</h1>
              <p className="text-zinc-500">Acontecimentos da agenda cultural.</p>
            </div>

            <Section title="Identidade do evento">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome do Representante" required>
                  <input
                    className={inputClass}
                    value={event.nomeRepresentante}
                    onChange={e => setEvent({ ...event, nomeRepresentante: e.target.value })}
                    placeholder="Quem organiza"
                    autoFocus
                  />
                </Field>
                <Field label="Nome do Evento" required>
                  <input
                    className={inputClass}
                    value={event.nomeEvento}
                    onChange={e => setEvent({ ...event, nomeEvento: e.target.value })}
                    placeholder="Título do evento"
                  />
                </Field>
                <Field label="@ do Usuário" required>
                  <input
                    className={inputClass}
                    value={event.handle}
                    onChange={e => setEvent({ ...event, handle: e.target.value })}
                    placeholder="@evento"
                  />
                </Field>
                <Field label="Categoria" required>
                  <select
                    className={inputClass}
                    value={event.categoria}
                    onChange={e => setEvent({ ...event, categoria: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {EVENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Descrição" required>
                <textarea
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={event.descricao}
                  onChange={e => setEvent({ ...event, descricao: e.target.value })}
                  placeholder="O que acontece, para quem, o que torna único..."
                />
              </Field>
            </Section>

            <Section title="Contato">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <input
                    type="email"
                    className={inputClass}
                    value={event.email}
                    onChange={e => setEvent({ ...event, email: e.target.value })}
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    className={inputClass}
                    value={event.telefone}
                    onChange={e => setEvent({ ...event, telefone: e.target.value })}
                  />
                </Field>
                <Field label="Site">
                  <input
                    className={inputClass}
                    value={event.site}
                    onChange={e => setEvent({ ...event, site: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    className={inputClass}
                    value={event.instagram}
                    onChange={e => setEvent({ ...event, instagram: e.target.value })}
                    placeholder="@instagram"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Local">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Endereço">
                  <input
                    className={inputClass}
                    value={event.endereco}
                    onChange={e => setEvent({ ...event, endereco: e.target.value })}
                    placeholder="Local ou endereço"
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    className={inputClass}
                    value={event.cidade}
                    onChange={e => setEvent({ ...event, cidade: e.target.value })}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Responsável e classificação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CNPJ do Responsável">
                  <input
                    className={inputClass}
                    value={event.cnpjResponsavel}
                    onChange={e => setEvent({ ...event, cnpjResponsavel: e.target.value })}
                  />
                </Field>
                <Field label="CPF do Responsável">
                  <input
                    className={inputClass}
                    value={event.cpfResponsavel}
                    onChange={e => setEvent({ ...event, cpfResponsavel: e.target.value })}
                  />
                </Field>
                <Field label="Telefone do Responsável">
                  <input
                    className={inputClass}
                    value={event.telefoneResponsavel}
                    onChange={e => setEvent({ ...event, telefoneResponsavel: e.target.value })}
                  />
                </Field>
                <Field label="Acessibilidade">
                  <input
                    className={inputClass}
                    value={event.acessibilidade}
                    onChange={e => setEvent({ ...event, acessibilidade: e.target.value })}
                    placeholder="Rampa, audiodescrição, libras..."
                  />
                </Field>
                <Field label="Perfil do Público">
                  <input
                    className={inputClass}
                    value={event.perfilPublico}
                    onChange={e => setEvent({ ...event, perfilPublico: e.target.value })}
                    placeholder="Para quem é o evento"
                  />
                </Field>
                <Field label="Classificação Indicativa">
                  <select
                    className={inputClass}
                    value={event.classificacaoIndicativa}
                    onChange={e => setEvent({ ...event, classificacaoIndicativa: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {AGE_RATINGS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            <FormNav onBack={() => setStep('type')} onNext={handleDetailsNext} nextDisabled={!detailsValid} />
          </div>
        )}

        {step === 'media' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 03</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Fotos do perfil</h1>
            <p className="text-zinc-500 mb-10">Foto de perfil e foto de capa, conforme o cadastro.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {['Foto Perfil', 'Foto Capa'].map(label => (
                <div
                  key={label}
                  className="border-2 border-dashed border-zinc-800 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group"
                >
                  <Upload size={32} className="text-zinc-700 group-hover:text-brand-500 mb-3 transition-colors" />
                  <p className="font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">{label}</p>
                  <p className="text-zinc-700 text-sm mt-2">JPG, PNG ou WebP</p>
                </div>
              ))}
            </div>

            <p className="text-zinc-600 text-sm text-center mb-10">
              A foto capa aparece nos cards de listagem. Proporção ideal: 4:5.
            </p>

            <FormNav onBack={() => setStep('details')} onNext={handleMediaNext} />
          </div>
        )}

        {step === 'publish' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400">
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase mb-4">Passo 04</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Tudo pronto?</h1>
            <p className="text-zinc-500 mb-10">Revise as informações antes de publicar.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 mb-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">
                    {summary.typeLabel}
                  </div>
                  <h3 className="text-2xl font-black text-white">{summary.title}</h3>
                  {summary.subtitle && <p className="text-zinc-400 mt-1">{summary.subtitle}</p>}
                </div>
              </div>
              {summary.description && (
                <p className="text-zinc-500 text-sm leading-relaxed border-t border-zinc-800 pt-4">
                  {summary.description}
                </p>
              )}
              {summary.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                  {summary.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-10 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
              <p className="text-zinc-500 text-sm">
                Ao publicar, você confirma que as informações são verídicas e que possui os direitos sobre o conteúdo
                publicado. Leia nossos <span className="text-brand-500 cursor-pointer hover:underline">Termos de Uso</span>.
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('media')} className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2">
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-black px-10 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)] text-lg"
              >
                {isPublishing ? 'PUBLICANDO…' : 'PUBLICAR'} <Zap size={20} />
              </button>
            </div>
            {publishError && <p className="mt-4 text-right text-sm text-red-400">{publishError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

function FormNav({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex justify-between pt-2">
      <button onClick={onBack} className="text-zinc-500 hover:text-white flex items-center gap-2 px-4 py-2">
        <ArrowLeft size={18} /> Voltar
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)]"
      >
        Próximo <ArrowRight size={18} />
      </button>
    </div>
  );
}
