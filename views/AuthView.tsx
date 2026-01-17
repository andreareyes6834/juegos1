import React, { useState } from 'react';
import { Lock, UserPlus, LogIn } from 'lucide-react';
import type { Session } from '../core/LocalAuth';
import * as LocalAuth from '../core/LocalAuth';

export function AuthView({ onAuthenticated }: { onAuthenticated: (s: Session) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const session = mode === 'login'
        ? await LocalAuth.login(username, password)
        : await LocalAuth.register(username, password);
      onAuthenticated(session);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex items-center justify-center p-10">
      <div className="w-full max-w-xl glass-panel rounded-[50px] border border-white/10 p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-cyan-600/10 blur-[160px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-purple-600/10 blur-[160px] rounded-full" />

        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-3">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.45em]">Localhost • Usuario final</div>
            <h1 className="text-5xl font-orbitron font-black uppercase tracking-tighter">Acceso</h1>
            <p className="text-slate-500">Regístrate o inicia sesión para guardar progreso y jugar.</p>
          </div>

          <div className="space-y-5">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Usuario"
              className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-center font-mono text-lg focus:border-cyan-500 outline-none text-white"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                type="password"
                className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-6 py-4 text-center font-mono text-lg focus:border-cyan-500 outline-none text-white"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 font-bold text-center">{error}</div>
            )}

            <button
              disabled={busy}
              onClick={submit}
              className="w-full py-5 bg-cyan-500 text-[#0B0E14] font-orbitron font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(0,246,255,0.2)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARME'}
            </button>

            <button
              onClick={() => setMode(m => (m === 'login' ? 'register' : 'login'))}
              className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
            >
              {mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
            </button>

            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.35em] text-center">
              Datos guardados en este navegador
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
