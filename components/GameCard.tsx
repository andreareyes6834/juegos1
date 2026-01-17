
import React from 'react';
import { Play, TrendingUp, Gem } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="perspective-1000 group">
      <div className="relative glass-card rounded-2xl overflow-hidden preserve-3d h-full">
        {/* Card Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={game.image} 
            alt={game.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-60" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {game.isPremium && (
              <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <Gem size={10} /> Premium
              </span>
            )}
            {game.popularity > 90 && (
              <span className="px-2 py-0.5 bg-cyan-500 text-[#0B0E14] text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <TrendingUp size={10} /> Hot
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-orbitron font-bold text-lg text-slate-100 group-hover:text-cyan-400 transition-colors">
              {game.title}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{game.category}</span>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {game.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Min Bet</span>
              <span className="font-orbitron text-sm font-bold text-yellow-500">{game.minBet} COINS</span>
            </div>
            
            <button className="bg-cyan-500 hover:bg-cyan-400 text-[#0B0E14] p-3 rounded-xl shadow-lg transition-all transform group-hover:scale-110 active:scale-95 flex items-center justify-center">
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Overlay Hover Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
};
