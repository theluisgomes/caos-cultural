import React from 'react';
import { Facebook, Twitter, Instagram, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 mt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-zinc-500">
          <div className="space-y-4">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">Suporte</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">AirCover para Criadores</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Apoio à deficiência</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Opções de cancelamento</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">Comunidade</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-brand-500 transition-colors">CAOS.org: ajuda emergencial</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Combate à discriminação</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">Criar no CAOS</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Seja um organizador</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Recursos para artistas</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Fórum da comunidade</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Criar de forma responsável</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold text-white uppercase tracking-wider text-xs">CAOS</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Novos recursos</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Investidores</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span>© 2024 CAOS Cultural, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:text-zinc-400">Privacidade</a>
            <span>·</span>
            <a href="#" className="hover:text-zinc-400">Termos</a>
            <span>·</span>
            <a href="#" className="hover:text-zinc-400">Mapa do site</a>
          </div>
          <div className="flex items-center gap-6 font-medium text-zinc-400">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <Globe size={16} />
                <span className="text-xs">Português (BR)</span>
            </div>
            <div className="flex items-center gap-5">
                <Facebook size={18} className="cursor-pointer hover:text-brand-500 transition-colors" />
                <Twitter size={18} className="cursor-pointer hover:text-brand-500 transition-colors" />
                <Instagram size={18} className="cursor-pointer hover:text-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};