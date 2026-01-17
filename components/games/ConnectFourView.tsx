import React, { useEffect, useState } from 'react';
import type { ConnectFourAdapter } from '../../games/ConnectFourAdapter';

export function ConnectFourView({ adapter }: { adapter: ConnectFourAdapter }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onAny = () => setTick(t => t + 1);
    adapter.on('stateChange', onAny);
    adapter.on('scoreUpdate', onAny);
    adapter.on('gameOver', onAny);
    return () => {
      adapter.off('stateChange', onAny);
      adapter.off('scoreUpdate', onAny);
      adapter.off('gameOver', onAny);
    };
  }, [adapter]);

  const board = adapter.getBoard();
  const current = adapter.getCurrentPlayer();
  const winner = adapter.getWinner();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center" aria-label={`tick-${tick}`}>
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.35em]">Turno</div>
        <div className="text-3xl font-orbitron font-black text-white">
          {winner ? (winner === 'DRAW' ? 'EMPATE' : `GANA ${winner}`) : current}
        </div>
      </div>

      <div className="flex gap-3">
        {Array.from({ length: board[0]?.length ?? 7 }).map((_, col) => (
          <button
            key={col}
            onClick={() => adapter.drop(col)}
            className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
          >
            {col + 1}
          </button>
        ))}
      </div>

      <div className="p-6 bg-black/40 rounded-[40px] border border-white/10">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${board[0]?.length ?? 7}, minmax(0, 44px))` }}>
          {board.flatMap((row, y) =>
            row.map((cell, x) => {
              const base = 'w-[44px] h-[44px] rounded-full border border-white/10 bg-white/5';
              const cls = cell === 'R' ? `${base} bg-yellow-500` : cell === 'Y' ? `${base} bg-cyan-500` : base;
              return <div key={`${x}:${y}`} className={cls} />;
            })
          )}
        </div>
      </div>
    </div>
  );
}
