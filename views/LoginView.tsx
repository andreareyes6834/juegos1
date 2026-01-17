import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { userManager } from '../core/UserManager';

interface LoginViewProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
}

export function LoginView({ onLogin, onRegister }: LoginViewProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await userManager.login(usernameOrEmail, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-[40px] border border-white/10 p-8 relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-cyan-600/10 blur-[160px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-purple-600/10 blur-[160px] rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-[20px] flex items-center justify-center text-cyan-400 mx-auto mb-4">
                <User size={32} />
              </div>
              <h1 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter">
                Iniciar Sesión
              </h1>
              <p className="text-slate-500 mt-2">Bienvenido de nuevo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Usuario o Email
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Ingresa tu usuario o email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-cyan-500 text-[#0B0E14] font-orbitron font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(0,246,255,0.2)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0B0E14] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={20} />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={onRegister}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} />
                ¿No tienes cuenta? Regístrate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
