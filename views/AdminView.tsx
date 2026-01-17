
import React from 'react';
import { Users, DollarSign, Briefcase, FileText, TrendingUp, AlertCircle, PlusCircle, Search, Clock } from 'lucide-react';

export const AdminView: React.FC = () => {
  const stats = [
    { label: 'Ingresos Mensuales', value: '$12,450', change: '+18%', icon: <DollarSign className="text-green-400" /> },
    { label: 'Casos Activos', value: '42', change: '+3', icon: <Briefcase className="text-cyan-400" /> },
    { label: 'Suscripciones', value: '128', change: '+12', icon: <Users className="text-purple-400" /> },
    // Added Clock to imports to fix this line
    { label: 'Citas Hoy', value: '8', change: 'En curso', icon: <Clock className="text-yellow-400" /> },
  ];

  return (
    <div className="space-y-12 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-orbitron font-black uppercase">Panel <span className="text-cyan-400">Directivo</span></h1>
          <p className="text-slate-400">Bienvenido Abg. Wilson. Aquí tiene el resumen de operaciones.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-cyan-500 text-[#0B0E14] font-bold rounded-xl flex items-center gap-2 shadow-lg">
            <PlusCircle size={20} /> Nuevo Caso
          </button>
          <button className="px-6 py-3 glass-panel border border-white/10 text-white font-bold rounded-xl">
            Calendario
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-2xl">{s.icon}</div>
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{s.change}</span>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
            <div className="text-3xl font-orbitron font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases */}
        <div className="lg:col-span-2 glass-panel rounded-[32px] border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-orbitron font-bold uppercase">Expedientes Recientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Buscar expediente..." className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div className="p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-4">ID Causa</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-cyan-400">17294-2023-00{i}</td>
                    <td className="p-4">Cliente Ejemplo {i}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${i % 2 === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                        {i % 2 === 0 ? 'Audiencia' : 'Cerrado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-slate-400 hover:text-white transition-colors">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="glass-panel rounded-[32px] border border-white/5 p-8 space-y-6">
          <h3 className="font-orbitron font-bold uppercase">Alertas Críticas</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <div className="space-y-1">
                <div className="text-sm font-bold">Cita Expirada</div>
                <div className="text-xs text-slate-400">Cliente M. González no asistió a su reunión de las 10:00 AM.</div>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-4">
              {/* Added Clock to imports to fix this line */}
              <Clock className="text-yellow-500 shrink-0" size={20} />
              <div className="space-y-1">
                <div className="text-sm font-bold">Audiencia Mañana</div>
                <div className="text-xs text-slate-400">Unidad Judicial Norte - Causa 17204-2023.</div>
              </div>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex gap-4">
              <TrendingUp className="text-cyan-400 shrink-0" size={20} />
              <div className="space-y-1">
                <div className="text-sm font-bold">Nuevo Referido</div>
                <div className="text-xs text-slate-400">Carlos R. ha recomendado un nuevo cliente Premium.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
