
import React from 'react';
import { UserProfile, Achievement } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { Award, Target, History, Settings2 } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Profile Header */}
      <div className="relative glass-panel rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-10 border border-white/10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-[60px] opacity-50 rounded-full" />
        
        <div className="relative z-10">
          <div className="w-40 h-40 rounded-full border-4 border-cyan-500 p-1 bg-black shadow-[0_0_30px_rgba(0,246,255,0.2)]">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-[#0B0E14] px-3 py-1 rounded-full font-orbitron font-black text-lg shadow-lg">
            LVL {user.level}
          </div>
        </div>

        <div className="relative z-10 flex-1 space-y-6">
          <div>
            <h1 className="text-5xl font-orbitron font-black text-slate-100 tracking-tighter uppercase mb-2">{user.username}</h1>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-2"><Target size={16} /> Elite Player</span>
              <span className="flex items-center gap-2"><Award size={16} /> Beta Member</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-cyan-400">
              <span>Experience Points</span>
              <span>{user.xp} / {user.maxXp} XP</span>
            </div>
            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_10px_rgba(0,246,255,0.3)] transition-all duration-1000"
                style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <History size={18} /> Match History
            </button>
            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <Settings2 size={18} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Stats & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
           <h2 className="text-2xl font-orbitron font-black uppercase">Statistics</h2>
           <div className="glass-panel rounded-3xl p-8 border border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Games Played</span>
                <span className="font-orbitron font-bold">1,245</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Wins</span>
                <span className="font-orbitron font-bold text-cyan-400">842</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Highest Win</span>
                <span className="font-orbitron font-bold text-yellow-500">25,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Time Played</span>
                <span className="font-orbitron font-bold">142h</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-orbitron font-black uppercase">Achievements</h2>
             <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length} Unlocked</span>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {ACHIEVEMENTS.map(achievement => (
               <div key={achievement.id} className={`glass-card p-6 rounded-3xl border transition-all ${achievement.unlocked ? 'border-cyan-500/20' : 'opacity-40 grayscale border-white/5'}`}>
                 <div className="flex gap-4">
                   <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                     {achievement.icon}
                   </div>
                   <div>
                     <h4 className="font-orbitron font-black text-slate-100">{achievement.title}</h4>
                     <p className="text-xs text-slate-400 mt-1">{achievement.description}</p>
                     {achievement.unlocked && (
                       <div className="mt-2 inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-black rounded uppercase tracking-widest">
                         Unlocked
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
