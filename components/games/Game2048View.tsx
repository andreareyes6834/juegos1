import React, { useEffect, useState } from 'react';
import type { Game2048Adapter } from '../../games/Game2048Adapter';

function tileClass(v: number): string {
  if (!v) return 'bg-white/5 text-slate-500';
  if (v <= 8) return 'bg-white/10 text-white';
  if (v <= 32) return 'bg-cyan-500/30 text-cyan-200';
  if (v <= 128) return 'bg-cyan-500/50 text-white';
  if (v <= 512) return 'bg-purple-500/50 text-white';
  if (v <= 2048) return 'bg-yellow-500/60 text-black';
  return 'bg-yellow-500 text-black';
}

export function Game2048View({ adapter }: { adapter: Game2048Adapter }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onScore = () => setTick(t => t + 1);
    adapter.on('scoreUpdate', onScore);
    adapter.on('stateChange', onScore);
    return () => {
      adapter.off('scoreUpdate', onScore);
      adapter.off('stateChange', onScore);
    };
  }, [adapter]);

  const grid = adapter.getGrid();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="p-8 bg-black/40 rounded-[40px] border border-white/10">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 88px))' }} aria-label={`tick-${tick}`}>
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className={`w-[88px] h-[88px] rounded-2xl flex items-center justify-center font-orbitron font-black text-2xl ${tileClass(v)}`}
            >
              {v ? v : ''}
            </div>
          ))}
        </div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em] mt-6 text-center">
          Usa flechas para mover
        </div>
      </div>
    </div>
  );
}
