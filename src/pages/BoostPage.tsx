import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';

export const BoostPage: React.FC = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState('50');
  const [targetId, setTargetId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (!user) return <Navigate to="/" replace />;

  const activate = async () => {
    const payload = {
      actorUserId: user.id,
      targetType: 'event',
      targetId: targetId || 'self',
      budgetBRL: Number(budget),
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured()) {
      await addDoc(collection(getFirestoreInstance(), 'boosts'), payload);
    } else {
      const key = `caos_boosts_${user.id}`;
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([payload, ...items]));
    }
    setMessage('Impulsionamento registrado. Checkout Stripe em produção.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4 max-w-lg mx-auto">
      <Zap className="text-brand-500 mb-4" size={40} />
      <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Turbinar</h1>
      <p className="text-zinc-500 mb-8">Impulsione seu evento, obra ou perfil para quem já demonstra interesse real.</p>
      <label className="text-xs font-bold uppercase text-zinc-500">ID do alvo (evento/obra/perfil)</label>
      <input value={targetId} onChange={e => setTargetId(e.target.value)} className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white mb-4" placeholder="event_sombras" />
      <label className="text-xs font-bold uppercase text-zinc-500">Orçamento (R$)</label>
      <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white mb-6" />
      <button type="button" onClick={activate} className="w-full bg-brand-600 text-white font-bold py-3 rounded">
        Ativar impulsionamento
      </button>
      {message && <p className="text-sm text-brand-500 mt-4">{message}</p>}
      <p className="text-zinc-600 text-xs mt-4">Pagamento via Stripe Connect — contabilizado em Cloud Function</p>
    </div>
  );
};
