
import React from 'react';
import { Scale, ShoppingBag, User, ShieldCheck, ChevronLeft, ChevronRight, FileSearch, BookOpen, MessageSquare, Gamepad2 } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, toggleOpen }) => {
  const menuItems = [
    { id: 'HOME' as ViewState, label: 'Inicio', icon: <Scale size={22} /> },
    { id: 'GAME_CENTER' as ViewState, label: 'Juegos', icon: <Gamepad2 size={22} /> },
    { id: 'CASES' as ViewState, label: 'Consultas', icon: <FileSearch size={22} /> },
    { id: 'STORE' as ViewState, label: 'Tienda & Planes', icon: <ShoppingBag size={22} /> },
    { id: 'BLOG' as ViewState, label: 'Comunidad', icon: <BookOpen size={22} /> },
    { id: 'PROFILE' as ViewState, label: 'Mi Expediente', icon: <User size={22} /> },
    { id: 'ADMIN' as ViewState, label: 'Admin Panel', icon: <ShieldCheck size={22} /> },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full glass-panel z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-white/10`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 neon-bg-cyan rounded-lg flex items-center justify-center text-[#0B0E14] shadow-[0_0_15px_rgba(0,246,255,0.4)]">
          <Scale size={24} strokeWidth={2.5} />
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="font-orbitron font-black text-lg tracking-tighter neon-glow-cyan leading-none">WI HUB</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Legal & Gaming</span>
          </div>
        )}
      </div>

      <button onClick={toggleOpen} className="absolute -right-3 top-20 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-[#0B0E14] hover:scale-110 transition-transform shadow-xl">
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <nav className="flex-1 mt-10 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${
              activeView === item.id 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,246,255,0.1)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <div className={`transition-transform duration-200 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            {isOpen && <span className="font-medium tracking-wide text-sm">{item.label}</span>}
            {activeView === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-cyan-500 rounded-r-full shadow-[0_0_10px_#00F6FF]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all">
          <MessageSquare size={22} />
          {isOpen && <span className="font-medium">Soporte 24/7</span>}
        </button>
      </div>
    </aside>
  );
};
