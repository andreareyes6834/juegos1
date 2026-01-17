
import React from 'react';
import { Trophy, Shield, Scale, Briefcase, Gavel, Gamepad2, Sparkles, TrendingUp, ArrowUpRight } from 'lucide-react';
import { LEGAL_SERVICES, MOCK_GAMES } from '../constants';

export const HomeView: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Premium Hero Section */}
      <section className="relative h-[650px] rounded-[60px] overflow-hidden glass-panel border border-white/10 group flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/70 to-transparent" />
        
        <div className="relative z-10 px-16 lg:px-24 max-w-4xl space-y-10">
          <div className="flex items-center gap-4 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
            <Shield size={18} className="text-cyan-400" />
            <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">Wilson Ipiales • Firma Elite</span>
          </div>
          
          <h1 className="text-8xl font-orbitron font-black leading-[0.95] tracking-tighter">
            ESTRATEGIA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-slate-500">
              SIN LÍMITES
            </span>
          </h1>
          
          <p className="text-slate-400 text-2xl leading-relaxed max-w-2xl font-light">
            Donde el derecho de alta gama se encuentra con el entretenimiento de clase mundial. Gestión jurídica integral y acceso exclusivo a nuestra sala VIP.
          </p>
          
          <div className="flex gap-8 pt-4">
            <button className="px-12 py-6 bg-white text-[#0B0E14] font-orbitron font-black rounded-3xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all transform hover:scale-105 active:scale-95 text-xl flex items-center gap-3">
              CONSULTORÍA <ArrowUpRight size={24} />
            </button>
            <button className="px-12 py-6 glass-panel border border-white/20 text-white font-orbitron font-black rounded-3xl transition-all text-xl hover:bg-white/10">
              VIP LOUNGE
            </button>
          </div>
        </div>

        {/* Floating Data Cards */}
        <div className="absolute right-24 hidden xl:block space-y-8 animate-in fade-in slide-in-from-right-10 duration-1000">
           <div className="glass-panel p-8 rounded-[40px] border border-cyan-500/30 backdrop-blur-2xl w-80 text-center">
              <div className="text-5xl font-orbitron font-black text-cyan-400 mb-2">99.8%</div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Efectividad Jurídica</div>
           </div>
           <div className="glass-panel p-8 rounded-[40px] border border-white/10 backdrop-blur-2xl w-80 text-center translate-x-12">
              <div className="text-5xl font-orbitron font-black text-white mb-2">12M+</div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Coins en Premios</div>
           </div>
        </div>
      </section>

      {/* Subtle Legal Services Section */}
      <section className="space-y-12 px-4">
        <div className="flex items-center gap-6">
          <div className="h-14 w-1.5 bg-cyan-500 rounded-full shadow-[0_0_20px_#00F6FF]" />
          <div>
            <h2 className="text-4xl font-orbitron font-black uppercase tracking-tight">Servicios <span className="text-slate-500">Corporativos</span></h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Excelencia en cada expediente</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {LEGAL_SERVICES.map(service => (
            <div key={service.id} className="glass-card p-10 rounded-[40px] flex flex-col group relative overflow-hidden h-[340px]">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 mb-8 border border-white/10 group-hover:bg-cyan-500 group-hover:text-[#0B0E14] transition-all">
                {service.icon === 'Shield' && <Shield size={32} />}
                {service.icon === 'Gavel' && <Gavel size={32} />}
                {service.icon === 'Briefcase' && <Briefcase size={32} />}
                {service.icon === 'Users' && <Scale size={32} />}
              </div>
              <h3 className="text-2xl font-orbitron font-black mb-4 uppercase leading-none tracking-tight">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-3">{service.description}</p>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Premium Service</span>
                <span className="text-cyan-400 font-orbitron font-bold">${service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Casino Preview - High End Carousel Style */}
      <section className="space-y-12">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="h-14 w-1.5 bg-yellow-500 rounded-full shadow-[0_0_20px_#EAB308]" />
            <div>
              <h2 className="text-4xl font-orbitron font-black uppercase tracking-tight">VIP <span className="text-slate-500">Casino</span></h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Multiplica tu éxito</p>
            </div>
          </div>
          <button className="px-8 py-3 glass-panel border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Explorar Todo
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {MOCK_GAMES.map(game => (
            <div key={game.id} className="glass-panel rounded-[50px] overflow-hidden group border border-white/5 hover:border-yellow-500/40 transition-all duration-500 cursor-pointer">
              <div className="relative h-56">
                <img src={game.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={game.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent opacity-80" />
                <div className="absolute top-6 left-6 flex gap-2">
                   {game.isPremium && <div className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest">VIP</div>}
                   <div className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1"><TrendingUp size={10} /> {game.rtp}</div>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{game.category}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400"><Trophy size={12} /> {game.popularity}% Pop.</div>
                </div>
                <h3 className="text-2xl font-orbitron font-black uppercase">{game.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{game.description}</p>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-yellow-500 group-hover:text-black transition-all font-orbitron font-black text-xs">JUGAR</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exclusive Club Banner */}
      <section className="mx-4 relative overflow-hidden rounded-[60px] glass-panel border border-white/10 p-16 flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10">
        <div className="space-y-6 max-w-2xl">
           <div className="flex items-center gap-2 text-yellow-500">
             <Sparkles size={24} />
             <span className="text-sm font-black uppercase tracking-[0.4em]">Membresía Supreme</span>
           </div>
           <h2 className="text-5xl font-orbitron font-black uppercase tracking-tighter">Únete al Círculo <span className="text-cyan-400">Exclusivo</span> de Wilson Ipiales</h2>
           <p className="text-slate-400 text-lg leading-relaxed">Beneficios legales ilimitados, acceso a eventos corporativos privados y las mejores cuotas en nuestro casino digital.</p>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <button className="px-12 py-5 bg-cyan-500 text-[#0B0E14] font-orbitron font-black rounded-2xl shadow-2xl hover:bg-cyan-400 transition-all text-lg">SOLICITAR ACCESO</button>
          <button className="px-12 py-5 glass-panel border border-white/10 text-white font-orbitron font-black rounded-2xl transition-all text-lg hover:bg-white/5">SABER MÁS</button>
        </div>
      </section>
    </div>
  );
};
