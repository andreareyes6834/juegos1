
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { HomeView } from './views/HomeView';
import { StoreView } from './views/StoreView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { GameCenterView } from './views/GameCenterView';
import { GameShell } from './components/GameShell';
import { ViewState, UserProfile, Game } from './types';
import { INITIAL_PROFILE } from './constants';
import { platformEngine } from './core/PlatformEngine';
import { gameCatalog } from './core/GameCatalog';
import { AuthView } from './views/AuthView';
import * as LocalAuth from './core/LocalAuth';
import { loadUserState, saveUserState } from './core/PlatformPersistence';

const App: React.FC = () => {
  const [session, setSession] = useState<LocalAuth.Session | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('HOME');
  const [user, setUser] = useState<UserProfile>(INITIAL_PROFILE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const userId = session?.username ?? user.username;

  const syncUserFromEngine = () => {
    const progress = platformEngine.getProgress(userId);
    try {
      saveUserState(userId, platformEngine.exportUserState(userId));
    } catch {
    }
    setUser(prev => ({
      ...prev,
      coins: platformEngine.getCoins(userId),
      gems: platformEngine.getGems(userId),
      level: progress.level,
      xp: progress.xp,
      maxXp: progress.xpToNextLevel
    }));
  };

  useEffect(() => {
    setSession(LocalAuth.readSession());
  }, []);

  useEffect(() => {
    if (!session) return;

    setSelectedGame(null);
    setActiveView('HOME');

    const nextUser: UserProfile = {
      ...INITIAL_PROFILE,
      username: session.username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.username)}`
    };

    setUser(nextUser);

    const saved = loadUserState(session.username);
    platformEngine.initUser(session.username, {
      coins: INITIAL_PROFILE.coins,
      gems: INITIAL_PROFILE.gems,
      level: INITIAL_PROFILE.level,
      xp: INITIAL_PROFILE.xp,
      maxXp: INITIAL_PROFILE.maxXp
    });

    if (saved) {
      platformEngine.importUserState(session.username, saved);
    }
  }, [session?.username]);

  useEffect(() => {
    if (!session) return;
    syncUserFromEngine();
  }, [session?.username]);

  const handleLogout = () => {
    try {
      saveUserState(userId, platformEngine.exportUserState(userId));
    } catch {
    }
    LocalAuth.logout();
    setSession(null);
  };

  const handlePlayGame = (game: Game) => {
    if (!gameCatalog.has(game.id)) {
      alert('Este juego aún no está disponible.');
      return;
    }

    if (platformEngine.getCoins(userId) < game.minBet) {
      alert('Coins insuficientes. Juega otros niveles o compra gemas para canjear por coins.');
      return;
    }

    platformEngine.startGame(userId, game.id, game.minBet);
    syncUserFromEngine();
    setSelectedGame(game);
  };

  const handleReward = (score: number) => {
    if (!selectedGame) return;
    platformEngine.finishGame(userId, {
      gameId: selectedGame.id,
      score,
      difficulty: 'MEDIUM',
      won: true
    });
    syncUserFromEngine();
  };

  const renderView = () => {
    switch (activeView) {
      case 'HOME': return <HomeView />;
      case 'STORE': return <StoreView user={user} setUser={setUser} />;
      case 'PROFILE': return <ProfileView user={user} />;
      case 'ADMIN': return <AdminView />;
      case 'GAME_CENTER': return <GameCenterView onPlayGame={handlePlayGame} />;
      case 'CASES': 
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <h1 className="text-5xl font-orbitron font-black text-cyan-400 uppercase tracking-tighter">BÚSQUEDA DE PROCESOS</h1>
            <p className="text-slate-400 max-w-lg">Consulta en tiempo real la base de datos de la Función Judicial de Ecuador.</p>
            <div className="w-full max-w-2xl glass-panel p-10 rounded-[40px] border border-white/10 space-y-8">
               <input 
                 type="text" 
                 placeholder="Ej: 17204-2023-00123" 
                 className="w-full bg-black/40 border border-white/20 rounded-2xl px-8 py-5 text-center font-mono text-2xl focus:border-cyan-500 outline-none text-white shadow-inner" 
               />
               <button className="w-full py-5 bg-cyan-500 text-[#0B0E14] font-orbitron font-black rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,246,255,0.2)]">
                 EJECUTAR CONSULTA
               </button>
            </div>
          </div>
        );
      case 'BLOG':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 py-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card rounded-[40px] overflow-hidden group hover:border-cyan-500/30 transition-all">
                <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                   <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-all" />
                </div>
                <div className="p-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-500/10 rounded-full">Derecho Penal</span>
                    <span className="text-[10px] text-slate-500 font-bold">12 OCT 2024</span>
                  </div>
                  <h3 className="text-2xl font-orbitron font-black group-hover:text-cyan-400 transition-colors uppercase leading-tight">Reforma al COIP 2024: Análisis Crítico</h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">Exploramos las implicaciones de las nuevas penas y procedimientos de flagrancia en el sistema ecuatoriano.</p>
                  <button className="text-sm font-bold text-white underline underline-offset-8 decoration-cyan-500 pt-4">Leer Artículo Completo</button>
                </div>
              </div>
            ))}
          </div>
        );
      default: return <HomeView />;
    }
  };

  if (!session) {
    return <AuthView onAuthenticated={(s) => setSession(s)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        isOpen={isSidebarOpen}
        toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <TopNav user={user} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
          {/* Background Ambient Glows */}
          <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/5 blur-[160px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[160px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-[1400px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      {selectedGame && (
        <GameShell 
          game={selectedGame} 
          onExit={() => setSelectedGame(null)} 
          onReward={handleReward}
        />
      )}
    </div>
  );
};

export default App;
