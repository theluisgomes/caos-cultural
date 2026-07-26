import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { X, Save, Camera } from 'lucide-react';
import { uploadImage } from '../services/storage';
import { isFirebaseConfigured } from '../lib/firebase';

interface EditProfileProps {
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
  onCancel: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onCancel }) => {
  const [data, setData] = useState<UserProfile>(user);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File, kind: 'avatar' | 'cover') => {
    setUploadError(null);
    try {
      const { url } = await uploadImage('users', user.id, file, kind);
      setData(prev => (kind === 'avatar' ? { ...prev, avatarUrl: url } : { ...prev, coverUrl: url }));
    } catch {
      setUploadError('Falha ao enviar imagem. Verifique login e regras do Storage.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave(data);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Editar Perfil</h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
            <X size={24} className="text-zinc-400" />
          </button>
        </div>

        {isFirebaseConfigured() && (
          <p className="text-xs text-zinc-600 mb-6">Imagens são salvas no Firebase Cloud Storage.</p>
        )}
        {uploadError && <p className="text-sm text-brand-500 mb-4">{uploadError}</p>}

        <form onSubmit={handleSubmit} className="space-y-12">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void handleImageUpload(file, 'cover');
            }}
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void handleImageUpload(file, 'avatar');
            }}
          />

          <div className="space-y-6">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="relative h-48 w-full bg-zinc-900 rounded border border-zinc-800 group cursor-pointer overflow-hidden block"
            >
              <img src={data.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="flex items-center gap-2 text-white font-bold border border-white/20 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Camera size={18} />
                  <span>Alterar Capa</span>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative h-24 w-24 rounded-full bg-zinc-800 border-2 border-zinc-950 overflow-hidden group cursor-pointer"
              >
                <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Camera size={16} className="text-white" />
                </div>
              </button>
              <div className="flex-1">
                <h3 className="font-bold text-white">Foto de Perfil</h3>
                <p className="text-sm text-zinc-500">Recomendado: 400x400px</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Nome</label>
              <input
                type="text"
                value={data.name}
                onChange={e => setData({ ...data, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Handle</label>
              <input
                type="text"
                value={data.handle}
                onChange={e => setData({ ...data, handle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Localização</label>
              <input
                type="text"
                value={data.location}
                onChange={e => setData({ ...data, location: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Bio</label>
              <textarea
                rows={4}
                value={data.bio}
                onChange={e => setData({ ...data, bio: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="px-6 py-3 rounded font-bold text-zinc-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
            >
              {saving ? 'Salvando...' : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
