
import React from 'react';
/* Added FileText to the imports from lucide-react */
import { Check, Sparkles, Download, Star, Gem, Coins, CreditCard, ShoppingCart, FileText } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../constants';
import { UserProfile } from '../types';

interface StoreViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const StoreView: React.FC<StoreViewProps> = ({ user, setUser }) => {
  const tokenPackages = [
    { id: 't1', type: 'GEMS', amount: 100, price: 9.99, bonus: '+500 Coins' },
    { id: 't2', type: 'GEMS', amount: 500, price: 39.99, bonus: '+3000 Coins', popular: true },
    { id: 't3', type: 'GEMS', amount: 1200, price: 79.99, bonus: '+10000 Coins' },
  ];

  const handlePurchase = (p: any) => {
    alert(`Iniciando checkout por ${p.amount} ${p.type}...`);
  };

  return (
    <div className="space-y-20 py-10 max-w-7xl mx-auto">
      <div className="text-center space-y-6">
        <h1 className="text-7xl font-orbitron font-black uppercase tracking-tighter">
          CENTRO DE <span className="text-cyan-400">PAGOS</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">Suscripciones profesionales y recargas de economía digital.</p>
      </div>

      {/* Subscription Plans */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 bg-cyan-500 rounded-full" />
          <h2 className="text-3xl font-orbitron font-black uppercase">Planes Profesionales</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map(plan => (
            <div key={plan.id} className={`glass-card p-12 rounded-[50px] border flex flex-col relative group hover:scale-[1.02] transition-all duration-300 ${plan.isPopular ? 'border-cyan-500/40 shadow-[0_0_50px_rgba(0,246,255,0.1)]' : 'border-white/5'}`}>
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-[#0B0E14] text-[10px] font-black uppercase tracking-[0.3em] px-8 py-2 rounded-full shadow-xl">
                  Más Popular
                </div>
              )}
              <h3 className="text-3xl font-orbitron font-black mb-2 uppercase text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-10 border-b border-white/5 pb-8">
                <span className="text-4xl font-orbitron font-black text-slate-300">$</span>
                <span className="text-7xl font-orbitron font-black text-white">{plan.price}</span>
                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest ml-2">/ mes</span>
              </div>
              
              <ul className="space-y-5 mb-12 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    <div className="mt-1 text-cyan-400"><Check size={20} strokeWidth={3} /></div>
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-6 rounded-2xl font-orbitron font-black text-lg transition-all shadow-lg ${plan.isPopular ? 'bg-cyan-500 text-[#0B0E14] hover:bg-cyan-400' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                SUSCRIBIRSE
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Gem & Coin Packages */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 bg-purple-500 rounded-full" />
          <h2 className="text-3xl font-orbitron font-black uppercase">Bóveda de <span className="text-purple-400">Gemas</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tokenPackages.map(pkg => (
            <div key={pkg.id} className="glass-panel p-8 rounded-[40px] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col items-center text-center gap-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all" />
                <Gem size={64} className="text-purple-400 relative z-10" />
              </div>
              <div>
                <div className="text-4xl font-orbitron font-black text-white">{pkg.amount} GEMS</div>
                <div className="text-xs font-black text-yellow-500 uppercase tracking-widest mt-1">{pkg.bonus}</div>
              </div>
              <button 
                onClick={() => handlePurchase(pkg)}
                className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-2xl font-orbitron font-black transition-all flex items-center justify-center gap-3"
              >
                <CreditCard size={20} /> ${pkg.price}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Digital Assets */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 bg-yellow-500 rounded-full" />
          <h2 className="text-3xl font-orbitron font-black uppercase">Biblioteca <span className="text-yellow-500">Digital</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="glass-panel p-10 rounded-[40px] border border-white/5 flex flex-col sm:flex-row gap-10 items-center group">
              <div className="w-40 h-56 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex-shrink-0 flex flex-col items-center justify-center p-6 text-center group-hover:scale-105 transition-transform">
                <FileText size={48} className="mb-4 text-white/40" />
                <span className="font-orbitron font-black text-xs leading-tight">CÓDIGO INTEGRAL PENAL 2024</span>
              </div>
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h4 className="text-2xl font-orbitron font-black uppercase">Manual Procesos Penales</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Guía completa actualizada para el profesional del derecho en Ecuador.</p>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Gem size={18} className="text-purple-400" />
                    <span className="text-2xl font-orbitron font-black text-white">45</span>
                  </div>
                  <button className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B0E14] px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <Download size={18} /> Canjear
                  </button>
                </div>
              </div>
           </div>
           
           <div className="glass-panel p-10 rounded-[40px] border border-white/5 flex flex-col sm:flex-row gap-10 items-center group">
              <div className="w-40 h-56 bg-gradient-to-br from-purple-600 to-pink-900 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex-shrink-0 flex flex-col items-center justify-center p-6 text-center group-hover:scale-105 transition-transform">
                <ShoppingCart size={48} className="mb-4 text-white/40" />
                <span className="font-orbitron font-black text-xs leading-tight">PACK MINUTAS CIVILES</span>
              </div>
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h4 className="text-2xl font-orbitron font-black uppercase">Formatos de Contrato</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Modelos de compraventa, arrendamiento y minutas judiciales listas para usar.</p>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Gem size={18} className="text-purple-400" />
                    <span className="text-2xl font-orbitron font-black text-white">80</span>
                  </div>
                  <button className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B0E14] px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <Download size={18} /> Canjear
                  </button>
                </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
