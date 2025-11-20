import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
  onRegister: (email: string) => void;
  onGoogleLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onRegister, onGoogleLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay managed by parent or here, but parent handlers are async
    if (mode === 'LOGIN') {
      await onLogin(email);
    } else {
      await onRegister(email);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await onGoogleLogin();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-2xl rounded-lg overflow-hidden mx-4">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
              {mode === 'LOGIN' ? 'BEM-VINDO AO CAOS' : 'JUNTE-SE AO CAOS'}
            </h2>
            <p className="text-zinc-400 text-sm">
              {mode === 'LOGIN' ? 'Entre para acessar seu universo.' : 'Crie sua identidade artística.'}
            </p>
          </div>

          {/* Social Login */}
          <button 
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 px-4 rounded flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors mb-6"
          >
             {loading ? <Loader2 className="animate-spin" size={20}/> : (
                <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                    </svg>
                 <span>Continuar com Google</span>
                </>
             )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Ou continue com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="email" 
                placeholder="seu@email.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="password" 
                placeholder="Sua senha secreta" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {mode === 'LOGIN' ? 'ENTRAR' : 'CRIAR CONTA'}
                    <ArrowRight size={18} />
                  </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              {mode === 'LOGIN' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
              <button 
                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="ml-2 text-brand-500 font-bold hover:underline focus:outline-none"
              >
                {mode === 'LOGIN' ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};