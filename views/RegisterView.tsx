import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import { userManager } from '../core/UserManager';

interface RegisterViewProps {
  onRegister: (user: any) => void;
  onLogin: () => void;
}

export function RegisterView({ onRegister, onLogin }: RegisterViewProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await userManager.register(formData.username, formData.email, formData.password);
      onRegister(user);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: 'Muy débil', color: 'text-red-500' };
    if (password.length < 8) return { strength: 1, text: 'Débil', color: 'text-orange-500' };
    if (password.length < 10) return { strength: 2, text: 'Media', color: 'text-yellow-500' };
    if (password.length < 12) return { strength: 3, text: 'Fuerte', color: 'text-green-500' };
    return { strength: 4, text: 'Muy fuerte', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-[40px] border border-white/10 p-8 relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-cyan-600/10 blur-[160px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-purple-600/10 blur-[160px] rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-[20px] flex items-center justify-center text-cyan-400 mx-auto mb-4">
                <UserPlus size={32} />
              </div>
              <h1 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter">
                Crear Cuenta
              </h1>
              <p className="text-slate-500 mt-2">Únete a HB Games</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <UserPlus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Elige un nombre de usuario"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="tu@email.com"
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
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Crea una contraseña segura"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i <= passwordStrength.strength
                              ? passwordStrength.strength === 0
                                ? 'bg-red-500'
                                : passwordStrength.strength === 1
                                ? 'bg-orange-500'
                                : passwordStrength.strength === 2
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.color}`}>
                      Fortaleza: {passwordStrength.text}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Repite tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check size={16} className="text-green-500" />
                        <span className="text-xs text-green-500">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <X size={16} className="text-red-500" />
                        <span className="text-xs text-red-500">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || formData.password !== formData.confirmPassword}
                className="w-full py-4 bg-cyan-500 text-[#0B0E14] font-orbitron font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(0,246,255,0.2)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0B0E14] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={20} />
                    Crear Cuenta
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={onLogin}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} />
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
