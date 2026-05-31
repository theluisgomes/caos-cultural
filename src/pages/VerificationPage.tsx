import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getFirestoreInstance, isFirebaseConfigured } from '../lib/firebase';

export const VerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [docNumber, setDocNumber] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  if (!user) return <Navigate to="/" replace />;

  const submit = async () => {
    const id = `ver_${user.id}`;
    const payload = {
      id,
      userId: user.id,
      documentType: docNumber.replace(/\D/g, '').length > 11 ? 'cnpj' : 'cpf',
      documentNumber: docNumber,
      status: 'pending',
      trustTierRequested: 'document',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured()) {
      await setDoc(doc(getFirestoreInstance(), 'verifications', id), payload, { merge: true });
    } else {
      localStorage.setItem(`caos_verification_${user.id}`, JSON.stringify(payload));
    }
    setStatus('Documento enviado para análise. Document AI validará em produção.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-20 px-4 max-w-lg mx-auto">
      <ShieldCheck className="text-brand-500 mb-4" size={40} />
      <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Verificação de identidade</h1>
      <p className="text-zinc-500 mb-8">CPF/CNPJ e validação documental para confiança no ecossistema.</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500">CPF ou CNPJ</label>
          <input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white" placeholder="000.000.000-00" />
        </div>
        <div className="border border-dashed border-zinc-700 rounded p-8 text-center text-zinc-500 text-sm">
          Upload de documento + selfie — processado via Document AI em produção
        </div>
        <button type="button" onClick={submit} className="w-full bg-brand-600 text-white font-bold py-3 rounded">
          Enviar para verificação
        </button>
        {status && <p className="text-sm text-brand-500">{status}</p>}
      </div>
      <p className="text-zinc-600 text-xs mt-6">Níveis: email → documento → documento+face</p>
    </div>
  );
};
