
import React, { useState, useEffect } from 'react';
/* Added Shield to the imports from lucide-react */
import { Gamepad2, Play, Trophy, Zap, ChevronLeft, ChevronRight, Star, Gem, Coins, TrendingUp, Info, Shield } from 'lucide-react';
import { MOCK_GAMES } from '../constants';
import { Game } from '../types';

interface GameCenterViewProps {
  onPlayGame: (game: Game) => void;
}

export const GameCenterView: React.FC<GameCenterViewProps> = ({ onPlayGame }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextGame = () => setActiveIndex((prev) => (prev + 1) % MOCK_GAMES.length);
  const prevGame = () => setActiveIndex((prev) => (prev - 1 + MOCK_GAMES.length) % MOCK_GAMES.length);

  return (
    <div className="space-y-16 py-12 min-h-[90vh] flex flex-col justify-center relative">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="text-center space-y-6 relative z-10">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="px-6 py-2 glass-panel border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Wilson Ipiales • VIP Casino
          </div>
          <h1 className="text-7xl font-orbitron font-black uppercase tracking-tighter leading-none">
            SUPREME <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">LOUNGE</span>
          </h1>
        </div>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light tracking-wide">
          Excelencia lúdica con la mayor tasa de retorno del mercado judicial.
        </p>
      </div>

      {/* High-Fidelity PS5 Style Horizontal Carousel */}
      <div className="relative flex items-center justify-center h-[550px] mt-10">
        {/* Navigation Buttons */}
        <div className="absolute left-10 lg:left-24 z-30">
          <button onClick={prevGame} className="p-5 rounded-full glass-panel border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all text-white group">
            <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="flex items-center gap-12 overflow-visible px-20 perspective-1000 h-full">
          {MOCK_GAMES.map((game, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + MOCK_GAMES.length) % MOCK_GAMES.length;
            const isNext = index === (activeIndex + 1) % MOCK_GAMES.length;

            let styles = "transition-all duration-700 transform scale-75 opacity-10 blur-sm pointer-events-none grayscale";
            if (isActive) styles = "transition-all duration-700 transform scale-110 opacity-100 z-20 shadow-[0_40px_100px_rgba(0,0,0,0.8)] grayscale-0 translate-y-[-20px]";
            if (isPrev) styles = "transition-all duration-700 transform scale-90 opacity-40 z-10 blur-none -rotate-y-12 translate-x-10";
            if (isNext) styles = "transition-all duration-700 transform scale-90 opacity-40 z-10 blur-none rotate-y-12 -translate-x-10";

            return (
              <div 
                key={game.id} 
                className={`glass-panel w-[480px] rounded-[60px] overflow-hidden border border-white/10 flex-shrink-0 relative ${styles}`}
              >
                {/* Game Banner */}
                <div className="relative h-64 overflow-hidden">
                  <img src={game.image} className="w-full h-full object-cover" alt={game.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-8 left-8 flex flex-col gap-3">
                    {game.isPremium && (
                      <span className="px-4 py-1.5 bg-yellow-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl flex items-center gap-2 w-fit">
                        <Gem size={14} /> VIP CLUB
                      </span>
                    )}
                    <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl flex items-center gap-2 w-fit border border-white/10">
                      <TrendingUp size={14} className="text-green-400" /> RTP {game.rtp}
                    </span>
                  </div>
                </div>
                
                {/* Game Info Body */}
                <div className="p-10 space-y-8 bg-gradient-to-b from-transparent to-black/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2 block">{game.category}</span>
                      <h3 className="text-4xl font-orbitron font-black uppercase text-white tracking-tighter">{game.title}</h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Buy-In</div>
                      <div className="flex items-center gap-2 text-yellow-500 font-orbitron font-black text-2xl">
                        <Coins size={20} /> {game.minBet.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Volatility</span>
                      <span className={`text-xs font-bold uppercase ${game.volatility === 'High' ? 'text-red-500' : game.volatility === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {game.volatility}
                      </span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Win Rate</span>
                      <span className="text-xs font-bold text-white uppercase">{game.popularity}%</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => isActive && onPlayGame(game)}
                    className="w-full py-6 bg-white text-[#0B0E14] font-orbitron font-black rounded-[28px] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all transform active:scale-95 text-lg group-hover:bg-cyan-400"
                  >
                    <Play size={24} fill="currentColor" /> INICIAR SESIÓN
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute right-10 lg:right-24 z-30">
          <button onClick={nextGame} className="p-5 rounded-full glass-panel border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all text-white group">
            <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer Info / Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 lg:px-24">
        {[
          { icon: <Shield className="text-green-500" />, title: 'Fair Play', desc: 'RNG Certificado' },
          { icon: <Gem className="text-purple-500" />, title: 'VIP Rewards', desc: 'Cashback Semanal' },
          { icon: <Zap className="text-cyan-500" />, title: 'Instant Pay', desc: 'Retiros en 24h' },
          { icon: <Info className="text-slate-400" />, title: 'Responsabilidad', desc: 'Juego Seguro' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-5 border-l border-white/5 pl-8">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-black uppercase text-white tracking-wider">{item.title}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
