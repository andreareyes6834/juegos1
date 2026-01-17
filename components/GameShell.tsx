
import React, { useEffect, useMemo, useRef, useState } from 'react';
/* Added Gamepad2 and Trophy to the imports from lucide-react */
import { X, Maximize, Settings, Pause, Play, RotateCcw, Coins, ShieldCheck, Gem, Gamepad2, Trophy } from 'lucide-react';
import { Game, GameState } from '../types';
import { gameCatalog } from '../core/GameCatalog';
import { GameState as AdapterState, type GameAdapter, type GameConfig } from '../core/GameAdapter';
import { SnakeGameView } from './games/SnakeGameView';
import { Game2048View } from './games/Game2048View';
import { PongGameView } from './games/PongGameView';
import { TicTacToeView } from './games/TicTacToeView';
import { ConnectFourView } from './games/ConnectFourView';
import { MemoryGameView } from './games/MemoryGameView';
import { SnakeGameAdapter } from '../games/SnakeGameAdapter';
import { Game2048Adapter } from '../games/Game2048Adapter';
import { PongGameAdapter } from '../games/PongGameAdapter';
import { TicTacToeAdapter } from '../games/TicTacToeAdapter';
import { ConnectFourAdapter } from '../games/ConnectFourAdapter';
import { MemoryGameAdapter } from '../games/MemoryGameAdapter';

interface GameShellProps {
  game: Game;
  onExit: () => void;
  onReward: (coins: number) => void;
}

export const GameShell: React.FC<GameShellProps> = ({ game, onExit, onReward }) => {
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [score, setScore] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const adapterRef = useRef<GameAdapter | null>(null);
  const rewardedRef = useRef(false);

  const adapterConfig: GameConfig = useMemo(
    () => ({
      difficulty: 'MEDIUM',
      soundEnabled: true,
      musicEnabled: true,
      fps: 60
    }),
    []
  );

  const mapAdapterStateToShell = (s: AdapterState): GameState => {
    if (s === AdapterState.LOADING) return 'LOADING';
    if (s === AdapterState.READY) return 'READY';
    if (s === AdapterState.PLAYING) return 'PLAYING';
    if (s === AdapterState.PAUSED) return 'PAUSED';
    if (s === AdapterState.FINISHED) return 'FINISHED';
    if (s === AdapterState.EXIT) return 'EXIT';
    return 'INIT';
  };

  useEffect(() => {
    let cancelled = false;
    rewardedRef.current = false;
    setGameState('LOADING');
    setScore(0);
    setSecondsElapsed(0);

    const adapter = gameCatalog.create(game.id);
    adapterRef.current = adapter;

    const onState = (s?: any) => {
      if (cancelled) return;
      if (s) setGameState(mapAdapterStateToShell(s as AdapterState));
    };

    const onScoreUpdate = (newScore?: any) => {
      if (cancelled) return;
      if (typeof newScore === 'number') setScore(newScore);
      else setScore(adapter.getScore());
    };

    const onGameOver = () => {
      if (cancelled) return;
      setGameState('FINISHED');
      const finalScore = adapter.getScore();
      setScore(finalScore);
      if (!rewardedRef.current) {
        rewardedRef.current = true;
        onReward(finalScore);
      }
    };

    adapter.on('stateChange', onState);
    adapter.on('scoreUpdate', onScoreUpdate);
    adapter.on('gameOver', onGameOver);

    (async () => {
      await adapter.init(adapterConfig);
      if (cancelled) return;
      setGameState(mapAdapterStateToShell(adapter.getState()));
      setScore(adapter.getScore());
    })();

    return () => {
      cancelled = true;
      adapter.off('stateChange', onState);
      adapter.off('scoreUpdate', onScoreUpdate);
      adapter.off('gameOver', onGameOver);
      try {
        adapter.destroy();
      } catch {
      }
      if (adapterRef.current === adapter) {
        adapterRef.current = null;
      }
    };
  }, [game.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const a = adapterRef.current;
      if (!a) return;
      try {
        const stats = a.getStats();
        if (typeof stats?.timeElapsed === 'number') {
          setSecondsElapsed(Math.floor(stats.timeElapsed));
        }
      } catch {
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const a = adapterRef.current;
      if (!a) return;

      if (game.id === 'snake') {
        const snake = a as SnakeGameAdapter;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') snake.setDirection('UP');
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') snake.setDirection('DOWN');
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') snake.setDirection('LEFT');
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') snake.setDirection('RIGHT');
      }

      if (game.id === 'pong') {
        const pong = a as PongGameAdapter;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') pong.setInput({ up: true });
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') pong.setInput({ down: true });
      }

      if (game.id === '2048') {
        const g = a as Game2048Adapter;
        if (e.key === 'ArrowUp') g.move('UP');
        if (e.key === 'ArrowDown') g.move('DOWN');
        if (e.key === 'ArrowLeft') g.move('LEFT');
        if (e.key === 'ArrowRight') g.move('RIGHT');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const a = adapterRef.current;
      if (!a) return;

      if (game.id === 'pong') {
        const pong = a as PongGameAdapter;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') pong.setInput({ up: false });
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') pong.setInput({ down: false });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [game.id]);

  const start = () => {
    const a = adapterRef.current;
    if (!a) return;
    a.start();
    setGameState(mapAdapterStateToShell(a.getState()));
  };

  const pause = () => {
    const a = adapterRef.current;
    if (!a) return;
    a.pause();
    setGameState(mapAdapterStateToShell(a.getState()));
  };

  const resume = () => {
    const a = adapterRef.current;
    if (!a) return;
    a.resume();
    setGameState(mapAdapterStateToShell(a.getState()));
  };

  const restart = async () => {
    const a = adapterRef.current;
    if (!a) return;
    rewardedRef.current = false;
    setGameState('LOADING');
    setScore(0);
    setSecondsElapsed(0);
    a.destroy();
    const newAdapter = gameCatalog.create(game.id);
    adapterRef.current = newAdapter;

    const onState = (s?: any) => s && setGameState(mapAdapterStateToShell(s as AdapterState));
    const onScoreUpdate = (newScore?: any) => setScore(typeof newScore === 'number' ? newScore : newAdapter.getScore());
    const onGameOver = () => {
      setGameState('FINISHED');
      const finalScore = newAdapter.getScore();
      setScore(finalScore);
      if (!rewardedRef.current) {
        rewardedRef.current = true;
        onReward(finalScore);
      }
    };

    newAdapter.on('stateChange', onState);
    newAdapter.on('scoreUpdate', onScoreUpdate);
    newAdapter.on('gameOver', onGameOver);

    await newAdapter.init(adapterConfig);
    setGameState(mapAdapterStateToShell(newAdapter.getState()));
    setScore(newAdapter.getScore());
  };

  const renderRealGame = () => {
    const a = adapterRef.current;
    if (!a) return null;

    if (game.id === 'snake') return <SnakeGameView adapter={a as SnakeGameAdapter} />;
    if (game.id === '2048') return <Game2048View adapter={a as Game2048Adapter} />;
    if (game.id === 'pong') return <PongGameView adapter={a as PongGameAdapter} />;
    if (game.id === 'tictactoe') return <TicTacToeView adapter={a as TicTacToeAdapter} />;
    if (game.id === 'connect4') return <ConnectFourView adapter={a as ConnectFourAdapter} />;
    if (game.id === 'memory') return <MemoryGameView adapter={a as MemoryGameAdapter} />;

    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0E14]/95 backdrop-blur-3xl flex flex-col p-8 animate-in fade-in zoom-in duration-500">
      {/* VIP Shell Header */}
      <div className="flex items-center justify-between mb-10 px-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10 shadow-2xl">
            <Play size={32} fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-orbitron font-black uppercase text-white tracking-tighter leading-none">{game.title}</h2>
              <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest">VIP SESSION</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Secure Crystal Engine v4.2 • Certified Fair Play</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12 glass-panel px-16 py-4 rounded-[30px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Win Accumulator</div>
            <div className="text-4xl font-orbitron font-black text-white">{score.toLocaleString()} <span className="text-yellow-500 text-lg">Coins</span></div>
          </div>
          <div className="w-[1px] h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Session Timer</div>
            <div className="text-4xl font-orbitron font-black text-cyan-400">{secondsElapsed}s</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 border border-white/5 transition-all"><Settings size={24} /></button>
          <button onClick={onExit} className="p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 border border-red-500/20 transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest">
            <X size={20} /> FINALIZAR
          </button>
        </div>
      </div>

      {/* Luxury Game Surface */}
      <div className="flex-1 glass-panel rounded-[60px] border border-white/10 relative overflow-hidden flex items-center justify-center bg-[#0B0E14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,246,255,0.05),_transparent_70%)]" />
        
        {gameState === 'LOADING' && (
          <div className="text-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative">
              <div className="w-32 h-32 border-[10px] border-white/5 border-t-cyan-500 rounded-full animate-spin mx-auto" />
              <Gamepad2 size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter mb-2">Conectando con Servidor Central</h3>
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Cargando Activos de Alta Fidelidad...</p>
            </div>
          </div>
        )}

        {gameState === 'READY' && (
          <div className="text-center space-y-12 animate-in slide-in-from-bottom-20 duration-700 max-w-2xl relative z-10">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-[30px] flex items-center justify-center text-yellow-500 border border-yellow-500/20 mx-auto mb-10 rotate-12">
                <Gem size={48} />
              </div>
              <h3 className="text-7xl font-orbitron font-black text-white uppercase tracking-tighter leading-none">BIENVENIDO AL <br /> <span className="text-cyan-400">LOUNGE VIP</span></h3>
              <p className="text-slate-400 text-lg font-light leading-relaxed">Su sesión ha sido autenticada bajo el protocolo Wilson Ipiales. Se aplicarán tasas de retorno Supreme por ser Miembro Premium.</p>
            </div>
            <button 
              onClick={start}
              className="px-20 py-8 bg-white text-[#0B0E14] font-orbitron font-black text-2xl rounded-[32px] shadow-[0_30px_60px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105 active:scale-95"
            >
              EMPEZAR APUESTA
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-15 scale-110 blur-sm" alt="bg" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0E14]/40 to-[#0B0E14]" />
            <div className="relative z-10 w-full h-full p-10">
              <div className="w-full h-full glass-panel rounded-[50px] border border-white/10 overflow-hidden">
                <div className="w-full h-full p-6">
                  {renderRealGame()}
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button onClick={pause} className="bg-white/5 border border-white/10 backdrop-blur-md px-10 py-4 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all text-white">
                  <Pause size={18} /> PAUSA DEL SISTEMA
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl z-20 flex flex-col items-center justify-center gap-12 animate-in fade-in duration-300">
            <h3 className="text-8xl font-orbitron font-black text-white uppercase tracking-tighter">SISTEMA EN PAUSA</h3>
            <div className="flex gap-6">
              <button onClick={resume} className="px-14 py-6 bg-cyan-500 text-[#0B0E14] font-orbitron font-black rounded-3xl text-xl shadow-2xl">CONTINUAR</button>
              <button onClick={restart} className="px-14 py-6 bg-white/5 border border-white/20 text-white font-orbitron font-black rounded-3xl text-xl hover:bg-white/10 transition-all flex items-center gap-3">REINICIAR <RotateCcw size={20} /></button>
            </div>
          </div>
        )}

        {gameState === 'FINISHED' && (
          <div className="text-center space-y-12 animate-in zoom-in-95 duration-700 relative z-10 px-10">
            <div className="space-y-4">
              <div className="flex justify-center mb-8">
                 <div className="p-10 bg-yellow-500/10 rounded-[50px] border border-yellow-500/20 shadow-[0_0_80px_rgba(234,179,8,0.2)]">
                   <Trophy size={100} className="text-yellow-500 animate-bounce" />
                 </div>
              </div>
              <h3 className="text-8xl font-orbitron font-black text-white uppercase tracking-tighter">¡EL BANCO PAGA!</h3>
              <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm">Sesión Finalizada • Retorno Procesado</p>
            </div>
            
            <div className="glass-panel py-10 px-20 rounded-[40px] border border-white/10 inline-block bg-gradient-to-br from-yellow-500/10 to-transparent">
              <div className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px] mb-4">Score Final</div>
              <div className="text-8xl font-orbitron font-black text-yellow-500 flex items-center justify-center gap-8">
                <Coins size={80} className="shadow-2xl" /> {Math.floor(score).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={onExit}
                className="px-20 py-8 bg-white text-[#0B0E14] font-orbitron font-black text-2xl rounded-[32px] hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.1)]"
              >
                RETIRAR Y COBRAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controller Guide Overlay - Crystal Minimal Style */}
      <div className="mt-10 flex justify-center">
         <div className="glass-panel px-12 py-4 rounded-3xl border border-white/5 flex gap-16 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-orbitron font-black text-sm text-white">W</span>
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-orbitron font-black text-sm text-white">A</span>
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-orbitron font-black text-sm text-white">S</span>
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-orbitron font-black text-sm text-white">D</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Movimiento</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="flex items-center gap-4">
              <span className="px-6 py-2 bg-white/10 rounded-xl font-orbitron font-black text-sm text-white">SPACE</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acción de Apuesta</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-white/10 rounded-xl font-orbitron font-black text-sm text-white">ESC</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Panel de Pausa</span>
            </div>
         </div>
      </div>
    </div>
  );
};
