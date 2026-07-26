import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { seedCulturalData } from '../services/functionsClient';
import { isFirebaseConfigured } from '../lib/firebase';

/** Dev/admin panel to invoke the seed Cloud Function. */
export const FirebaseAdminPanel: React.FC = () => {
  const { user, useFirebase } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!useFirebase || !isFirebaseConfigured() || !user) return null;

  const runSeed = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const result = await seedCulturalData();
      await qc.invalidateQueries({ queryKey: ['listings'] });
      setStatus(
        `Seed OK: ${result.agents} agentes, ${result.spaces} espaços, ${result.events} eventos, ${result.works} obras${result.gemini ? ' (Gemini)' : ''}.`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Falha ao chamar seedCulturalData.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-2">
        <Database size={16} className="text-brand-500" />
        Firebase — dados iniciais
      </div>
      <p className="text-xs text-zinc-500 mb-3">
        Popula Firestore via Cloud Function <code className="text-zinc-400">seedCulturalData</code> (requer admin ou emulador).
      </p>
      <button
        type="button"
        onClick={runSeed}
        disabled={loading}
        className="text-xs font-bold uppercase tracking-wider text-brand-500 hover:text-brand-400 disabled:opacity-50"
      >
        {loading ? 'Semeando...' : 'Executar seed cultural'}
      </button>
      {status && <p className="text-xs text-zinc-400 mt-2">{status}</p>}
    </div>
  );
};
