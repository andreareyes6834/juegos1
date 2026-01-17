
import React from 'react';
import { Bell, Coins, Gem, Search, Menu, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface TopNavProps {
  user: UserProfile;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ user, onLogout }) => {
  return (
    <header className="h-24 flex items-center justify-between px-12 glass-panel border-b border-white/5 sticky top-0 z-40 bg-[#0B0E14]/80 backdrop-blur-3xl">
      {/* Brand / Logo Small for TopNav */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-10">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Wilson Ipiales • Supreme Hub</div>
        </div>
      </div>

      {/* User Actions & Stats */}
      <div className="flex items-center gap-8">
        {/* Search Area Refined */}
        <div className="relative w-72 hidden xl:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/30 transition-all text-xs font-medium"
          />
        </div>

        {/* Currencies - High End Style */}
        <div className="flex items-center gap-6 bg-black/40 rounded-[20px] px-6 py-2 border border-white/5">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20 group-hover:scale-110 transition-transform">
              <Coins size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-black uppercase leading-none mb-1">Coins</span>
              <span className="font-orbitron text-xs font-black text-white leading-none">{user.coins.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Gem size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-black uppercase leading-none mb-1">Gems</span>
              <span className="font-orbitron text-xs font-black text-white leading-none">{user.gems.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notifications & Menu */}
        <div className="flex items-center gap-4">
          <button className="relative p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#0B0E14]" />
          </button>
          {onLogout && (
            <button onClick={onLogout} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <LogOut size={20} />
            </button>
          )}
        </div>

        {/* User Profile Summary */}
        <div className="flex items-center gap-5 pl-8 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-white uppercase tracking-tight leading-none mb-2">{user.username}</span>
            <div className="flex items-center gap-3">
               <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500 shadow-[0_0_10px_#00F6FF]" 
                  style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-orbitron font-black text-cyan-400 uppercase tracking-widest">Lvl {user.level}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-[18px] border-2 border-white/10 p-0.5 overflow-hidden bg-black ring-4 ring-cyan-500/10 group cursor-pointer hover:border-cyan-500/40 transition-all">
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};
