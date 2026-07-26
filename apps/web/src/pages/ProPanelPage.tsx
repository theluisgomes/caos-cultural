import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Briefcase, FileText, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CRM_KEY = 'caos_pro_crm';

interface CrmContact {
  id: string;
  name: string;
  notes: string;
}

export const ProPanelPage: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    try {
      setContacts(JSON.parse(localStorage.getItem(`${CRM_KEY}_${user.id}`) || '[]'));
    } catch {
      setContacts([]);
    }
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  const addContact = () => {
    if (!name.trim()) return;
    const next = [...contacts, { id: `c_${Date.now()}`, name, notes: '' }];
    setContacts(next);
    localStorage.setItem(`${CRM_KEY}_${user.id}`, JSON.stringify(next));
    setName('');
  };

  const tabs = [
    { icon: Users, label: 'Contatos', desc: `${contacts.length} contatos salvos` },
    { icon: FileText, label: 'Orçamentos', desc: 'Gerar e enviar propostas' },
    { icon: Briefcase, label: 'Portfólio', desc: 'Exportável em PDF' },
    { icon: BarChart3, label: 'Analytics', desc: 'Views, saves, boost ROI' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Painel Profissional</h1>
      <p className="text-zinc-500 mb-10">Ferramentas avançadas para produtores, curadores e artistas.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {tabs.map(t => (
          <div key={t.label} className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-brand-500/50 transition-colors">
            <t.icon className="text-brand-500 mb-3" size={24} />
            <h3 className="font-bold text-white">{t.label}</h3>
            <p className="text-zinc-500 text-sm mt-1">{t.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="font-bold text-white mb-4">CRM cultural (local)</h3>
        <div className="flex gap-2 mb-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do contato" className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm" />
          <button type="button" onClick={addContact} className="bg-brand-600 text-white px-4 rounded text-sm font-bold">Adicionar</button>
        </div>
        <ul className="space-y-2 text-sm text-zinc-400">
          {contacts.map(c => (
            <li key={c.id} className="border-b border-zinc-800 pb-2">{c.name}</li>
          ))}
        </ul>
        <p className="text-xs text-zinc-600 mt-4">Assinatura Stripe desbloqueia sync na nuvem e export PDF.</p>
      </div>
    </div>
  );
};
